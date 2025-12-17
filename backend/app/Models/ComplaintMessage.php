<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ComplaintMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'complaint_id',
        'sender_id',
        'sender_type',
        'content',
        'is_internal',
    ];

    protected $casts = [
        'is_internal' => 'boolean',
        'created_at' => 'datetime',
    ];

    protected $appends = [
        'sender_name',
        'sender_role',
        'timestamp',
    ];

    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    public function sender(): MorphTo
    {
        return $this->morphTo();
    }

    public function getSenderNameAttribute(): ?string
    {
        $sender = $this->sender;
        if (!$sender) return 'Unknown';
        
        if ($sender instanceof Staff) {
            return "{$sender->first_name} {$sender->surname}";
        }
        
        if ($sender instanceof User) {
            return $sender->name;
        }
        
        return 'Unknown';
    }

    public function getSenderRoleAttribute(): string
    {
        if ($this->sender_type === User::class) {
            return 'admin';
        }
        return 'staff';
    }

    public function getTimestampAttribute(): string
    {
        return $this->created_at?->format('M d, Y H:i') ?? '';
    }
}
