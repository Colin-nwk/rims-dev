<?php

namespace App\Services;

use App\Models\Prison;
use App\Models\Staff;
use App\Models\StaffDetail;
use App\Models\StaffEducation;
use App\Models\State;
use Illuminate\Support\Facades\Cache;

class StatisticsService
{
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Get all statistics with optional filters.
     *
     * @param  array<string, mixed>  $filters  See StatisticsController::index for full list (includes directorate_id, staff_status_id, prison, zone_id, age_range, etc.)
     */
    public function getAll(array $filters = []): array
    {
        $cacheKey = 'statistics.all.'.md5(json_encode($filters));

        if (empty($filters)) {
            return Cache::remember($cacheKey, self::CACHE_TTL, fn () => $this->buildAllStats($filters));
        }

        return $this->buildAllStats($filters);
    }

    private function buildAllStats(array $filters): array
    {
        $staffQuery = $this->buildStaffQuery($filters);
        $totalStaff = (clone $staffQuery)->count();
        $totalDetails = $this->buildDetailsQuery($filters)->count();
        $totalEducation = StaffEducation::count();

        return [
            'overview' => [
                'total_staff' => $totalStaff,
                'staff_with_details' => $totalDetails,
                'education_records' => $totalEducation,
                'filters_applied' => ! empty($filters),
            ],
            'gender' => $this->getGenderDistribution($filters, $totalStaff),
            'marital_status' => $this->getMaritalStatusDistribution($filters, $totalDetails),
            'state_of_origin' => $this->getStateOfOriginDistribution($filters, $totalStaff),
            'assigned_state' => $this->getAssignedStateDistribution($filters, $totalStaff),
            'zone' => $this->getZoneDistribution($filters, $totalStaff),
            'present_rank' => $this->getPresentRankDistribution($filters, $totalStaff),
            'initial_rank' => $this->getInitialRankDistribution($filters, $totalStaff),
            'initial_command' => $this->getInitialCommandDistribution($filters, $totalStaff),
            'present_command' => $this->getPresentCommandDistribution($filters, $totalStaff),
            'level' => $this->getLevelDistribution($filters, $totalStaff),
            'department' => $this->getDepartmentDistribution($filters, $totalStaff),
            'education_type' => $this->getEducationTypeDistribution($totalEducation),
            'staff_status' => $this->getStaffStatusDistribution($filters, $totalStaff),
            'appointment_by_year' => $this->getAppointmentByYear($filters, $totalStaff),
            'appointment_by_month' => $this->getAppointmentByMonth($filters, $totalStaff),
            'age_groups' => $this->getAgeGroupsDistribution($filters, $totalStaff),
            'prison' => $this->getPrisonDistribution($filters, $totalStaff),
            'lga' => $this->getLgaDistribution($filters, $totalStaff),
            'retirement_eligibility' => $this->getRetirementEligibilityDistribution($filters, $totalStaff),
            'promotion_eligibility' => $this->getPromotionEligibilityDistribution($filters, $totalStaff),
        ];
    }

    public function getGenderStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getGenderDistribution($filters, $total);
    }

    public function getMaritalStatusStats(array $filters = []): array
    {
        $query = $this->buildDetailsQuery($filters);
        $total = (clone $query)->count();

        return $this->getMaritalStatusDistribution($filters, $total);
    }

    public function getStateOfOriginStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getStateOfOriginDistribution($filters, $total);
    }

    public function getAssignedStateStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getAssignedStateDistribution($filters, $total);
    }

    public function getZoneStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getZoneDistribution($filters, $total);
    }

    public function getLevelStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getLevelDistribution($filters, $total);
    }

    public function getDepartmentStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getDepartmentDistribution($filters, $total);
    }

    public function getStaffStatusStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getStaffStatusDistribution($filters, $total);
    }

    public function getRankStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getPresentRankDistribution($filters, $total);
    }

    public function getInitialRankStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getInitialRankDistribution($filters, $total);
    }

    public function getInitialCommandStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getInitialCommandDistribution($filters, $total);
    }

    public function getPresentCommandStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getPresentCommandDistribution($filters, $total);
    }

    public function getEducationTypeStats(array $filters = []): array
    {
        $total = StaffEducation::count();

        return $this->getEducationTypeDistribution($total);
    }

    public function getAppointmentTrends(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();
        $appointmentQuery = (clone $query)->whereNotNull('date_of_first_appointment');

        return [
            'by_year' => $this->getAppointmentByYear($filters, $total),
            'by_month' => $this->getAppointmentByMonth($filters, $total),
            'by_state_origin_year' => $this->getAppointmentByStateOriginYear($filters),
            'summary' => [
                'with_date' => (clone $appointmentQuery)->count(),
                'without_date' => (clone $query)->whereNull('date_of_first_appointment')->count(),
                'earliest' => (clone $appointmentQuery)->min('date_of_first_appointment'),
                'latest' => (clone $appointmentQuery)->max('date_of_first_appointment'),
            ],
        ];
    }

    /**
     * Build base staff query with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    private function buildStaffQuery(array $filters): \Illuminate\Database\Eloquent\Builder
    {
        $query = Staff::query();

        if (isset($filters['state_of_origin'])) {
            // Normalize state_of_origin filter to match stored format (uppercase)
            $stateOrigin = strtoupper($filters['state_of_origin']);
            // Handle F.C.T. / FCT normalization
            if ($stateOrigin === 'F.C.T.' || $stateOrigin === 'FCT') {
                $query->where(function ($q) {
                    $q->whereRaw('UPPER(state_of_origin) = ?', ['FCT'])
                        ->orWhereRaw('UPPER(REPLACE(state_of_origin, ".", "")) = ?', ['FCT']);
                });
            } else {
                $query->whereRaw('UPPER(state_of_origin) = ?', [$stateOrigin]);
            }
        }

        if (isset($filters['assigned_state'])) {
            $value = $filters['assigned_state'];
            if ($value === '' || $value === null) {
                // Skip empty
            } elseif (is_numeric($value)) {
                $query->where('staff.assigned_state', (int) $value);
            } else {
                $stateId = State::query()->where('state', (string) $value)->value('id');
                if ($stateId) {
                    $query->where('staff.assigned_state', $stateId);
                } else {
                    $query->whereRaw('1 = 0');
                }
            }
        }

        if (isset($filters['sex'])) {
            $query->where('staff.sex', $filters['sex']);
        }

        if (isset($filters['present_rank'])) {
            $query->where('staff.present_rank', $filters['present_rank']);
        }

        if (isset($filters['initial_rank'])) {
            $query->where('staff.initial_rank', $filters['initial_rank']);
        }

        if (isset($filters['present_command'])) {
            $query->where('staff.present_command', $filters['present_command']);
        }

        if (isset($filters['initial_command'])) {
            $query->where('staff.initial_command', $filters['initial_command']);
        }

        if (isset($filters['level'])) {
            $query->where('staff.level', $filters['level']);
        }

        if (isset($filters['department'])) {
            $query->where('staff.department', $filters['department']);
        }

        if (isset($filters['directorate_id'])) {
            $query->where('staff.directorate_id', $filters['directorate_id']);
        }

        if (isset($filters['status'])) {
            $query->where('staff.status', $filters['status']);
        }

        if (isset($filters['staff_status_id'])) {
            $query->where('staff.staff_status_id', $filters['staff_status_id']);
        }

        if (isset($filters['work_distribution_id'])) {
            $query->where('staff.work_distribution_id', $filters['work_distribution_id']);
        }

        if (isset($filters['training_institute_id'])) {
            $query->where('staff.training_institute_id', $filters['training_institute_id']);
        }

        if (isset($filters['prison'])) {
            $value = $filters['prison'];
            if ($value === '' || $value === null) {
                // Skip empty
            } elseif (is_numeric($value)) {
                $query->where('staff.prison', (int) $value);
            } else {
                $prisonId = Prison::query()->where('prison_name', (string) $value)->value('id');
                if ($prisonId) {
                    $query->where('staff.prison', $prisonId);
                } else {
                    $query->whereRaw('1 = 0');
                }
            }
        }

        if (isset($filters['lga'])) {
            $query->whereRaw('UPPER(lga) = ?', [strtoupper($filters['lga'])]);
        }

        if (isset($filters['zone_id'])) {
            // Filter by zone via states table
            $query->whereHas('assignedState', function ($q) use ($filters) {
                $q->where('zone_id', $filters['zone_id']);
            });
        }

        if (isset($filters['zone'])) {
            // Filter by zone letter (e.g., "A", "B", "C") via states table
            $query->whereHas('assignedState', function ($q) use ($filters) {
                $q->where('zone', $filters['zone']);
            });
        }

        if (isset($filters['age_range'])) {
            // Apply age range filter using FilterHelper
            \App\Helpers\FilterHelper::applyAgeRangeFilter($query, $filters['age_range']);
        }

        if (isset($filters['year_from'])) {
            $query->whereYear('staff.date_of_first_appointment', '>=', $filters['year_from']);
        }

        if (isset($filters['year_to'])) {
            $query->whereYear('staff.date_of_first_appointment', '<=', $filters['year_to']);
        }

        return $query;
    }

    /**
     * Build staff details query with filters applied.
     *
     * @param  array<string, mixed>  $filters
     */
    private function buildDetailsQuery(array $filters): \Illuminate\Database\Eloquent\Builder
    {
        $query = StaffDetail::query();

        if (isset($filters['marital_status'])) {
            $query->where('marital_status', $filters['marital_status']);
        }

        // Join staff for staff-level filters
        if ($this->hasStaffFilters($filters)) {
            $query->whereHas('staff', function ($q) use ($filters) {
                if (isset($filters['state_of_origin'])) {
                    $stateOrigin = strtoupper($filters['state_of_origin']);
                    if ($stateOrigin === 'F.C.T.' || $stateOrigin === 'FCT') {
                        $q->where(function ($subQ) {
                            $subQ->whereRaw('UPPER(state_of_origin) = ?', ['FCT'])
                                ->orWhereRaw('UPPER(REPLACE(state_of_origin, ".", "")) = ?', ['FCT']);
                        });
                    } else {
                        $q->whereRaw('UPPER(state_of_origin) = ?', [$stateOrigin]);
                    }
                }
                if (isset($filters['assigned_state'])) {
                    $q->where('assigned_state', $filters['assigned_state']);
                }
                if (isset($filters['sex'])) {
                    $q->where('sex', $filters['sex']);
                }
                if (isset($filters['status'])) {
                    $q->where('status', $filters['status']);
                }
                if (isset($filters['directorate_id'])) {
                    $q->where('directorate_id', $filters['directorate_id']);
                }
                if (isset($filters['staff_status_id'])) {
                    $q->where('staff_status_id', $filters['staff_status_id']);
                }
                if (isset($filters['work_distribution_id'])) {
                    $q->where('work_distribution_id', $filters['work_distribution_id']);
                }
                if (isset($filters['training_institute_id'])) {
                    $q->where('training_institute_id', $filters['training_institute_id']);
                }
                if (isset($filters['zone_id'])) {
                    $q->whereHas('assignedState', function ($zoneQ) use ($filters) {
                        $zoneQ->where('zone_id', $filters['zone_id']);
                    });
                }
                if (isset($filters['zone'])) {
                    $q->whereHas('assignedState', function ($zoneQ) use ($filters) {
                        $zoneQ->where('zone', $filters['zone']);
                    });
                }
                if (isset($filters['present_command'])) {
                    $q->where('present_command', $filters['present_command']);
                }
                if (isset($filters['initial_command'])) {
                    $q->where('initial_command', $filters['initial_command']);
                }
                if (isset($filters['present_rank'])) {
                    $q->where('present_rank', $filters['present_rank']);
                }
                if (isset($filters['initial_rank'])) {
                    $q->where('initial_rank', $filters['initial_rank']);
                }
                if (isset($filters['prison'])) {
                    $q->where('prison', $filters['prison']);
                }
                if (isset($filters['lga'])) {
                    $q->whereRaw('UPPER(lga) = ?', [strtoupper($filters['lga'])]);
                }
            });
        }

        return $query;
    }

    private function hasStaffFilters(array $filters): bool
    {
        return isset($filters['state_of_origin'])
            || isset($filters['assigned_state'])
            || isset($filters['sex'])
            || isset($filters['status'])
            || isset($filters['directorate_id'])
            || isset($filters['staff_status_id'])
            || isset($filters['work_distribution_id'])
            || isset($filters['training_institute_id'])
            || isset($filters['zone_id'])
            || isset($filters['zone'])
            || isset($filters['present_command'])
            || isset($filters['initial_command'])
            || isset($filters['present_rank'])
            || isset($filters['initial_rank'])
            || isset($filters['prison'])
            || isset($filters['lga']);
    }

    private function getGenderDistribution(array $filters, int $total): array
    {
        return $this->buildStaffQuery($filters)
            ->selectRaw('sex as label, COUNT(*) as count')
            ->groupBy('sex')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Not Specified',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getMaritalStatusDistribution(array $filters, int $total): array
    {
        return $this->buildDetailsQuery($filters)
            ->selectRaw('marital_status as label, COUNT(*) as count')
            ->groupBy('marital_status')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Not Specified',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getStateOfOriginDistribution(array $filters, int $total): array
    {
        // Normalize state_of_origin: lowercase, treat F.C.T. and FCT as same
        return $this->buildStaffQuery($filters)
            ->selectRaw('LOWER(REPLACE(state_of_origin, ".", "")) as normalized, state_of_origin as original, COUNT(*) as count')
            ->groupBy('normalized', 'original')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $this->normalizeStateLabel($item->original),
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->groupBy('label')
            ->map(fn ($group) => [
                'label' => $group->first()['label'],
                'count' => $group->sum('count'),
                'percentage' => $total > 0 ? round(($group->sum('count') / $total) * 100, 2) : 0,
            ])
            ->values()
            ->toArray();
    }

    /**
     * Normalize state label for consistent display.
     * - Convert to title case
     * - Treat F.C.T. and FCT as "F.C.T."
     */
    private function normalizeStateLabel(?string $label): string
    {
        if (empty($label)) {
            return 'Not Specified';
        }

        $normalized = strtoupper(trim($label));

        // Treat FCT and F.C.T. as the same
        if ($normalized === 'FCT' || $normalized === 'F.C.T.') {
            return 'F.C.T.';
        }

        // Convert to title case (e.g., "ABIA" → "Abia", "CROSS RIVER" → "Cross River")
        return ucwords(strtolower($normalized));
    }

    private function getAssignedStateDistribution(array $filters, int $total): array
    {
        return $this->buildStaffQuery($filters)
            ->leftJoin('states', 'staff.assigned_state', '=', 'states.id')
            ->selectRaw('states.state as label, COUNT(*) as count')
            ->groupBy('states.state')
            ->orderByDesc('count')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Unassigned',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getZoneDistribution(array $filters, int $total): array
    {
        // Get zone from states table via assigned_state
        // Zone is stored as a single letter in states.zone column
        return $this->buildStaffQuery($filters)
            ->leftJoin('states', 'staff.assigned_state', '=', 'states.id')
            ->selectRaw('states.zone as label, COUNT(*) as count')
            ->whereNotNull('states.zone')
            ->groupBy('states.zone')
            ->orderBy('states.zone')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ? 'Zone '.$item->label : 'Unassigned',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getPresentRankDistribution(array $filters, int $total): array
    {
        return $this->buildStaffQuery($filters)
            ->leftJoin('rankings', 'staff.present_rank', '=', 'rankings.title')
            ->selectRaw('COALESCE(rankings.title, staff.present_rank) as label, COUNT(*) as count')
            ->groupBy('label')
            ->orderByDesc('count')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Not Specified',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getInitialCommandDistribution(array $filters, int $total): array
    {
        return $this->buildStaffQuery($filters)
            ->leftJoin('states as initial_states', 'staff.initial_command', '=', 'initial_states.id')
            ->selectRaw('COALESCE(initial_states.state, "Unassigned") as label, COUNT(*) as count')
            ->groupBy('label')
            ->orderByDesc('count')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Not Specified',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getPresentCommandDistribution(array $filters, int $total): array
    {
        return $this->buildStaffQuery($filters)
            ->leftJoin('states as present_states', 'staff.present_command', '=', 'present_states.id')
            ->selectRaw('COALESCE(present_states.state, "Unassigned") as label, COUNT(*) as count')
            ->groupBy('label')
            ->orderByDesc('count')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Not Specified',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getInitialRankDistribution(array $filters, int $total): array
    {
        return $this->buildStaffQuery($filters)
            ->leftJoin('rankings as initial_rankings', 'staff.initial_rank', '=', 'initial_rankings.title')
            ->selectRaw('COALESCE(initial_rankings.title, staff.initial_rank) as label, COUNT(*) as count')
            ->groupBy('label')
            ->orderByDesc('count')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Not Specified',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getLevelDistribution(array $filters, int $total): array
    {
        $driver = config('database.default');
        $connection = config("database.connections.{$driver}.driver");
        $concat = $connection === 'sqlite' ? "'GL-' || staff.level" : "CONCAT('GL-', staff.level)";

        return $this->buildStaffQuery($filters)
            ->leftJoin('levels', 'staff.level', '=', 'levels.level_number')
            ->selectRaw("COALESCE(levels.level, {$concat}) as label, COUNT(*) as count")
            ->groupBy('label', 'staff.level')
            ->orderBy('staff.level')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Not Specified',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getDepartmentDistribution(array $filters, int $total): array
    {
        return $this->buildStaffQuery($filters)
            ->selectRaw('department as label, COUNT(*) as count')
            ->groupBy('department')
            ->orderByDesc('count')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Not Specified',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getEducationTypeDistribution(int $total): array
    {
        return StaffEducation::query()
            ->selectRaw('type as label, COUNT(*) as count')
            ->groupBy('type')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Not Specified',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getStaffStatusDistribution(array $filters, int $total): array
    {
        return $this->buildStaffQuery($filters)
            ->selectRaw('status as label, COUNT(*) as count')
            ->groupBy('status')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label,
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getAppointmentByYear(array $filters, int $total): array
    {
        $yearExpr = $this->getYearExpression('date_of_first_appointment');

        return $this->buildStaffQuery($filters)
            ->selectRaw("{$yearExpr} as label, COUNT(*) as count")
            ->whereNotNull('date_of_first_appointment')
            ->groupBy('label')
            ->orderBy('label')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label,
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getAppointmentByMonth(array $filters, int $total): array
    {
        $months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $monthExpr = $this->getMonthExpression('date_of_first_appointment');

        return $this->buildStaffQuery($filters)
            ->selectRaw("{$monthExpr} as month_num, COUNT(*) as count")
            ->whereNotNull('date_of_first_appointment')
            ->groupBy('month_num')
            ->orderBy('month_num')
            ->get()
            ->map(fn ($item) => [
                'label' => $months[$item->month_num] ?? $item->month_num,
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getAppointmentByStateOriginYear(array $filters = []): array
    {
        $yearExpr = $this->getYearExpression('date_of_first_appointment');

        return $this->buildStaffQuery($filters)
            ->selectRaw("state_of_origin, {$yearExpr} as year, COUNT(*) as count")
            ->whereNotNull('date_of_first_appointment')
            ->whereNotNull('state_of_origin')
            ->groupBy('state_of_origin', 'year')
            ->orderBy('state_of_origin')
            ->orderBy('year')
            ->orderBy('year')
            ->get()
            ->map(fn ($item) => [
                'state' => $this->normalizeStateLabel($item->state_of_origin),
                'year' => $item->year,
                'count' => $item->count,
            ])
            ->toArray();
    }

    // ========================================================================
    // NEW STATISTICS METHODS
    // ========================================================================

    /**
     * Get age groups distribution.
     * Age groups: 18-24, 25-34, 35-44, 45-54, 55-59, 60+
     */
    public function getAgeGroupsStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getAgeGroupsDistribution($filters, $total);
    }

    /**
     * Get prison distribution.
     */
    public function getPrisonStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getPrisonDistribution($filters, $total);
    }

    /**
     * Get LGA distribution.
     */
    public function getLgaStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getLgaDistribution($filters, $total);
    }

    /**
     * Get document verification status distribution.
     */
    public function getDocumentVerificationStats(array $filters = []): array
    {
        $total = $this->buildDocumentsQuery($filters)->count();

        return $this->getDocumentVerificationDistribution($filters, $total);
    }

    /**
     * Get document expiry status distribution.
     */
    public function getDocumentExpiryStats(array $filters = []): array
    {
        $total = $this->buildDocumentsQuery($filters)->count();

        return $this->getDocumentExpiryDistribution($filters, $total);
    }

    /**
     * Get retirement eligibility statistics.
     */
    public function getRetirementEligibilityStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getRetirementEligibilityDistribution($filters, $total);
    }

    /**
     * Get promotion eligibility statistics.
     */
    public function getPromotionEligibilityStats(array $filters = []): array
    {
        $query = $this->buildStaffQuery($filters);
        $total = (clone $query)->count();

        return $this->getPromotionEligibilityDistribution($filters, $total);
    }

    // ========================================================================
    // DISTRIBUTION METHODS
    // ========================================================================

    private function getAgeGroupsDistribution(array $filters, int $total): array
    {
        $driver = config('database.default');
        $connection = config("database.connections.{$driver}.driver");

        // Calculate age using database-specific syntax
        if ($connection === 'sqlite') {
            $ageCalc = "CAST((julianday('now') - julianday(staff.dob)) / 365.25 AS INTEGER)";
        } else {
            $ageCalc = 'TIMESTAMPDIFF(YEAR, staff.dob, CURDATE())';
        }

        return $this->buildStaffQuery($filters)
            ->selectRaw("{$ageCalc} as age")
            ->whereNotNull('dob')
            ->get()
            ->groupBy(function ($item) {
                $age = $item->age;
                if ($age < 18) {
                    return 'Under 18';
                } elseif ($age < 25) {
                    return '18-24';
                } elseif ($age < 35) {
                    return '25-34';
                } elseif ($age < 45) {
                    return '35-44';
                } elseif ($age < 55) {
                    return '45-54';
                } elseif ($age < 60) {
                    return '55-59';
                } else {
                    return '60+';
                }
            })
            ->map(function ($group, $label) use ($total) {
                return [
                    'label' => $label,
                    'count' => $group->count(),
                    'percentage' => $total > 0 ? round(($group->count() / $total) * 100, 2) : 0,
                ];
            })
            ->values()
            ->sortBy('label')
            ->toArray();
    }

    private function getPrisonDistribution(array $filters, int $total): array
    {
        return $this->buildStaffQuery($filters)
            ->leftJoin('prisons', 'staff.prison', '=', 'prisons.id')
            ->selectRaw('prisons.prison_name as label, COUNT(*) as count')
            ->groupBy('prisons.prison_name')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => $item->label ?? 'Unassigned',
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getLgaDistribution(array $filters, int $total): array
    {
        // LGA is stored as string in staff table
        return $this->buildStaffQuery($filters)
            ->selectRaw('lga as label, COUNT(*) as count')
            ->whereNotNull('lga')
            ->where('lga', '!=', '')
            ->groupBy('lga')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => ucwords(strtolower($item->label)),
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getDocumentVerificationDistribution(array $filters, int $total): array
    {
        return $this->buildDocumentsQuery($filters)
            ->selectRaw('verification_status as label, COUNT(*) as count')
            ->groupBy('verification_status')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($item) => [
                'label' => ucfirst($item->label ?? 'unknown'),
                'count' => $item->count,
                'percentage' => $total > 0 ? round(($item->count / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getDocumentExpiryDistribution(array $filters, int $total): array
    {
        $driver = config('database.default');
        $connection = config("database.connections.{$driver}.driver");

        // Calculate expiry status
        if ($connection === 'sqlite') {
            $expiredCondition = "expires_at IS NOT NULL AND expires_at < date('now')";
            $expiringSoonCondition = "expires_at IS NOT NULL AND expires_at >= date('now') AND expires_at <= date('now', '+30 days')";
        } else {
            $expiredCondition = 'expires_at IS NOT NULL AND expires_at < CURDATE()';
            $expiringSoonCondition = 'expires_at IS NOT NULL AND expires_at >= CURDATE() AND expires_at <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)';
        }

        $query = $this->buildDocumentsQuery($filters);

        $expired = (clone $query)->whereRaw($expiredCondition)->count();
        $expiringSoon = (clone $query)->whereRaw($expiringSoonCondition)->count();
        $valid = (clone $query)
            ->whereRaw("expires_at IS NOT NULL AND NOT ({$expiredCondition}) AND NOT ({$expiringSoonCondition})")
            ->count();
        $noExpiry = (clone $query)->whereNull('expires_at')->count();

        return collect([
            ['label' => 'Expired', 'count' => $expired],
            ['label' => 'Expiring Soon (30 days)', 'count' => $expiringSoon],
            ['label' => 'Valid', 'count' => $valid],
            ['label' => 'No Expiry Date', 'count' => $noExpiry],
        ])
            ->filter(fn ($item) => $item['count'] > 0)
            ->map(fn ($item) => [
                'label' => $item['label'],
                'count' => $item['count'],
                'percentage' => $total > 0 ? round(($item['count'] / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getRetirementEligibilityDistribution(array $filters, int $total): array
    {
        $driver = config('database.default');
        $connection = config("database.connections.{$driver}.driver");

        // Calculate retirement age (60 years) eligibility
        if ($connection === 'sqlite') {
            $eligibleCondition = "(julianday('now') - julianday(dob)) / 365.25 >= 57";
            $dueIn1Year = "(julianday('now') - julianday(dob)) / 365.25 >= 59";
        } else {
            $eligibleCondition = 'TIMESTAMPDIFF(YEAR, dob, CURDATE()) >= 57';
            $dueIn1Year = 'TIMESTAMPDIFF(YEAR, dob, CURDATE()) >= 59';
        }

        $query = $this->buildStaffQuery($filters);

        $eligibleNow = (clone $query)->whereRaw($eligibleCondition)->count();
        $dueIn1Year = (clone $query)->whereRaw($dueIn1Year)->count();
        $notEligible = $total - $eligibleNow;

        return collect([
            ['label' => 'Eligible (57+ years)', 'count' => $eligibleNow],
            ['label' => 'Due in 1 Year (59+ years)', 'count' => $dueIn1Year],
            ['label' => 'Not Yet Eligible', 'count' => $notEligible],
        ])
            ->map(fn ($item) => [
                'label' => $item['label'],
                'count' => $item['count'],
                'percentage' => $total > 0 ? round(($item['count'] / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    private function getPromotionEligibilityDistribution(array $filters, int $total): array
    {
        // Promotion eligibility based on years in current rank (minimum 3 years)
        $driver = config('database.default');
        $connection = config("database.connections.{$driver}.driver");

        if ($connection === 'sqlite') {
            $yearsInRank = "CAST((julianday('now') - julianday(present_appointment_date)) / 365.25 AS INTEGER)";
        } else {
            $yearsInRank = 'TIMESTAMPDIFF(YEAR, present_appointment_date, CURDATE())';
        }

        $query = $this->buildStaffQuery($filters);

        $eligible = (clone $query)
            ->whereNotNull('present_appointment_date')
            ->whereRaw("{$yearsInRank} >= 3")
            ->count();

        $dueSoon = (clone $query)
            ->whereNotNull('present_appointment_date')
            ->whereRaw("{$yearsInRank} >= 2 AND {$yearsInRank} < 3")
            ->count();

        $notEligible = $total - $eligible - $dueSoon;

        return collect([
            ['label' => 'Eligible (3+ years)', 'count' => $eligible],
            ['label' => 'Due Soon (2-3 years)', 'count' => $dueSoon],
            ['label' => 'Not Yet Eligible', 'count' => max(0, $notEligible)],
        ])
            ->map(fn ($item) => [
                'label' => $item['label'],
                'count' => $item['count'],
                'percentage' => $total > 0 ? round(($item['count'] / $total) * 100, 2) : 0,
            ])
            ->toArray();
    }

    /**
     * Build documents query with filters applied.
     */
    private function buildDocumentsQuery(array $filters): \Illuminate\Database\Eloquent\Builder
    {
        $query = \App\Models\StaffDocument::query();

        if (isset($filters['verification_status'])) {
            $query->where('verification_status', $filters['verification_status']);
        }

        if (isset($filters['document_type'])) {
            $query->where('document_type', $filters['document_type']);
        }

        return $query;
    }

    /**
     * Get database-agnostic YEAR expression.
     */
    private function getYearExpression(string $column): string
    {
        $driver = config('database.default');
        $connection = config("database.connections.{$driver}.driver");

        if ($connection === 'sqlite') {
            return "strftime('%Y', {$column})";
        }

        return "YEAR({$column})";
    }

    /**
     * Get database-agnostic MONTH expression.
     */
    private function getMonthExpression(string $column): string
    {
        $driver = config('database.default');
        $connection = config("database.connections.{$driver}.driver");

        if ($connection === 'sqlite') {
            return "CAST(strftime('%m', {$column}) AS INTEGER)";
        }

        return "MONTH({$column})";
    }

    /**
     * Clear cached statistics.
     */
    public function clearCache(): void
    {
        Cache::forget('statistics.all.'.md5(json_encode([])));
    }
}
