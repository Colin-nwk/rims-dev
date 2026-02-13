<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\StaffDetail;
use App\Models\StaffEducation;
use Illuminate\Support\Facades\Cache;

class StatisticsService
{
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Get all statistics with optional filters.
     *
     * @param  array<string, mixed>  $filters  Supported: state_of_origin, assigned_state, sex, present_rank, level, department, status, year_from, year_to, marital_status
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
            $query->where('staff.state_of_origin', $filters['state_of_origin']);
        }

        if (isset($filters['assigned_state'])) {
            $query->where('staff.assigned_state', $filters['assigned_state']);
        }

        if (isset($filters['sex'])) {
            $query->where('staff.sex', $filters['sex']);
        }

        if (isset($filters['present_rank'])) {
            $query->where('staff.present_rank', $filters['present_rank']);
        }

        if (isset($filters['level'])) {
            $query->where('staff.level', $filters['level']);
        }

        if (isset($filters['department'])) {
            $query->where('staff.department', $filters['department']);
        }

        if (isset($filters['status'])) {
            $query->where('staff.status', $filters['status']);
        }

        if (isset($filters['zone_id'])) {
            $query->where('staff.zone_id', $filters['zone_id']);
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
                    $q->where('state_of_origin', $filters['state_of_origin']);
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
                if (isset($filters['zone_id'])) {
                    $q->where('zone_id', $filters['zone_id']);
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
            || isset($filters['zone_id']);
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
        return $this->buildStaffQuery($filters)
            ->selectRaw('state_of_origin as label, COUNT(*) as count')
            ->groupBy('state_of_origin')
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
                'state' => $item->state_of_origin,
                'year' => $item->year,
                'count' => $item->count,
            ])
            ->toArray();
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
