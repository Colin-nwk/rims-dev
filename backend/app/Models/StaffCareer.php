<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffCareer extends Model
{
    use HasFactory;
    protected $fillable = [
        'service_no',
        'field_changed',
        'old_value',
        'new_value',
        'effective_date',
        'reason',
        'changed_by',
    ];

    protected $casts = [
        'effective_date' => 'datetime',
    ];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(Staff::class, 'service_no', 'service_no');
    }
}
