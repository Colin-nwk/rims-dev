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
    public function verify($id, $verifier): StaffDocument
    {
        return DB::transaction(function () use ($id, $verifier) {
            $document = $this->find($id);

            $document->update([
                'verification_status' => 'verified',
                'verifier_id' => $verifier->getKey(),
                'verifier_type' => $verifier->getMorphClass(),
                'verified_at' => now(),
                'rejection_reason' => null,
            ]);

            return $document;
        });
    }

    /**
     * Reject document
     */
    public function reject($id, $verifier, $reason): StaffDocument
    {
        return DB::transaction(function () use ($id, $verifier, $reason) {
            $document = $this->find($id);

            $document->update([
                'verification_status' => 'rejected',
                'verifier_id' => $verifier->getKey(),
                'verifier_type' => $verifier->getMorphClass(),
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
        return StaffDocument::with(['staff', 'verifier'])
            ->filter($filters)
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * List document records with filters and relationships
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function allWithRelationships(array $filters = [])
    {
        return StaffDocument::with(['staff', 'verifier'])
            ->filter($filters)
            ->paginate($filters['per_page'] ?? 15);
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
