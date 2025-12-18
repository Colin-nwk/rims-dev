<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
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

    public function index(Request $request)
    {
        $staff = $this->staffService->all($request->all());
        return $this->collectionResponse($staff);
    }

    public function store(StoreStaffRequest $request)
    {
        try {
            $data = $request->validated();
            
            if (isset($data['education']) && is_array($data['education'])) {
                foreach ($data['education'] as $index => &$edu) {
                    if (isset($edu['url']) && $request->hasFile("education.{$index}.url")) {
                        $file = $request->file("education.{$index}.url");
                        $serviceNo = $data['service_no'];
                        $type = $edu['type'] ?? 'document';
                        $timestamp = now()->timestamp;
                        $filename = "{$serviceNo}_{$type}_{$timestamp}";
                        $path = $this->uploadFile($file, 'education', 'public', $filename);
                        if ($path) {
                            $edu['url'] = $path;
                        }
                    }
                }
            }

            if ($request->hasFile('photo')) {
                $file = $request->file('photo');
                $serviceNo = $data['service_no'];
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

    public function show(Staff $staff)
    {
        return $staff->load(['details', 'education']);
    }

    public function update(UpdateStaffRequest $request, Staff $staff)
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('photo')) {
                $file = $request->file('photo');
                $serviceNo = $staff->service_no;
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

    public function destroy(Staff $staff)
    {
        $staff->delete();
        return response()->noContent();
    }

    public function idCard(string $serviceNo)
    {
        $staff = Staff::with('assignedState')->where('service_no', $serviceNo)->first();

        if (!$staff) {
            return $this->errorResponse('Staff not found.', 404);
        }

        return $this->successResponse([
            'service_no' => $staff->service_no,
            'surname' => $staff->surname,
            'first_name' => $staff->first_name,
            'other_names' => $staff->other_names,
            'present_rank' => $staff->present_rank,
            'dob' => $staff->dob?->format('Y-m-d'),
            'photo' => $staff->photo,
            'status' => $staff->status,
            'sex' => $staff->sex,
            'assigned_state_name' => $staff->assignedState?->state,
        ]);
    }

    public function assignRole(Request $request, Staff $staff)
    {
        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $staff->roles()->syncWithoutDetaching([$request->role_id]);
        $staff->flushRoleCache();
        
        return $this->successResponse($staff->load('roles'), 'Role assigned successfully');
    }

    public function removeRole(Staff $staff, $roleId)
    {
        $staff->roles()->detach($roleId);
        $staff->flushRoleCache();
        
        return $this->successResponse($staff->load('roles'), 'Role removed successfully');
    }
}
