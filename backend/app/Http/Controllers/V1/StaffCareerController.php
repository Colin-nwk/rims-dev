<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\StaffCareer;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\Request;

class StaffCareerController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request, string $serviceNo)
    {
        $staff = Staff::where('service_no', $serviceNo)->firstOrFail();
        
        // Allow staff to view their own career history without permission
        $user = $request->user();
        $isSelf = ($user instanceof Staff && $user->id === $staff->id) || ($user->service_no ?? null) === $staff->service_no;

        if (!$isSelf) {
            $this->authorize('staff.view');
        }

        $careerHistory = $staff->careerHistory()->get();

        return $this->successResponse($careerHistory, 'Staff career history retrieved successfully');
    }

    public function show(Request $request, string $serviceNo, int $id)
    {
        $staff = Staff::where('service_no', $serviceNo)->firstOrFail();
        
        // Allow staff to view their own career history without permission
        $user = $request->user();
        $isSelf = ($user instanceof Staff && $user->id === $staff->id) || ($user->service_no ?? null) === $staff->service_no;

        if (!$isSelf) {
            $this->authorize('staff.view');
        }

        $careerRecord = $staff->careerHistory()->where('id', $id)->firstOrFail();

        return $this->successResponse($careerRecord, 'Staff career record retrieved successfully');
    }

    public function store(Request $request, string $serviceNo)
    {
        $staff = Staff::where('service_no', $serviceNo)->firstOrFail();
        
        // Only authorized users can manually add career records
        $this->authorize('staff.edit');

        $request->validate([
            'field_changed' => 'required|in:present_rank,present_command',
            'old_value' => 'nullable|string|max:255',
            'new_value' => 'required|string|max:255',
            'effective_date' => 'nullable|date',
            'reason' => 'nullable|string|max:500',
        ]);

        $careerRecord = StaffCareer::create([
            'service_no' => $staff->service_no,
            'field_changed' => $request->field_changed,
            'old_value' => $request->old_value,
            'new_value' => $request->new_value,
            'effective_date' => $request->effective_date ?? now(),
            'reason' => $request->reason,
            'changed_by' => $request->user()->id,
        ]);

        return $this->successResponse($careerRecord, 'Staff career record created successfully', 201);
    }
}
