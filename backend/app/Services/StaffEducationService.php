<?php

namespace App\Services;

use App\Models\StaffEducation;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StaffEducationService extends BaseService
{
    /**
     * List document records with filters and relationships
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function allWithRelationships(array $filters = [])
    {
        return StaffEducation::with(['staff'])->filter($filters)
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Create education record
     */
    public function create(array $data): StaffEducation
    {
        return DB::transaction(function () use ($data) {
            return StaffEducation::create($data);
        });
    }

    /**
     * Update education record
     *
     * @param  int|string  $id
     */
    public function update($id, array $data): StaffEducation
    {
        return DB::transaction(function () use ($id, $data) {
            $education = $this->find($id);

            // If updating with a new file and old file exists, delete old file
            if (isset($data['url']) && $education->url && $data['url'] !== $education->url) {
                $this->deleteFile($education->url);
            }

            $education->update($data);

            return $education->fresh();
        });
    }

    /**
     * Delete education record
     *
     * @param  int|string  $id
     */
    public function delete($id): bool
    {
        return DB::transaction(function () use ($id) {
            $education = $this->find($id);

            // Delete associated file if exists
            if ($education->url) {
                $this->deleteFile($education->url);
            }

            return $education->delete();
        });
    }

    /**
     * Find education record by ID
     *
     * @param  int|string  $id
     */
    public function find($id): StaffEducation
    {
        return StaffEducation::with('staff')->findOrFail($id);
    }

    /**
     * List education records with filters
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function all(array $filters = [])
    {
        $query = StaffEducation::with('staff');

        if (isset($filters['service_no'])) {
            $query->where('service_no', $filters['service_no']);
        }

        if (isset($filters['institution'])) {
            $query->where('institution', 'like', '%'.$filters['institution'].'%');
        }

        if (isset($filters['course'])) {
            $query->where('course', 'like', '%'.$filters['course'].'%');
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Execute Change Request for education records
     *
     * @param  \App\Models\ChangeRequest  $request
     */
    public function executeRequest($request): StaffEducation
    {
        $data = $request->data;

        if ($request->type === 'CREATE') {
            return $this->create($data);
        } elseif ($request->type === 'UPDATE') {
            return $this->update($request->model_id, $data);
        }

        throw new Exception('Invalid request type: '.$request->type);
    }

    /**
     * Delete a file from storage
     */
    protected function deleteFile(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }
}
