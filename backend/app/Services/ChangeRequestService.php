<?php

namespace App\Services;

use App\Models\ChangeRequest;
use Exception;
use Illuminate\Support\Facades\App;

class ChangeRequestService
{
    /**
     * Submit a change request
     */
    public function submit(string $modelType, string $type, array $data, $requestedBy, ?string $serviceNo = null, $modelId = null)
    {
        // Simple duplicate check or validation logic could go here
        
        $request = new ChangeRequest();
        $request->model_type = $modelType;
        $request->model_id = $modelId;
        $request->service_no = $serviceNo;
        $request->type = $type;
        $request->data = $data;
        $request->status = 'PENDING';
        
        $request->requestedBy()->associate($requestedBy);
        $request->save();

        return $request;
    }

    /**
     * Approve a change request
     */
    /**
     * Approve a change request
     */
    public function approve($requestId, $approverId)
    {
        $approverId = $approverId instanceof \Illuminate\Database\Eloquent\Model ? $approverId->id : $approverId;
        
        $request = ChangeRequest::findOrFail($requestId);

        if ($request->status !== 'PENDING') {
            throw new Exception("Request is not pending.");
        }

        $service = $this->resolveService($request->model_type);
        
        // Execute the service logic
        $result = $service->executeRequest($request);

        $request->status = 'APPROVED';
        $request->approved_by = $approverId;
        $request->save();

        return $result;
    }

    /**
     * Reject a change request
     */
    public function reject($requestId, $approverId, $reason)
    {
        $approverId = $approverId instanceof \Illuminate\Database\Eloquent\Model ? $approverId->id : $approverId;

        $request = ChangeRequest::findOrFail($requestId);

        if ($request->status !== 'PENDING') {
            throw new Exception("Request is not pending.");
        }

        $request->status = 'REJECTED';
        $request->approved_by = $approverId;
        $request->rejection_reason = $reason;
        $request->save();

        return $request;
    }

    /**
     * Find a change request by ID
     */
    public function find($id)
    {
        return ChangeRequest::findOrFail($id);
    }

    /**
     * List all change requests
     */
    public function all(array $filters = [])
    {
        return ChangeRequest::filter($filters)->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Resolve the appropriate service for the model
     */
    protected function resolveService($modelType)
    {
        return match ($modelType) {
            'App\Models\Staff' => App::make(\App\Services\StaffService::class),
            'App\Models\User' => App::make(\App\Services\UserService::class),
            default => throw new Exception("No service found for model: {$modelType}"),
        };
    }
}
