<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\ChangeRequest;
use App\Services\ChangeRequestDisplayValueService;
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
            ->with(['requestedBy', 'approvedBy', 'model'])
            ->filter($request->all())
            ->latest()
            ->paginate($request->per_page ?? 15);

        // Eager load nested relationships only for Staff models
        $requests->getCollection()->each(function ($changeRequest) {
            if ($changeRequest->model instanceof \App\Models\Staff) {
                $changeRequest->model->load(['details', 'education']);
            }
        });

        $displayResolver = app(ChangeRequestDisplayValueService::class);

        $requests->getCollection()->transform(function (ChangeRequest $changeRequest) use ($displayResolver) {
            $uiMaps = $displayResolver->mapsFor($changeRequest);

            return array_merge($changeRequest->toArray(), $uiMaps);
        });

        return $this->collectionResponse($requests);
    }

    public function approve(Request $request, $id)
    {
        $this->authorize('change_request.approve');
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
        $this->authorize('change_request.reject');
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
