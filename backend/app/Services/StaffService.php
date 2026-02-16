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

            // Create Education - enforce one record per type (except 'Other')
            if (isset($data['education']) && is_array($data['education'])) {
                foreach ($data['education'] as $edu) {
                    $type = $edu['type'] ?? null;
                    if (! $type) {
                        continue;
                    }

                    if (strtolower($type) === 'other') {
                        // 'Other' type can have multiple records
                        $staff->education()->create($edu);
                    } else {
                        // For all other types, only one record per type allowed
                        $staff->education()->updateOrCreate(
                            ['service_no' => $staff->service_no, 'type' => $type],
                            $edu
                        );
                    }
                }
            }

            // Return the created staff with all relationships
            return $this->find($staff->id);
        });
    }

    /**
     * Update Staff with nested data
     */
    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $staff = Staff::findOrFail($id);

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

            // Update Education - Smart update by type
            // Rules: Only one record per type (except 'Other' which allows multiple)
            // - If type exists: update the existing record
            // - If type doesn't exist: create new record
            // - 'Other' type: always create new (never update)
            if (isset($data['education']) && is_array($data['education'])) {
                foreach ($data['education'] as $edu) {
                    $type = $edu['type'] ?? null;
                    if (! $type) {
                        continue;
                    }

                    if (strtolower($type) === 'other') {
                        // 'Other' type can have multiple records - always create
                        $staff->education()->create($edu);
                    } else {
                        // For all other types, only one record per type allowed
                        $staff->education()->updateOrCreate(
                            ['service_no' => $staff->service_no, 'type' => $type],
                            $edu
                        );
                    }
                }
            }

            // Return the updated staff with all relationships
            return $this->find($id);
        });
    }

    public function delete($id)
    {
        return DB::transaction(function () use ($id) {
            $staff = $this->find($id);

            return $staff->delete();
        });
    }

    public function find($id)
    {
        return Staff::with([
            'details',
            'education',
            'roles',
            'assignedState',
            'initialCommand',
            'presentCommand',
            'documents',
        ])->findOrFail($id);
    }

    public function all(array $filters = [])
    {
        return Staff::with(['details', 'education', 'roles'])
            ->filter($filters)
            ->paginate($filters['per_page'] ?? 15);
    }

    public function allWithRelationships(array $filters = [])
    {
        return Staff::with([
            'details',
            'education',
            'roles',
            'assignedState',
            'initialCommand',
            'presentCommand',
            'documents',
            'presentRank',
            'initialRank',
        ])
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
