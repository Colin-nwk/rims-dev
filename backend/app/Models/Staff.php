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
