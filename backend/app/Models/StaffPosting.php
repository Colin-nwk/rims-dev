<?php

namespace App\Models;

use Database\Factories\StaffPostingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class StaffPosting extends Model
{
    use \App\Traits\FilterableTrait, HasFactory;

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): StaffPostingFactory
    {
        return StaffPostingFactory::new();
    }

    protected $fillable = [
        'service_no',
        'type',
        'station_name',
        'station_location',
        'start_date',
        'end_date',
        'status',
        'reason',
        'remarks',
        'created_by_type',
        'created_by_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public $searchable = [
        'service_no',
        'station_name',
        'station_location',
        'type',
        'status',
    ];

    public $filterable = [
        'service_no',
        'type',
        'status',
        'station_name',
    ];

    /**
     * Get the staff record associated with the posting.
     */
    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'service_no', 'service_no');
    }

    /**
     * Get the user/staff who created the posting (polymorphic).
     */
    public function creator(): MorphTo
    {
        return $this->morphTo('creator', 'created_by_type', 'created_by_id');
    }

    /**
     * Scope a query to only include active postings.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to only include postings of a specific type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if the posting is currently active.
     */
    public function isCurrentlyActive(): bool
    {
        return $this->status === 'active'
            && ($this->end_date === null || $this->end_date->isFuture());
    }

    /**
     * Get the posting type label.
     */
    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'farm_center' => 'Farm Center',
            'training_school' => 'Training School',
            'other' => 'Other',
            default => ucfirst(str_replace('_', ' ', $this->type)),
        };
    }
}
