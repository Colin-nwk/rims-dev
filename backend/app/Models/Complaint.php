<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\FilterableTrait;

class Complaint extends Model
{
    use HasFactory, FilterableTrait;

    protected $searchable = [
        'subject',
    ];

    protected $filterable = [
        'category',
        'priority',
        'status',
    ];

    protected $fillable = [
        'subject',
        'category',
        'priority',
        'status',
        'created_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'created_by_name',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'created_by');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ComplaintMessage::class)->orderBy('created_at', 'asc');
    }

    public function getCreatedByNameAttribute(): ?string
    {
        return $this->creator ? "{$this->creator->first_name} {$this->creator->surname}" : null;
    }

    // Helper methods for Scoped Authorization (Gate checks)
    public function getPrisonId()
    {
        return $this->creator?->prison; // Staff model uses 'prison' for ID? Check Staff model.
    }

    public function getStateId()
    {
        return $this->creator?->assigned_state;
    }

    public function getZoneId()
    {
        return $this->creator?->zone_id;
    }
}
