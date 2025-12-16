<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Staff extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\StaffFactory> */
    use HasApiTokens, HasFactory, Notifiable, \App\Traits\FilterableTrait;

    protected $fillable = [
        'service_no',
        'email',
        'password',
        'assigned_state',
        'prison',
        'surname',
        'first_name',
        'other_names',
        'sex',
        'initial_rank',
        'present_rank',
        'level',
        'dob',
        'date_of_first_appointment',
        'state_of_origin',
        'lga',
        'department',
        'file_no',
        'duty',
        'description',
        'photo',
        'last_login',
        'status',
        'zone_id',
    ];

    public $searchable = [
        'service_no', 
        'surname', 
        'first_name', 
        'email', 
        'file_no',
    ];

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
}
