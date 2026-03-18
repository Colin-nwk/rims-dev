<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use \App\Traits\FilterableTrait, \App\Traits\HasRolesTrait, HasApiTokens, HasFactory, Notifiable;

    /**
     * Status constants mapping integers to string labels
     */
    public const STATUS_ACTIVE = 1;

    public const STATUS_INACTIVE = 0;

    public const STATUS_SUSPENDED = 2;

    public const STATUS_MAP = [
        self::STATUS_ACTIVE => 'active',
        self::STATUS_INACTIVE => 'inactive',
        self::STATUS_SUSPENDED => 'suspended',
    ];

    public const STATUS_REVERSE_MAP = [
        'active' => self::STATUS_ACTIVE,
        'inactive' => self::STATUS_INACTIVE,
        'suspended' => self::STATUS_SUSPENDED,
    ];

    protected $fillable = [
        'name',
        'email',
        'password',
        'status',
    ];

    public $searchable = ['name', 'email'];

    public $filterable = ['id']; // Minimal filters for user for now

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get/Set the user's status as a string.
     * Converts between integer (database) and string (API) representation.
     */
    protected function status(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => self::STATUS_MAP[$value] ?? 'active',
            set: fn ($value) => is_numeric($value) ? $value : (self::STATUS_REVERSE_MAP[$value] ?? self::STATUS_ACTIVE),
        );
    }

    /**
     * Get all postings created by this user.
     */
    public function createdPostings()
    {
        return $this->morphMany(\App\Models\StaffPosting::class, 'creator');
    }
}
