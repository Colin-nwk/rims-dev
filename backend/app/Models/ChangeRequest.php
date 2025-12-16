<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChangeRequest extends Model
{
    use HasFactory, \App\Traits\FilterableTrait;

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
}
