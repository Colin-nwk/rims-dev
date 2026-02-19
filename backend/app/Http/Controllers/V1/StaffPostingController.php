<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffPostingRequest;
use App\Http\Requests\UpdateStaffPostingRequest;
use App\Models\Staff;
use App\Models\StaffPosting;
use App\Services\ChangeRequestService;
use App\Services\StaffPostingService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class StaffPostingController extends Controller
{
    use ApiResponseTrait;

    protected $staffPostingService;
    protected $changeRequestService;

    public function __construct(
        StaffPostingService $staffPostingService,
        ChangeRequestService $changeRequestService
    ) {
        $this->staffPostingService = $staffPostingService;
        $this->changeRequestService = $changeRequestService;
    }

    /**
     * Check if the current user is a staff member (not admin)
     */
    private function isStaffUser(): bool
    {
        $user = request()->user();

        return $user instanceof Staff;
    }

    /**
     * Get the current staff user's service number
     */
    private function getStaffServiceNo(): ?string
    {
        $user = request()->user();
        if ($user instanceof Staff) {
            return $user->service_no;
        }

        return null;
    }

    /**
     * Display a listing of staff postings.
     */
    public function index(Request $request)
    {
        // Skip authorization for staff users (they can only see their own records anyway)
        if (! $this->isStaffUser()) {
            $this->authorize('staff-posting.view');
        }

        $postings = $this->staffPostingService->allWithRelationships($request->all());

        return $this->collectionResponse($postings);
    }

    /**
     * Display a listing of postings for a specific staff member.
     */
    public function indexByStaff(Request $request, string $serviceNo)
    {
        $staff = Staff::where('service_no', $serviceNo)->firstOrFail();

        // Allow staff to view their own postings without permission
        $user = $request->user();
        $isSelf = ($user instanceof Staff && $user->id === $staff->id) || ($user->service_no ?? null) === $staff->service_no;

        if (! $isSelf && ! $this->isStaffUser()) {
            $this->authorize('staff-posting.view');
        }

        // Staff users can only view their own postings
        if ($this->isStaffUser() && ! $isSelf) {
            return $this->errorResponse('Unauthorized access to other staff postings', 403);
        }

        $postings = $staff->postings()->with('creator')->orderBy('start_date', 'desc')->get();

        return $this->successResponse($postings, 'Staff postings retrieved successfully');
    }

    /**
     * Display the active posting for a specific staff member.
     */
    public function showActive(Request $request, string $serviceNo)
    {
        $staff = Staff::where('service_no', $serviceNo)->firstOrFail();

        // Allow staff to view their own postings without permission
        $user = $request->user();
        $isSelf = ($user instanceof Staff && $user->id === $staff->id) || ($user->service_no ?? null) === $staff->service_no;

        if (! $isSelf && ! $this->isStaffUser()) {
            $this->authorize('staff-posting.view');
        }

        // Staff users can only view their own postings
        if ($this->isStaffUser() && ! $isSelf) {
            return $this->errorResponse('Unauthorized access to other staff postings', 403);
        }

        $activePosting = $staff->activePosting()->with('creator')->first();

        if (! $activePosting) {
            return $this->successResponse(null, 'No active posting found for this staff');
        }

        return $this->successResponse($activePosting, 'Active posting retrieved successfully');
    }

    /**
     * Store a newly created staff posting.
     */
    public function store(StoreStaffPostingRequest $request)
    {
        $this->authorize('staff-posting.create');

        try {
            $data = $request->validated();

            // Submit change request for approval
            $changeRequest = $this->changeRequestService->submit(
                'App\Models\StaffPosting',
                'CREATE',
                $data,
                $request->user(),
                $data['service_no'] ?? null
            );

            return $this->successResponse($changeRequest, 'Staff posting creation request submitted for approval.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified staff posting.
     */
    public function show(Request $request, int $id)
    {
        // Skip authorization for staff users
        if (! $this->isStaffUser()) {
            $this->authorize('staff-posting.view');
        }

        $posting = StaffPosting::with(['staff', 'creator'])->findOrFail($id);

        // Staff users can only view their own postings
        if ($this->isStaffUser() && $posting->service_no !== $this->getStaffServiceNo()) {
            return $this->errorResponse('Unauthorized access to other staff postings', 403);
        }

        return $this->successResponse($posting);
    }

    /**
     * Update the specified staff posting.
     */
    public function update(UpdateStaffPostingRequest $request, int $id)
    {
        $this->authorize('staff-posting.edit');

        try {
            $data = $request->validated();
            $posting = StaffPosting::findOrFail($id);

            // Submit change request for approval
            $changeRequest = $this->changeRequestService->submit(
                'App\Models\StaffPosting',
                'UPDATE',
                $data,
                $request->user(),
                $posting->service_no,
                $posting->id
            );

            return $this->successResponse($changeRequest, 'Staff posting update submitted for approval');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Mark a posting as completed.
     */
    public function complete(Request $request, int $id)
    {
        $this->authorize('staff-posting.edit');

        try {
            $request->validate([
                'end_date' => ['nullable', 'date'],
                'remarks' => ['nullable', 'string'],
            ]);

            $posting = StaffPosting::findOrFail($id);

            $updatedPosting = $this->staffPostingService->completePosting(
                $posting,
                $request->end_date ?? now(),
                $request->remarks
            );

            return $this->successResponse($updatedPosting, 'Posting marked as completed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified staff posting.
     */
    public function destroy(int $id)
    {
        $this->authorize('staff-posting.delete');

        $this->staffPostingService->delete($id);

        return $this->successResponse(null, 'Staff posting deleted successfully');
    }

    // /**
    //  * Get statistics about staff postings.
    //  */
    // public function statistics(Request $request)
    // {
    //     // Skip authorization for staff users
    //     if (! $this->isStaffUser()) {
    //         $this->authorize('staff-posting.view');
    //     }

    //     $stats = $this->staffPostingService->getStatistics();

    //     return $this->successResponse($stats);
    // }
}