<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChangeRequest extends Model
{
    use \App\Traits\FilterableTrait, HasFactory;

    public $searchable = ['service_no', 'model_type', 'type', 'status'];

    public $filterable = ['status', 'type', 'model_type', 'service_no', 'requested_by_id'];

    protected $fillable = [
        'model_type',
        'model_id',
        'service_no',
        'type',
        'data',
        'status',
        'requested_by_id',
        'requested_by_type',
        'approved_by',
        'rejection_reason',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function requestedBy()
    {
        return $this->morphTo();
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function model()
    {
        return $this->morphTo();
    }

    public function scopeVisibleTo($query, $user)
    {
        if ($user->cannot('change_request.view_all')) {
            // For staff users, show both:
            // 1. Requests they submitted (requested_by_id matches their ID)
            // 2. Requests about their profile (service_no matches their service_no)
            if ($user instanceof \App\Models\Staff) {
                return $query->where(function ($q) use ($user) {
                    $q->where('requested_by_id', $user->id)
                        ->orWhere('service_no', $user->service_no);
                });
            }

            // For non-staff users without view_all permission, only show their own requests
            return $query->where('requested_by_id', $user->id);
        }

        $roles = $user->roles;
        if ($roles->contains('scopeless', true)) {
            return $query;
        }

        $stateIds = $roles->pluck('state_id')->filter()->values()->toArray();
        $zoneIds = $roles->pluck('zone_id')->filter()->values()->toArray();

        return $query->where(function ($q) use ($user, $stateIds, $zoneIds) {
            // Match via Model (Updates)
            $q->whereHasMorph('model', [\App\Models\Staff::class], function ($sq) use ($stateIds, $zoneIds) {
                $sq->where(function ($iq) use ($stateIds, $zoneIds) {
                    if (! empty($stateIds)) {
                        $iq->orWhereIn('assigned_state', $stateIds);
                    }
                    if (! empty($zoneIds)) {
                        $iq->orWhereIn('zone_id', $zoneIds);
                    }
                });
            });

            // Match via Data JSON (Creates)
            if (! empty($stateIds)) {
                $q->orWhereIn('data->assigned_state', $stateIds);
            }
            if (! empty($zoneIds)) {
                $q->orWhereIn('data->zone_id', $zoneIds);
            }

            // Always allow seeing own requests
            $q->orWhere('requested_by_id', $user->id);
        });
    }
}
