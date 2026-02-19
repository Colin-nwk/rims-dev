<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\StaffPosting;
use Exception;
use Illuminate\Support\Facades\DB;

class StaffPostingService extends BaseService
{
    /**
     * Create Staff Posting with automatic station update.
     */
    public function create(array $data)
    {
        return DB::transaction(function () use ($data) {
            // Handle polymorphic creator relationship
            if (isset($data['created_by'])) {
                // If created_by is already an object with morph relation
                if (is_object($data['created_by'])) {
                    $posting = new StaffPosting();
                    $posting->fill($data);
                    $posting->creator()->associate($data['created_by']);
                    $posting->save();
                } else {
                    // Assume it's a User ID by default
                    $data['created_by_type'] = 'App\Models\User';
                    $data['created_by_id'] = $data['created_by'];
                    $posting = StaffPosting::create($data);
                }
            } else {
                $posting = StaffPosting::create($data);
            }

            // If this is an active posting, update the staff's station field
            if ($posting->status === 'active') {
                $staff = Staff::where('service_no', $posting->service_no)->first();
                if ($staff) {
                    $staff->update(['station' => $posting->station_name]);
                }
            }

            // Return the posting with relationships
            return $posting->load(['staff', 'creator']);
        });
    }

    /**
     * Update Staff Posting.
     */
    public function update($id, array $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $posting = StaffPosting::findOrFail($id);

            // Check if status is changing to active
            $wasActive = $posting->status === 'active';
            $isActive = isset($data['status']) && $data['status'] === 'active';

            // Check if station_name is changing
            $stationChanged = isset($data['station_name']) && $data['station_name'] !== $posting->station_name;

            $posting->update($data);

            // Update staff's station field if:
            // 1. Posting became active, or
            // 2. Posting is active and station name changed
            if (($isActive && ! $wasActive) || ($posting->status === 'active' && $stationChanged)) {
                $staff = Staff::where('service_no', $posting->service_no)->first();
                if ($staff) {
                    $staff->update(['station' => $posting->station_name]);
                }
            }

            // If posting is no longer active, clear the staff's station if it matches
            if ($posting->status !== 'active' && $stationChanged === false) {
                $staff = Staff::where('service_no', $posting->service_no)->first();
                if ($staff && $staff->station === $posting->station_name) {
                    // Find another active posting for this staff
                    $anotherActive = StaffPosting::where('service_no', $posting->service_no)
                        ->where('id', '!=', $posting->id)
                        ->where('status', 'active')
                        ->first();

                    if ($anotherActive) {
                        $staff->update(['station' => $anotherActive->station_name]);
                    } else {
                        $staff->update(['station' => null]);
                    }
                }
            }

            // Return the updated posting with relationships
            return $posting->fresh(['staff', 'creator']);
        });
    }

    /**
     * Delete resource.
     *
     * @param  int|string  $id
     * @return bool
     */
    public function delete($id)
    {
        return DB::transaction(function () use ($id) {
            $posting = $this->find($id);

            // If deleting an active posting, clear the staff's station
            if ($posting->status === 'active') {
                $staff = Staff::where('service_no', $posting->service_no)->first();
                if ($staff && $staff->station === $posting->station_name) {
                    $staff->update(['station' => null]);
                }
            }

            return $posting->delete();
        });
    }

    /**
     * Find resource.
     *
     * @param  int|string  $id
     * @return mixed
     */
    public function find($id)
    {
        return StaffPosting::with(['staff', 'creator'])->findOrFail($id);
    }

    /**
     * List resources with filters.
     */
    public function all(array $filters = [])
    {
        return StaffPosting::with(['staff', 'creator'])->filter($filters)
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * List resources with relationships.
     */
    public function allWithRelationships(array $filters = [])
    {
         return StaffPosting::with(['staff', 'creator'])->filter($filters)
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Complete a posting.
     */
    public function completePosting(StaffPosting $posting, string $endDate, ?string $remarks = null)
    {
        return DB::transaction(function () use ($posting, $endDate, $remarks) {
            $data = [
                'status' => 'completed',
                'end_date' => $endDate,
            ];

            if ($remarks) {
                $data['remarks'] = $remarks;
            }

            $posting->update($data);

            // Clear staff's station if it matches this posting
            $staff = Staff::where('service_no', $posting->service_no)->first();
            if ($staff && $staff->station === $posting->station_name) {
                // Find another active posting
                $anotherActive = StaffPosting::where('service_no', $posting->service_no)
                    ->where('id', '!=', $posting->id)
                    ->where('status', 'active')
                    ->first();

                if ($anotherActive) {
                    $staff->update(['station' => $anotherActive->station_name]);
                } else {
                    $staff->update(['station' => null]);
                }
            }

            return $posting->fresh(['staff', 'creator']);
        });
    }

    /**
     * Get statistics about staff postings.
     */
    public function getStatistics(): array
    {
        $totalPostings = StaffPosting::count();
        $activePostings = StaffPosting::where('status', 'active')->count();
        $completedPostings = StaffPosting::where('status', 'completed')->count();
        $terminatedPostings = StaffPosting::where('status', 'terminated')->count();

        $postingsByType = StaffPosting::selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->get()
            ->pluck('count', 'type')
            ->toArray();

        $currentMonthPostings = StaffPosting::whereMonth('start_date', now()->month)
            ->whereYear('start_date', now()->year)
            ->count();

        return [
            'total' => $totalPostings,
            'active' => $activePostings,
            'completed' => $completedPostings,
            'terminated' => $terminatedPostings,
            'by_type' => $postingsByType,
            'current_month' => $currentMonthPostings,
        ];
    }

    /**
     * Execute Change Request.
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