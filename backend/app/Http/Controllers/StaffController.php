<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use App\Services\ChangeRequestService;
use App\Traits\ApiResponseTrait;
use App\Traits\FileUploadTrait;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    use ApiResponseTrait, FileUploadTrait;

    protected $changeRequestService;
    protected $staffService;

    public function __construct(
        ChangeRequestService $changeRequestService,
        \App\Services\StaffService $staffService
    ) {
        $this->changeRequestService = $changeRequestService;
        $this->staffService = $staffService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $staff = $this->staffService->all($request->all());
        return $this->collectionResponse($staff);
    }

    /**
     * Store a newly created resource in change request.
     */
    public function store(StoreStaffRequest $request)
    {
        try {
            $data = $request->validated();
            
            // Handle Education File Uploads
            if (isset($data['education']) && is_array($data['education'])) {
                foreach ($data['education'] as $index => &$edu) {
                    if (isset($edu['url']) && $request->hasFile("education.{$index}.url")) {
                        $file = $request->file("education.{$index}.url");
                        $serviceNo = $data['service_no'];
                        $type = $edu['type'] ?? 'document';
                        $timestamp = now()->timestamp;
                        
                        // Naming: service_no_type_timestamp
                        $filename = "{$serviceNo}_{$type}_{$timestamp}";
                        
                        $path = $this->uploadFile($file, 'education', 'public', $filename);
                        
                        if ($path) {
                            $edu['url'] = $path; // Replace file object with path string
                        }
                    }
                }
            }

            // Handle Photo Upload
            if ($request->hasFile('photo')) {
                $file = $request->file('photo');
                $serviceNo = $data['service_no']; // Ensure service_no is present
                $timestamp = now()->timestamp;
                $filename = "{$serviceNo}_photo_{$timestamp}";
                $path = $this->uploadFile($file, 'photos', 'public', $filename);
                if ($path) {
                    $data['photo'] = $path;
                }
            }

            $changeRequest = $this->changeRequestService->submit(
                'App\Models\Staff',
                'CREATE',
                $data,
                $request->user(),
                $data['service_no'] ?? null
            );

            return $this->successResponse($changeRequest, 'Staff creation request submitted for approval.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Staff $staff)
    {
        return $staff->load(['details', 'education']);
    }

    /**
     * Update the specified resource in change request.
     */
    public function update(UpdateStaffRequest $request, Staff $staff)
    {
        try {
            $data = $request->validated();

            // Handle Photo Upload
            if ($request->hasFile('photo')) {
                $file = $request->file('photo');
                $serviceNo = $staff->service_no; // Use staff service no for update
                $timestamp = now()->timestamp;
                $filename = "{$serviceNo}_photo_{$timestamp}";
                $path = $this->uploadFile($file, 'photos', 'public', $filename);
                if ($path) {
                    $data['photo'] = $path;
                }
            }

            $changeRequest = $this->changeRequestService->submit(
                'App\Models\Staff',
                'UPDATE',
                $data,
                $request->user(),
                $staff->service_no,
                $staff->id
            );

            return $this->successResponse($changeRequest, 'Staff update request submitted for approval.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Staff $staff)
    {
        // Direct delete or request? Assuming direct for now or unimplemented.
        // If request:
        // $this->changeRequestService->submit('App\Models\Staff', 'DELETE', [], $user, ...);
        
        $staff->delete();
        return response()->noContent();
    }
}
