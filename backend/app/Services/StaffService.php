<?php

namespace App\Services;

use App\Models\Staff;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffService extends BaseService
{
    /**
     * Create Staff with nested data
     */
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Hash password if present
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }

            // Create Staff
            $staff = Staff::create($data);

            // Create Details
            if (isset($data['details'])) {
                $staff->details()->create($data['details']);
            }

            // Create Education
            if (isset($data['education']) && is_array($data['education'])) {
                foreach ($data['education'] as $edu) {
                    $staff->education()->create($edu);
                }
            }

            return $staff;
        });
    }

    /**
     * Update Staff with nested data
     */
    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $staff = $this->find($id);

            // Update Staff
            if (isset($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            }
            $staff->update($data);

            // Update Details
            if (isset($data['details'])) {
                $staff->details()->updateOrCreate(
                    ['service_no' => $staff->service_no], // Match logic
                    $data['details']
                );
            }

            // Update Education - Strategy: Delete all and recreate? Or smart update?
            // For simplicity and avoiding complex ID matching, we'll wipe and recreate for now,
            // OR if IDs are provided, update.
            // Simplest robust approach for this context:
            if (isset($data['education']) && is_array($data['education'])) {
                // Determine if we are replacing all or adding/updating.
                // Assuming full replacement of the list for simplicity in this iteration.
                $staff->education()->delete();
                foreach ($data['education'] as $edu) {
                    $staff->education()->create($edu);
                }
            }

            return $staff;
        });
    }

    public function delete($id)
    {
        $staff = $this->find($id);

        return $staff->delete();
    }

    public function find($id)
    {
        return Staff::with(['details', 'education'])->findOrFail($id);
    }

    public function all(array $filters = [])
    {
        return Staff::with(['details', 'education'])
            ->filter($filters)
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Execute Change Request
     */
    public function executeRequest($request)
    {
        $data = $request->data;

        if ($request->type === 'CREATE') {
            return $this->create($data);
        } elseif ($request->type === 'UPDATE' || $request->type === 'SENSITIVE') {
            return $this->update($request->model_id, $data);
        }

        throw new Exception('Invalid request type: '.$request->type);
    }
}
