<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Staff extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\StaffFactory> */
    use \App\Traits\AuthorizesScopedAccess, \App\Traits\FilterableTrait, \App\Traits\HasRolesTrait, \App\Traits\RetirementTrait, HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'service_no',
        'email',
        'password',
        'phone_number',
        'assigned_state',
        'prison',
        'surname',
        'first_name',
        'other_names',
        'sex',
        'initial_rank',
        'present_rank',
        'level',
        'step',
        'dob',
        'date_of_first_appointment',
        'present_appointment_date',
        'command_post_date',
        'initial_command',
        'present_command',
        'state_of_origin',
        'lga',
        'department',
        'file_no',
        'ippis',
        'duty',
        'description',
        'photo',
        'last_login',
        'is_verified',
        'status',
        'zone_id',
    ];

    public $searchable = [
        'service_no',
        'surname',
        'first_name',
        'email',
        'file_no',
        'ippis',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'retirement_date_formatted',
        'is_retired',
        'retirement_time_remaining',
    ];

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'service_no';
    }

    public $filterable = [
        'status',
        'assigned_state',
        'prison',
        'sex',
        'initial_rank',
        'present_rank',
        'level',
        'department',
        'zone_id',
    ];

    /**
     * Filter by Age Range.
     * Supported formats: "18-20", "less 18", "18+", "above 18"
     */
    public function filterAgeRange($query, $value)
    {
        if (empty($value)) return;

        $param = strtolower(trim($value));

        // Format: "18-20" (Range)
        if (preg_match('/^(\d+)-(\d+)$/', $param, $matches)) {
            $min = (int) $matches[1];
            $max = (int) $matches[2];
            
            // Logic: Age >= Min AND Age <= Max
            // dob <= now - min (born before or on min years ago)
            // dob > now - (max + 1) (born after max+1 years ago)
            $query->where('dob', '<=', now()->subYears($min)->format('Y-m-d'))
                  ->where('dob', '>', now()->subYears($max + 1)->format('Y-m-d'));
            return;
        }

        // Format: "less 18", "under 18", "< 18"
        if (preg_match('/^(less|under|<)\s*(\d+)$/', $param, $matches)) {
            $maxAge = (int) $matches[2];
            
            // Logic: Age < MaxAge
            // dob > now - MaxAge
            $query->where('dob', '>', now()->subYears($maxAge)->format('Y-m-d'));
            return;
        }

        // Format: "18+", "above 18", "> 18"
        if (preg_match('/^(\d+)\+$/', $param, $matches) || preg_match('/^(above|>)\s*(\d+)$/', $param, $matches)) {
            // For "18+", matches[1] is 18
            // For "above 18", matches[2] is 18
            $minAge = isset($matches[2]) ? (int) $matches[2] : (int) $matches[1];

            // Logic: Age >= MinAge
            // dob <= now - MinAge
            $query->where('dob', '<=', now()->subYears($minAge)->format('Y-m-d'));
            return;
        }
    }

    protected function casts(): array
    {
        return [
            'dob' => 'date',
            'date_of_first_appointment' => 'date',
            'last_login' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function details()
    {
        return $this->hasOne(StaffDetail::class, 'service_no', 'service_no');
    }

    public function education()
    {
        return $this->hasMany(StaffEducation::class, 'service_no', 'service_no');
    }

    public function documents()
    {
        return $this->hasMany(StaffDocument::class, 'service_no', 'service_no');
    }

    public function assignedState()
    {
        return $this->belongsTo(State::class, 'assigned_state');
    }
}
