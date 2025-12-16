<?php

namespace App\Http\Controllers;

use App\Models\ChangeRequest;
use App\Services\ChangeRequestService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class ChangeRequestController extends Controller
{
    use ApiResponseTrait;

    protected $changeRequestService;

    public function __construct(ChangeRequestService $changeRequestService)
    {
        $this->changeRequestService = $changeRequestService;
    }

    /**
     * List pending requests
     */
    public function index(Request $request)
    {
        $requests = ChangeRequest::filter($request->all())
            ->latest()
            ->paginate($request->per_page ?? 15);
        return $this->collectionResponse($requests);
    }

    /**
     * Approve a request
     */
    public function approve(Request $request, $id)
    {
        try {
            // Check permissions/roles here? Assuming authenticated user has permission for now.
            $approverId = $request->user()->id; 
            
            $result = $this->changeRequestService->approve($id, $approverId);
            
            return $this->successResponse($result, 'Request approved and executed successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Reject a request
     */
    public function reject(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);

        try {
            $approverId = $request->user()->id;
            
            $result = $this->changeRequestService->reject($id, $approverId, $request->reason);
            
            return $this->successResponse($result, 'Request rejected.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
