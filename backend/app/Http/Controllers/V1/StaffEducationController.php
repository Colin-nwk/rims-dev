<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffEducationRequest;
use App\Http\Requests\UpdateStaffEducationRequest;
use App\Models\StaffEducation;
use App\Traits\ApiResponseTrait;
use App\Traits\FileUploadTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StaffEducationController extends Controller
{
    use ApiResponseTrait, FileUploadTrait;

    /**
     * Check if the current user is a staff member (not admin)
     */
    private function isStaffUser(): bool
    {
        $user = request()->user();
        return $user instanceof \App\Models\Staff;
    }

    /**
     * Get the current staff user's service number
     */
    private function getStaffServiceNo(): ?string
    {
        $user = request()->user();
        if ($user instanceof \App\Models\Staff) {
            return $user->service_no;
        }
        return null;
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('staff-education.view');

        $query = StaffEducation::with('staff');

        // Staff users can only view their own records
        if ($this->isStaffUser()) {
            $query->where('service_no', $this->getStaffServiceNo());
        }

        // Filter by service number
        if ($request->has('service_no')) {
            $query->where('service_no', $request->service_no);
        }

        // Filter by institution (partial match)
        if ($request->has('institution')) {
            $query->where('institution', 'like', '%' . $request->institution . '%');
        }

        // Filter by course (partial match)
        if ($request->has('course')) {
            $query->where('course', 'like', '%' . $request->course . '%');
        }

        // Filter by education type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by start date range
        if ($request->has('start_date_from')) {
            $query->where('start_date', '>=', $request->start_date_from);
        }
        if ($request->has('start_date_to')) {
            $query->where('start_date', '<=', $request->start_date_to);
        }

        // Filter by end date range
        if ($request->has('end_date_from')) {
            $query->where('end_date', '>=', $request->end_date_from);
        }
        if ($request->has('end_date_to')) {
            $query->where('end_date', '<=', $request->end_date_to);
        }

        // Search across institution and course
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('institution', 'like', '%' . $search . '%')
                    ->orWhere('course', 'like', '%' . $search . '%');
            });
        }

        // Calculate stats for all records (before pagination)
        $statsQuery = clone $query;
        $withCertificate = (clone $statsQuery)->whereNotNull('url')->where('url', '!=', '')->count();
        $withoutCertificate = (clone $statsQuery)->where(function ($q) {
            $q->whereNull('url')->orWhere('url', '');
        })->count();

        // Sorting
        $sortField = $request->get('sort_by', 'start_date');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $educations = $query->paginate($perPage);

        // Add stats to the response
        $response = $educations->toArray();
        $response['stats'] = [
            'with_certificate' => $withCertificate,
            'without_certificate' => $withoutCertificate,
        ];

        return $this->collectionResponse($response);
    }

    public function store(StoreStaffEducationRequest $request): JsonResponse
    {
        $this->authorize('staff-education.create');

        try {
            $data = $request->validated();

            // Staff users can only create records for themselves
            if ($this->isStaffUser()) {
                $data['service_no'] = $this->getStaffServiceNo();
            }

            // Handle file upload for certificate/document
            if ($request->hasFile('url')) {
                $file = $request->file('url');
                $serviceNo = $data['service_no'];
                $type = $data['type'] ?? 'certificate';
                $timestamp = now()->timestamp;
                $filename = "{$serviceNo}_education_{$type}_{$timestamp}.{$file->getClientOriginalExtension()}";
                $path = $this->uploadFile($file, 'staff/education', 'public', $filename);
                $data['url'] = $path;
            }

            $education = StaffEducation::create($data);

            return $this->successResponse($education->load('staff'), 'Education record created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create education record: ' . $e->getMessage(), 500);
        }
    }

    public function show(StaffEducation $staffEducation): JsonResponse
    {
        $this->authorize('staff-education.view');

        // Staff users can only view their own records
        if ($this->isStaffUser() && $staffEducation->service_no !== $this->getStaffServiceNo()) {
            return $this->errorResponse('Unauthorized to view this record', 403);
        }

        return $this->successResponse($staffEducation->load('staff'));
    }

    public function update(UpdateStaffEducationRequest $request, StaffEducation $staffEducation): JsonResponse
    {
        $this->authorize('staff-education.edit');

        // Staff users can only edit their own records
        if ($this->isStaffUser() && $staffEducation->service_no !== $this->getStaffServiceNo()) {
            return $this->errorResponse('Unauthorized to edit this record', 403);
        }

        try {
            $data = $request->validated();

            // Staff users cannot change the service_no
            if ($this->isStaffUser()) {
                unset($data['service_no']);
            }

            // Handle file upload for certificate/document
            if ($request->hasFile('url')) {
                // Delete old file if it exists
                if ($staffEducation->url) {
                    $this->deleteFile($staffEducation->url);
                }

                $file = $request->file('url');
                $serviceNo = $data['service_no'] ?? $staffEducation->service_no;
                $type = $data['type'] ?? $staffEducation->type;
                $timestamp = now()->timestamp;
                $filename = "{$serviceNo}_education_{$type}_{$timestamp}.{$file->getClientOriginalExtension()}";
                $path = $this->uploadFile($file, 'staff/education', 'public', $filename);
                $data['url'] = $path;
            }

            $staffEducation->update($data);

            return $this->successResponse($staffEducation->load('staff'), 'Education record updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update education record: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(StaffEducation $staffEducation): JsonResponse
    {
        $this->authorize('staff-education.delete');

        // Staff users can only delete their own records
        if ($this->isStaffUser() && $staffEducation->service_no !== $this->getStaffServiceNo()) {
            return $this->errorResponse('Unauthorized to delete this record', 403);
        }

        try {
            // Delete associated file if it exists
            if ($staffEducation->url) {
                $this->deleteFile($staffEducation->url);
            }

            $staffEducation->delete();

            return $this->successResponse(null, 'Education record deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete education record: ' . $e->getMessage(), 500);
        }
    }

    /**
     * View certificate/document inline in browser
     * Public endpoint for viewing certificates
     */
    public function viewCertificate(StaffEducation $staffEducation)
    {
        try {
            // Check if certificate exists
            if (!$staffEducation->url) {
                return response()->json(['error' => 'No certificate found'], 404);
            }

            // Get the file path
            $filePath = $staffEducation->url;

            // Check if file exists in storage
            if (!Storage::disk('public')->exists($filePath)) {
                return response()->json(['error' => 'Certificate file not found'], 404);
            }

            // Get file contents
            $file = Storage::disk('public')->get($filePath);

            // Determine proper MIME type for inline viewing based on extension
            $extension = pathinfo($filePath, PATHINFO_EXTENSION);
            $contentType = match(strtolower($extension)) {
                'pdf' => 'application/pdf',
                'jpg', 'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                default => 'application/octet-stream',
            };

            // Return file response with inline disposition
            return response($file, 200)
                ->header('Content-Type', $contentType)
                ->header('Content-Disposition', 'inline; filename="' . basename($filePath) . '"')
                ->header('Cache-Control', 'public, max-age=31536000')
                ->header('X-Content-Type-Options', 'nosniff');

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load certificate: ' . $e->getMessage()], 500);
        }
    }
}
