<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\Staff;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Start building the query
        $query = Complaint::with(['creator', 'messages']);

        // Check if user has permission to view all complaints (scoped)
        // AND didn't explicitly ask for their own only
        if ($user->can('complaint.view') && ! $request->has('mine')) {
            // Apply Scope Limits based on User's Role
            // We filter based on the *creator's* location since Complaint doesn't have location columns

            // Check for Scoped Constraints (State, Zone, Prison)
            // If the user is restricted to a specific scope, enforce it.
            // If they are scopeless (Super Admin), no enforcement.

            // We need to resolve the effective scope of the user.
            // Since a user might have multiple roles, we take the most permissive?
            // Or typically, we restrict if *all* roles are restricted.
            // However, the Gate logic usually handles "Can I access this resource?".
            // For a list, we need to construct a query that matches "resources I can access".

            // Simplified Approach: Users usually have one primary role scope or mutually exclusive scopes.
            // We'll check the user's attributes directly if they have AuthorizesScopedAccess trait.

            // But wait, the Role defines the scope, not the User table directly (though trait reads User).
            // Let's rely on the user's `roles` relationship to find the widest scope?
            // Actually, the `AuthorizesScopedAccess` trait provided `getPrisonId` etc. based on the Model's attributes, not the Role pivot.
            // Checking `Staff` model: it has `prison`, `assigned_state`, `zone_id`.
            // So the Staff's location IS their scope.

            $prisonId = $user->prison ?? null; // Adjust if column name differs
            $stateId = $user->assigned_state ?? null;
            $zoneId = $user->zone_id ?? null;

            // If user is NOT scopeless (meaning they are restricted to their location)
            // We must filter the complaints.
            // But how do we know if they are "scopeless"?
            // We check if they have ANY role that is 'scopeless'.
            $isScopeless = $user->roles()->where('scopeless', true)->exists();

            if (! $isScopeless) {
                $query->whereHas('creator', function ($q) use ($prisonId, $stateId, $zoneId) {
                    if ($prisonId) {
                        $q->where('prison', $prisonId);
                    } elseif ($stateId) {
                        $q->where('assigned_state', $stateId);
                    } elseif ($zoneId) {
                        $q->where('zone_id', $zoneId);
                    }
                });
            }

            // Apply Requested Filters (e.g. Admin filtering by State/Zone)
            if ($request->has('state_id')) {
                $query->whereHas('creator', fn ($q) => $q->where('assigned_state', $request->state_id));
            }
            if ($request->has('zone_id')) {
                $query->whereHas('creator', fn ($q) => $q->where('zone_id', $request->zone_id));
            }
            if ($request->has('prison_id')) {
                $query->whereHas('creator', fn ($q) => $q->where('prison', $request->prison_id));
            }

        } else {
            // "Personal View": User has no permission OR asked for mine
            $query->where('created_by', $user->id);
        }

        // Apply General Filters (Status, Priority, etc.)
        $filters = $request->except(['mine', 'state_id', 'zone_id', 'prison_id', 'page', 'per_page']);
        $query->filter($filters);

        $complaints = $query->latest()->paginate($request->get('per_page', 15));

        return $this->collectionResponse($complaints);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|in:Payroll,Leave,Workplace,IT,Other',
            'priority' => 'sometimes|in:low,medium,high,critical',
        ]);

        $creator = $request->user();

        $complaint = Complaint::create([
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'open',
            'created_by' => $creator->id,
            'created_by_type' => get_class($creator),
        ]);

        $complaint->load(['creator', 'messages']);

        return $this->successResponse($complaint, 'Complaint created successfully', 201);
    }

    public function show(Complaint $complaint): JsonResponse
    {
        $complaint->load(['creator', 'messages']);

        return $this->successResponse($complaint);
    }

    public function updateStatus(Request $request, Complaint $complaint): JsonResponse
    {
        $this->authorize('complaint.resolve', $complaint);

        $validated = $request->validate([
            'status' => 'required|in:open,in-progress,resolved,escalated',
        ]);

        $complaint->update(['status' => $validated['status']]);
        $complaint->load(['creator', 'messages']);

        return $this->successResponse($complaint, 'Status updated successfully');
    }

    public function addMessage(Request $request, Complaint $complaint): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string',
            'is_internal' => 'sometimes|boolean',
        ]);

        $sender = $request->user();

        $message = $complaint->messages()->create([
            'sender_id' => $sender->id,
            'sender_type' => get_class($sender),
            'content' => $validated['content'],
            'is_internal' => $validated['is_internal'] ?? false,
        ]);

        // Update complaint timestamp
        $complaint->touch();

        // Auto-mark as in-progress when any reply is added to an open ticket
        if ($complaint->status === 'open') {
            $complaint->update(['status' => 'in-progress']);
        }

        // Reopen if resolved and new message added
        if ($complaint->status === 'resolved') {
            $complaint->update(['status' => 'in-progress']);
        }

        $complaint->load(['creator', 'messages']);

        return $this->successResponse($complaint, 'Message sent successfully');
    }

    public function destroy(Complaint $complaint): JsonResponse
    {
        $this->authorize('complaint.delete', $complaint);

        $complaint->delete();

        return $this->successResponse(null, 'Complaint deleted successfully');
    }

    /**
     * Store a public complaint (no authentication required)
     * Validates staff identity via service_no and ippis
     */
    public function storePublic(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'ippis' => 'required|string',
            'service_no' => 'required|string',
            'email' => 'nullable|email|max:255',
            'related_to' => 'required|string',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        // Verify staff exists with matching service_no AND ippis
        $staff = Staff::where('service_no', $validated['service_no'])
            ->where('ippis', $validated['ippis'])
            ->first();

        if (! $staff) {
            return $this->errorResponse('Staff record not found. Please verify your Service Number and IPPIS.', 404);
        }

        // Create complaint with staff as creator, status escalated
        $complaint = Complaint::create([
            'subject' => $validated['subject'],
            'category' => 'Other',
            'priority' => 'medium',
            'status' => 'escalated',
            'created_by' => $staff->id,
            'created_by_type' => Staff::class,
        ]);

        // Format the first message with all details
        $formattedMessage = $this->formatPublicComplaintMessage($validated);

        $complaint->messages()->create([
            'sender_id' => $staff->id,
            'sender_type' => Staff::class,
            'content' => $formattedMessage,
            'is_internal' => false,
        ]);

        $complaint->load(['creator', 'messages']);

        return $this->successResponse($complaint, 'Complaint submitted successfully', 201);
    }

    /**
     * Format the public complaint message with all form details
     */
    private function formatPublicComplaintMessage(array $data): string
    {
        // Sanitize all inputs to prevent XSS
        $sanitizedData = array_map('htmlspecialchars', $data);
        
        $fullName = trim("{$sanitizedData['first_name']} {$sanitizedData['other_names']} {$sanitizedData['last_name']}");

        $message = "<div style=\"margin-bottom: 16px;\">";
        $message .= "<p><strong>Contact Information:</strong></p>";
        $message .= "<ul style=\"margin: 8px 0; padding-left: 20px;\">";
        $message .= "<li><strong>Name:</strong> {$fullName}</li>";
        $message .= "<li><strong>Service Number:</strong> {$sanitizedData['service_no']}</li>";
        $message .= "<li><strong>IPPIS:</strong> {$sanitizedData['ippis']}</li>";

        if (! empty($sanitizedData['phone_number'])) {
            $message .= "<li><strong>Phone:</strong> {$sanitizedData['phone_number']}</li>";
        }
        if (! empty($sanitizedData['email'])) {
            $message .= "<li><strong>Email:</strong> {$sanitizedData['email']}</li>";
        }

        $message .= "</ul>";
        $message .= "<p><strong>Related To:</strong> {$sanitizedData['related_to']}</p>";
        $message .= "</div>";
        $message .= "<div style=\"border-top: 1px solid #e5e7eb; padding-top: 16px;\">";
        $message .= "<p><strong>Message:</strong></p>";
        $message .= $sanitizedData['message'];
        $message .= "</div>";

        return $message;
    }
}
