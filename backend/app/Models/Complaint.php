<?php

namespace App\Models;

use App\Traits\FilterableTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Complaint extends Model
{
    use FilterableTrait, HasFactory;

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
        'created_by_type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'created_by_name',
    ];

    public function creator(): MorphTo
    {
        return $this->morphTo(__FUNCTION__, 'created_by_type', 'created_by');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ComplaintMessage::class)->orderBy('created_at', 'asc');
    }

    public function getCreatedByNameAttribute(): ?string
    {
        if (! $this->creator) {
            return null;
        }

        // Admin users (User model) have 'name', Staff have 'first_name' and 'surname'
        if ($this->creator instanceof User) {
            return $this->creator->name;
        }

        return "{$this->creator->first_name} {$this->creator->surname}";
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
