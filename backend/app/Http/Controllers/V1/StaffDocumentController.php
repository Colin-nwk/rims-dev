<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffDocumentRequest;
use App\Http\Requests\UpdateStaffDocumentRequest;
use App\Models\StaffDocument;
use App\Services\ChangeRequestService;
use App\Services\StaffDocumentService;
use App\Traits\ApiResponseTrait;
use App\Traits\FileUploadTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StaffDocumentController extends Controller
{
    use ApiResponseTrait, FileUploadTrait;

    public function __construct(
        protected ChangeRequestService $changeRequestService,
        protected StaffDocumentService $staffDocumentService
    ) {}

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
        // Skip authorization for staff users (they can only see their own records anyway)
        if (! $this->isStaffUser()) {
            $this->authorize('staff-document.view');
        }

        // Prepare filters
        $filters = $request->all();

        // Staff users can only view their own records
        if ($this->isStaffUser()) {
            $filters['service_no'] = $this->getStaffServiceNo();
        }

        $documents = $this->staffDocumentService->all($filters);

        return $this->collectionResponse($documents);
    }

    public function store(StoreStaffDocumentRequest $request): JsonResponse
    {
        // Skip authorization for staff users (they can only create records for themselves)
        if (! $this->isStaffUser()) {
            $this->authorize('staff-document.create');
        }

        try {
            $data = $request->validated();

            // Staff users can only create records for themselves
            if ($this->isStaffUser()) {
                $data['service_no'] = $this->getStaffServiceNo();
                // Ensure verification_status is pending for staff uploads
                $data['verification_status'] = 'pending';
            }

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $serviceNo = $data['service_no'];
                $type = $data['document_type'];
                $timestamp = now()->timestamp;
                $filename = "{$serviceNo}_{$type}_{$timestamp}";

                // Use the file upload trait which handles unique naming
                $path = $this->uploadFile($file, 'staff/documents', 'public', $filename);

                $data['file_path'] = $path;
                $data['file_size'] = $file->getSize();
                $data['mime_type'] = $file->getMimeType();
                // Remove file object from data array
                unset($data['file']);
            }

            // Submit change request for approval
            $changeRequest = $this->changeRequestService->submit(
                'App\Models\StaffDocument',
                'CREATE',
                $data,
                $request->user(),
                $data['service_no']
            );

            return $this->successResponse($changeRequest, 'Document submitted for approval.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to submit document: '.$e->getMessage(), 500);
        }
    }

    public function show(StaffDocument $staffDocument): JsonResponse
    {
        // Staff validation
        if ($this->isStaffUser()) {
            if ($staffDocument->service_no !== $this->getStaffServiceNo()) {
                return $this->errorResponse('Unauthorized to view this record', 403);
            }
        } else {
            $this->authorize('staff-document.view');
        }

        return $this->successResponse($staffDocument->load(['staff', 'verifier']));
    }

    public function update(UpdateStaffDocumentRequest $request, StaffDocument $staffDocument): JsonResponse
    {
        // Staff validation
        if ($this->isStaffUser()) {
            if ($staffDocument->service_no !== $this->getStaffServiceNo()) {
                return $this->errorResponse('Unauthorized to edit this record', 403);
            }
        } else {
            $this->authorize('staff-document.edit');
        }

        try {
            $data = $request->validated();

            // Staff users cannot change key fields
            if ($this->isStaffUser()) {
                unset($data['service_no']);
                unset($data['verification_status']);
                unset($data['verified_by']);
                unset($data['verified_at']);
                unset($data['rejection_reason']);
            }

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $serviceNo = $staffDocument->service_no;
                $type = $data['document_type'] ?? $staffDocument->document_type;
                $timestamp = now()->timestamp;
                $filename = "{$serviceNo}_{$type}_{$timestamp}";

                $path = $this->uploadFile($file, 'staff/documents', 'public', $filename);

                $data['file_path'] = $path;
                $data['file_size'] = $file->getSize();
                $data['mime_type'] = $file->getMimeType();
                unset($data['file']);
            }

            // Submit change request for approval
            $changeRequest = $this->changeRequestService->submit(
                'App\Models\StaffDocument',
                'UPDATE',
                $data,
                $request->user(),
                $staffDocument->service_no,
                $staffDocument->id
            );

            return $this->successResponse($changeRequest, 'Document update submitted for approval.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to submit document update: '.$e->getMessage(), 500);
        }
    }

    public function destroy(StaffDocument $staffDocument): JsonResponse
    {
        // Staff validation
        if ($this->isStaffUser()) {
            if ($staffDocument->service_no !== $this->getStaffServiceNo()) {
                return $this->errorResponse('Unauthorized to delete this record', 403);
            }
        } else {
            $this->authorize('staff-document.delete');
        }

        try {
            $this->staffDocumentService->delete($staffDocument->id);

            return $this->successResponse(null, 'Document deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete document: '.$e->getMessage(), 500);
        }
    }

    /**
     * Verify a document (Admin only)
     */
    public function verify(StaffDocument $staffDocument): JsonResponse
    {
        $this->authorize('staff-document.verify');

        try {
            $document = $this->staffDocumentService->verify($staffDocument->id, request()->user());

            return $this->successResponse($document, 'Document verified successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to verify document: '.$e->getMessage(), 500);
        }
    }

    /**
     * Reject a document (Admin only)
     */
    public function reject(Request $request, StaffDocument $staffDocument): JsonResponse
    {
        $this->authorize('staff-document.verify');

        $request->validate(['reason' => 'required|string|max:1000']);

        try {
            $document = $this->staffDocumentService->reject($staffDocument->id, request()->user(), $request->reason);

            return $this->successResponse($document, 'Document rejected successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to reject document: '.$e->getMessage(), 500);
        }
    }

    /**
     * Securely view document inline
     */
    public function viewDocument(StaffDocument $staffDocument)
    {
        // Security check
        $user = request()->user();

        // If it's a staff user, they can only view their own
        if ($this->isStaffUser()) {
            if ($staffDocument->service_no !== $this->getStaffServiceNo()) {
                abort(403, 'Unauthorized to view this document');
            }
        }
        // If it's an admin/user, they need permission
        elseif ($user) {
            if ($user->cannot('staff-document.view') && $user->cannot('staff-document.verify')) {
                abort(403, 'Unauthorized to view this document');
            }
        }
        // No unauthenticated access allowed
        else {
            abort(401, 'Unauthenticated');
        }

        try {
            if (! Storage::disk('public')->exists($staffDocument->file_path)) {
                abort(404, 'Document file not found');
            }

            $file = Storage::disk('public')->get($staffDocument->file_path);

            return response($file, 200)
                ->header('Content-Type', $staffDocument->mime_type)
                ->header('Content-Disposition', 'inline; filename="'.$staffDocument->document_name.'"')
                ->header('Cache-Control', 'private, max-age=0, must-revalidate'); // Private cache only
        } catch (\Exception $e) {
            abort(500, 'Failed to retrieve document');
        }
    }

    /**
     * Securely download document
     */
    public function download(StaffDocument $staffDocument)
    {
        // Same security checks as view
        $user = request()->user();

        if ($this->isStaffUser()) {
            if ($staffDocument->service_no !== $this->getStaffServiceNo()) {
                abort(403, 'Unauthorized to download this document');
            }
        } elseif ($user) {
            if ($user->cannot('staff-document.view') && $user->cannot('staff-document.verify')) {
                abort(403, 'Unauthorized to download this document');
            }
        } else {
            abort(401, 'Unauthenticated');
        }

        if (! Storage::disk('public')->exists($staffDocument->file_path)) {
            abort(404, 'Document file not found');
        }

        return Storage::disk('public')->download($staffDocument->file_path, $staffDocument->document_name);
    }
}
