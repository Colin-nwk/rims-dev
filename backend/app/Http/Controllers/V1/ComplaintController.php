<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use App\Models\ComplaintMessage;
use App\Models\Staff;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComplaintController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $staff = $request->user();
        
        $complaints = Complaint::with(['creator', 'messages'])
            ->where('created_by', $staff->id)
            ->filter($request->all())
            ->paginate($request->get('per_page', 15));

        return $this->collectionResponse($complaints);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'category' => 'required|in:Payroll,Leave,Workplace,IT,Other',
            'priority' => 'sometimes|in:low,medium,high,critical',
        ]);

        $staff = $request->user();

        $complaint = Complaint::create([
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'priority' => $validated['priority'] ?? 'medium',
            'status' => 'open',
            'created_by' => $staff->id,
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

        // Reopen if resolved and new message added
        if ($complaint->status === 'resolved') {
            $complaint->update(['status' => 'in-progress']);
        }

        $complaint->load(['creator', 'messages']);

        return $this->successResponse($complaint, 'Message sent successfully');
    }

    public function destroy(Complaint $complaint): JsonResponse
    {
        $complaint->delete();
        return $this->successResponse(null, 'Complaint deleted successfully');
    }
}
