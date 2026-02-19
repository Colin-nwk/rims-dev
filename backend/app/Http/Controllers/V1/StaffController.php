<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffRequest;
use App\Http\Requests\UpdateStaffRequest;
use App\Models\Staff;
use App\Services\ChangeRequestService;
use App\Traits\ApiResponseTrait;
use App\Traits\FileUploadTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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
        $this->authorize('staff.view');
        $staff = $this->staffService->allWithRelationships($request->all());

        return $this->collectionResponse($staff);
    }

    public function store(StoreStaffRequest $request)
    {
        $this->authorize('staff.create');
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
        // Allow staff to view their own record without permission
        $user = request()->user();
        $isSelf = ($user instanceof Staff && $user->id === $staff->id);

        if (! $isSelf) {
            $this->authorize('staff.view');
        }

        return $this->successResponse($staff->load([
            'details',
            'education',
            'roles',
            'assignedState',
            'initialCommand',
            'presentCommand',
            'documents',
            'presentRank',
            'initialRank',
            'postings',
            'activePosting',
        ]));
    }

    public function update(UpdateStaffRequest $request, Staff $staff)
    {
        // Allow if user has permission OR if user is updating their own record
        $user = $request->user();
        $isSelf = ($user instanceof Staff && $user->id === $staff->id) || ($user->service_no ?? null) === $staff->service_no;

        if (! $isSelf) {
            $this->authorize('staff.edit');
        }

        try {
            $data = $request->validated();

            // Filter to only include fields that were actually sent in the request
            $data = array_filter($data, function ($value, $key) use ($request) {
                return $request->has($key);
            }, ARRAY_FILTER_USE_BOTH);

            $sensitiveFields = [
                'dob',
                'date_of_first_appointment',
                'file_no',
                'service_no',
                'ippis',
                'phone_number',
                'email',
            ];

            $sensitivePayload = [];
            $standardPayload = [];

            foreach ($data as $key => $value) {
                if (in_array($key, $sensitiveFields)) {
                    $sensitivePayload[$key] = $value;
                } elseif ($key === 'details' && is_array($value)) {
                    // Check for sensitive fields inside details (like ippis)
                    if (array_key_exists('ippis', $value)) {
                        $sensitivePayload['details']['ippis'] = $value['ippis'];
                        unset($value['ippis']);
                    }
                    if (! empty($value)) {
                        $standardPayload['details'] = $value;
                    }
                } else {
                    $standardPayload[$key] = $value;
                }
            }

            // Handle file uploads (Photo is standard)
            if ($request->hasFile('photo')) {
                $file = $request->file('photo');
                $serviceNo = $staff->service_no;
                $timestamp = now()->timestamp;
                $filename = "{$serviceNo}_photo_{$timestamp}";
                $path = $this->uploadFile($file, 'photos', 'public', $filename);
                if ($path) {
                    $standardPayload['photo'] = $path;
                }
            }

            $responses = DB::transaction(function () use ($sensitivePayload, $standardPayload, $request, $staff) {
                $res = [];
                if (! empty($sensitivePayload)) {
                    $res['sensitive'] = $this->changeRequestService->submit(
                        'App\Models\Staff',
                        'SENSITIVE',
                        $sensitivePayload,
                        $request->user(),
                        $staff->service_no,
                        $staff->id
                    );
                }

                if (! empty($standardPayload)) {
                    $res['standard'] = $this->changeRequestService->submit(
                        'App\Models\Staff',
                        'UPDATE',
                        $standardPayload,
                        $request->user(),
                        $staff->service_no,
                        $staff->id
                    );
                }

                return $res;
            });

            return $this->successResponse($responses, 'Staff update request(s) submitted for approval.');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function destroy(Staff $staff)
    {
        $this->authorize('staff.delete');
        $staff->delete();

        return response()->noContent();
    }

    public function idCard(string $serviceNo)
    {
        $staff = Staff::with([
            'assignedState',
            'presentRank',
            'initialRank',
            // 'details',
            // 'education',
            // 'roles',
            // 'initialCommand',
            // 'presentCommand',
            // 'documents'
        ])->where('service_no', $serviceNo)->first();

        if (! $staff) {
            return $this->errorResponse('Staff not found.', 404);
        }

        return $this->successResponse([
            'service_no' => $staff->service_no,
            'ippis' => $staff->ippis,
            'surname' => $staff->surname,
            'first_name' => $staff->first_name,
            'other_names' => $staff->other_names,
            'present_rank' => $staff->present_rank,
            'present_rank_name' => $staff->present_rank_name,
            'initial_rank' => $staff->initial_rank,
            'initial_rank_name' => $staff->initial_rank_name,
            'dob' => $staff->dob?->format('Y-m-d'),
            'photo' => $staff->photo,
            'status' => $staff->status,
            'sex' => $staff->sex,
            'assigned_state_name' => $staff->assignedState?->state,
            'updated_at' => $staff->updated_at,
        ]);
    }

    public function assignRole(Request $request, Staff $staff)
    {
        $this->authorize('staff.delete');
        $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $staff->assignRole($request->role_id);

        return $this->successResponse($staff->load('roles'), 'Role assigned successfully');
    }

    public function removeRole(Staff $staff, $roleId)
    {
        $this->authorize('staff.delete');
        $staff->removeRole($roleId);

        return $this->successResponse($staff->load('roles'), 'Role removed successfully');
    }

    /**
     * Reset password for a staff member (Admin only)
     */
    public function resetPassword(Request $request, Staff $staff)
    {
        $this->authorize('staff.edit');

        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $staff->update([
            'password' => Hash::make($request->password),
        ]);

        return $this->successResponse(null, 'Staff password has been reset successfully');
    }
}
