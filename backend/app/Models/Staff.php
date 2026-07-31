<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @method \Laravel\Sanctum\NewAccessToken createToken(string $name, array $abilities = ['*'], \DateTimeInterface|null $expiresAt = null)
 */
class Staff extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\StaffFactory> */
    use \App\Traits\AuthorizesScopedAccess, \App\Traits\FilterableTrait, \App\Traits\HasRolesTrait, \App\Traits\RetirementTrait, HasApiTokens, HasFactory, Notifiable;

    protected static function boot()
    {
        parent::boot();

        // Track initial rank and command when staff is first created
        static::created(function ($staff) {
            $changedBy = self::getAuthenticatedUserId();
            $careerRecords = [];

            // Track initial rank if provided
            if ($staff->present_rank) {
                // Load the relationship to get rank name
                $staff->load('presentRank');
                $rankName = $staff->presentRank?->title ?? $staff->present_rank;

                $careerRecords[] = [
                    'service_no' => $staff->service_no,
                    'field_changed' => 'present_rank',
                    'old_value' => null,
                    'new_value' => $rankName,
                    'effective_date' => now(),
                    'reason' => 'Initial rank assignment',
                    'changed_by' => $changedBy,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Track initial command if provided
            if ($staff->present_command) {
                // Load the relationship to get command name
                $staff->load('presentCommand');
                $commandName = $staff->presentCommand?->state ?? $staff->present_command;

                $careerRecords[] = [
                    'service_no' => $staff->service_no,
                    'field_changed' => 'present_command',
                    'old_value' => null,
                    'new_value' => $commandName,
                    'effective_date' => now(),
                    'reason' => 'Initial command assignment',
                    'changed_by' => $changedBy,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Bulk insert for better performance
            if (! empty($careerRecords)) {
                StaffCareer::insert($careerRecords);
            }
        });

        // Track changes to rank and command when staff is updated
        static::updating(function ($staff) {
            $changes = $staff->getDirty();

            // Check if rank or command fields have changed
            if (! isset($changes['present_rank']) && ! isset($changes['present_command'])) {
                return;
            }

            $changedBy = self::getAuthenticatedUserId();
            $careerRecords = [];

            // Handle rank changes
            if (isset($changes['present_rank'])) {
                // Get old rank name using relationship
                $oldRankName = null;
                if ($staff->getOriginal('present_rank')) {
                    $oldRank = Ranking::find($staff->getOriginal('present_rank'));
                    $oldRankName = $oldRank?->title ?? $staff->getOriginal('present_rank');
                }

                // Get new rank name using relationship
                $newRankName = null;
                if ($changes['present_rank']) {
                    $newRank = Ranking::find($changes['present_rank']);
                    $newRankName = $newRank?->title ?? $changes['present_rank'];
                }

                $careerRecords[] = [
                    'service_no' => $staff->service_no,
                    'field_changed' => 'present_rank',
                    'old_value' => $oldRankName,
                    'new_value' => $newRankName,
                    'effective_date' => now(),
                    'reason' => 'Rank update',
                    'changed_by' => $changedBy,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Handle command changes
            if (isset($changes['present_command'])) {
                // Get old command name using relationship
                $oldCommandName = null;
                if ($staff->getOriginal('present_command')) {
                    // Load the original relationship
                    $oldCommand = State::find($staff->getOriginal('present_command'));
                    $oldCommandName = $oldCommand?->state ?? $staff->getOriginal('present_command');
                }

                // Get new command name using relationship
                $newCommandName = null;
                if ($changes['present_command']) {
                    $newCommand = State::find($changes['present_command']);
                    $newCommandName = $newCommand?->state ?? $changes['present_command'];
                }

                $careerRecords[] = [
                    'service_no' => $staff->service_no,
                    'field_changed' => 'present_command',
                    'old_value' => $oldCommandName,
                    'new_value' => $newCommandName,
                    'effective_date' => now(),
                    'reason' => 'Command update',
                    'changed_by' => $changedBy,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // Bulk insert for better performance when both rank and command change
            if (! empty($careerRecords)) {
                StaffCareer::insert($careerRecords);
            }
        });
    }

    /**
     * Get the authenticated user ID from the request context.
     */
    protected static function getAuthenticatedUserId(): ?int
    {
        if (app()->bound('request')) {
            $request = app('request');
            $user = $request->user();
            if ($user) {
                return $user->id;
            }
        }

        return null;
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
        'station',
        'state_of_origin',
        'lga',
        'department',
        'work_distribution_id',
        'training_institute_id',
        'directorate_id',
        'staff_status_id',
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
        'present_rank_name',
        'initial_rank_name',
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
        'station',
        'work_distribution_id',
        'training_institute_id',
        'directorate_id',
        'staff_status_id',
    ];

    /**
     * Filter by Age Range.
     * Supported formats: "18-20", "less 18", "18+", "above 18"
     */
    public function filterAgeRange($query, $value)
    {
        \App\Helpers\FilterHelper::applyAgeRangeFilter($query, $value);
    }

    /**
     * Filter by assigned_state (FK to states.id).
     * Accepts a numeric id from the client, or a state name (legacy / wrong client).
     */
    public function filterAssignedState($query, $value): void
    {
        if ($value === '' || $value === null) {
            return;
        }
        if (is_numeric($value)) {
            $query->where('assigned_state', (int) $value);

            return;
        }
        $stateId = State::query()->where('state', (string) $value)->value('id');
        if ($stateId) {
            $query->where('assigned_state', $stateId);
        } else {
            $query->whereRaw('1 = 0');
        }
    }

    /**
     * Filter by prison (FK to prisons.id).
     * Accepts a numeric id from the client, or a prison_name (legacy).
     */
    public function filterPrison($query, $value): void
    {
        if ($value === '' || $value === null) {
            return;
        }
        if (is_numeric($value)) {
            $query->where('prison', (int) $value);

            return;
        }
        $prisonId = Prison::query()->where('prison_name', (string) $value)->value('id');
        if ($prisonId) {
            $query->where('prison', $prisonId);
        } else {
            $query->whereRaw('1 = 0');
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

    public function careerHistory()
    {
        return $this->hasMany(StaffCareer::class, 'service_no', 'service_no')->orderBy('created_at', 'desc');
    }

    public function postings()
    {
        return $this->hasMany(StaffPosting::class, 'service_no', 'service_no');
    }

    public function activePosting()
    {
        return $this->hasOne(StaffPosting::class, 'service_no', 'service_no')->where('status', 'active');
    }

    public function assignedState()
    {
        return $this->belongsTo(State::class, 'assigned_state');
    }

    public function prisonRelation()
    {
        return $this->belongsTo(Prison::class, 'prison');
    }

    public function initialCommand()
    {
        return $this->belongsTo(State::class, 'initial_command');
    }

    public function presentCommand()
    {
        return $this->belongsTo(State::class, 'present_command');
    }

    public function initialRank()
    {
        return $this->belongsTo(Ranking::class, 'initial_rank');
    }

    public function presentRank()
    {
        return $this->belongsTo(Ranking::class, 'present_rank');
    }

    public function workDistribution()
    {
        return $this->belongsTo(WorkDistribution::class, 'work_distribution_id');
    }

    public function trainingInstitute()
    {
        return $this->belongsTo(TrainingInstitute::class, 'training_institute_id');
    }

    public function directorate()
    {
        return $this->belongsTo(Directorate::class, 'directorate_id');
    }

    public function staffStatus()
    {
        return $this->belongsTo(Status::class, 'staff_status_id');
    }

    /**
     * Get all postings created by this staff member.
     */
    public function createdPostings()
    {
        return $this->morphMany(StaffPosting::class, 'creator');
    }

    /**
     * Get the present rank name from the relationship
     */
    public function getPresentRankNameAttribute(): ?string
    {
        return $this->presentRank?->title;
    }

    /**
     * Get the initial rank name from the relationship
     */
    public function getInitialRankNameAttribute(): ?string
    {
        return $this->initialRank?->title;
    }
}
