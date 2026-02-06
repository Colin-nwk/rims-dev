<?php

namespace App\Services;

use App\Models\StaffDocument;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class StaffDocumentService extends BaseService
{
    /**
     * Create document record
     */
    public function create(array $data): StaffDocument
    {
        return DB::transaction(function () use ($data) {
            return StaffDocument::create($data);
        });
    }

    /**
     * Update document record
     *
     * @param  int|string  $id
     */
    public function update($id, array $data): StaffDocument
    {
        return DB::transaction(function () use ($id, $data) {
            $document = $this->find($id);

            // If updating with a new file and old file exists, delete old file
            if (isset($data['file_path']) && $document->file_path && $data['file_path'] !== $document->file_path) {
                $this->deleteFile($document->file_path);
            }

            $document->update($data);

            return $document->fresh();
        });
    }

    /**
     * Delete document record
     *
     * @param  int|string  $id
     */
    public function delete($id): bool
    {
        return DB::transaction(function () use ($id) {
            $document = $this->find($id);

            // Delete associated file if exists
            if ($document->file_path) {
                $this->deleteFile($document->file_path);
            }

            return $document->delete();
        });
    }

    /**
     * Verify document
     */
    public function verify($id, $verifierId): StaffDocument
    {
        return DB::transaction(function () use ($id, $verifierId) {
            $document = $this->find($id);

            $document->update([
                'verification_status' => 'verified',
                'verified_by' => $verifierId instanceof \Illuminate\Database\Eloquent\Model ? $verifierId->id : $verifierId,
                'verified_at' => now(),
                'rejection_reason' => null,
            ]);

            return $document;
        });
    }

    /**
     * Reject document
     */
    public function reject($id, $verifierId, $reason): StaffDocument
    {
        return DB::transaction(function () use ($id, $verifierId, $reason) {
            $document = $this->find($id);

            $document->update([
                'verification_status' => 'rejected',
                'verified_by' => $verifierId instanceof \Illuminate\Database\Eloquent\Model ? $verifierId->id : $verifierId,
                'verified_at' => now(), // Still track when the decision was made
                'rejection_reason' => $reason,
            ]);

            return $document;
        });
    }

    /**
     * Find document record by ID
     *
     * @param  int|string  $id
     */
    public function find($id): StaffDocument
    {
        return StaffDocument::with(['staff', 'verifier'])->findOrFail($id);
    }

    /**
     * List document records with filters
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function all(array $filters = [])
    {
        $query = StaffDocument::with(['staff', 'verifier']);

        if (isset($filters['service_no'])) {
            $query->where('service_no', $filters['service_no']);
        }

        if (isset($filters['document_type'])) {
            $query->where('document_type', $filters['document_type']);
        }

        if (isset($filters['verification_status'])) {
            $query->where('verification_status', $filters['verification_status']);
        }

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('document_name', 'like', '%'.$search.'%');
            });
        }

        // Sorting
        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $query->orderBy($sortField, $sortDirection);

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Execute Change Request for document records
     *
     * @param  \App\Models\ChangeRequest  $request
     */
    public function executeRequest($request): StaffDocument
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
