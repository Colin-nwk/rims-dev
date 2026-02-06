<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffDocument extends Model
{
    /** @use HasFactory<\Database\Factories\StaffDocumentFactory> */
    use HasFactory, \App\Traits\FilterableTrait;

    public $searchable = [
        'document_name',
        'service_no',
        'notes',
    ];

    public $filterable = [
        'verification_status',
        'document_type',
        'service_no',
        'verifier_id',
        'verifier_type',
    ];

    protected $fillable = [
        'service_no',
        'document_type',
        'document_name',
        'file_path',
        'file_size',
        'mime_type',
        'verification_status',
        'verifier_id',
        'verifier_type',
        'verified_at',
        'rejection_reason',
        'notes',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'expires_at' => 'date',
            'file_size' => 'integer',
        ];
    }

    public function staff()
    {
        return $this->belongsTo(Staff::class, 'service_no', 'service_no');
    }

    public function verifier()
    {
        return $this->morphTo();
    }

    public function isPending(): bool
    {
        return $this->verification_status === 'pending';
    }

    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    public function isRejected(): bool
    {
        return $this->verification_status === 'rejected';
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
