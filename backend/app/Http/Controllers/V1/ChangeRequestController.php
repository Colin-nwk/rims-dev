<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
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

    public function index(Request $request)
    {
        $requests = ChangeRequest::visibleTo($request->user())
            ->filter($request->all())
            ->latest()
            ->paginate($request->per_page ?? 15);

        return $this->collectionResponse($requests);
    }

    public function approve(Request $request, $id)
    {
        try {
            $approverId = $request->user()->id;
            $result = $this->changeRequestService->approve($id, $approverId);

            return $this->successResponse($result, 'Request approved and executed successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

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
