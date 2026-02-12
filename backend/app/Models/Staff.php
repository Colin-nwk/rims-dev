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
    protected static function boot()
    {
        parent::boot();

        static::updating(function ($staff) {
            // Check if rank or command fields have changed
            $changes = $staff->getDirty();

            if (isset($changes['present_rank']) || isset($changes['present_command'])) {
                // Get the user who made the change (from the request context if available)
                $changedBy = null;
                if (app()->bound('request')) {
                    $request = app('request');
                    $user = $request->user();
                    if ($user) {
                        $changedBy = $user->id;
                    }
                }

                // Create career history records for the changes
                if (isset($changes['present_rank'])) {
                    StaffCareer::create([
                        'service_no' => $staff->service_no,
                        'field_changed' => 'present_rank',
                        'old_value' => $staff->getOriginal('present_rank'),
                        'new_value' => $changes['present_rank'],
                        'effective_date' => now(),
                        'reason' => 'Rank update',
                        'changed_by' => $changedBy,
                    ]);
                }

                if (isset($changes['present_command'])) {
                    // Convert command IDs to state names for better readability
                    $oldCommandName = null;
                    $newCommandName = null;

                    if ($staff->getOriginal('present_command')) {
                        $oldState = State::find($staff->getOriginal('present_command'));
                        $oldCommandName = $oldState ? $oldState->state : $staff->getOriginal('present_command');
                    }

                    if ($changes['present_command']) {
                        $newState = State::find($changes['present_command']);
                        $newCommandName = $newState ? $newState->state : $changes['present_command'];
                    }

                    StaffCareer::create([
                        'service_no' => $staff->service_no,
                        'field_changed' => 'present_command',
                        'old_value' => $oldCommandName,
                        'new_value' => $newCommandName,
                        'effective_date' => now(),
                        'reason' => 'Command update',
                        'changed_by' => $changedBy,
                    ]);
                }
            }
        });
    }

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
        \App\Helpers\FilterHelper::applyAgeRangeFilter($query, $value);
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

    public function careerHistory()
    {
        return $this->hasMany(StaffCareer::class, 'service_no', 'service_no')->orderBy('created_at', 'desc');
    }

    public function assignedState()
    {
        return $this->belongsTo(State::class, 'assigned_state');
    }

    public function initialCommand()
    {
        return $this->belongsTo(State::class, 'initial_command');
    }

    public function presentCommand()
    {
        return $this->belongsTo(State::class, 'present_command');
    }
}
