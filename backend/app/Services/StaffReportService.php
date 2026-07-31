<?php

namespace App\Services;

use App\Models\Directorate;
use App\Models\Prison;
use App\Models\Ranking;
use App\Models\Staff;
use App\Models\StaffDetail;
use App\Models\State;
use App\Models\Status;
use App\Models\TrainingInstitute;
use App\Models\WorkDistribution;
use App\Models\Zone;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class StaffReportService
{
    private const MISSING_FIELD_OPTIONS = [
        'email' => 'Work email',
        'phone_number' => 'Phone number',
        'photo' => 'Photo',
        'date_of_birth' => 'Date of birth',
        'rank' => 'Present rank',
        'department' => 'Department',
        'directorate' => 'Directorate',
        'work_distribution' => 'Work distribution',
        'training_institute' => 'Training institute',
        'zone' => 'Zone',
        'custodial_centre' => 'Custodial centre',
        'staff_status' => 'Staff status',
        'last_login' => 'Last login',
        'blood_group' => 'Blood group',
        'genotype' => 'Genotype',
        'nin' => 'NIN',
        'bvn' => 'BVN',
        'pension_pin' => 'Pension PIN',
        'bank_account' => 'Bank account',
        'education' => 'Education record',
    ];

    private const RELATIONSHIPS = [
        'assignedState:id,state,zone_id',
        'prisonRelation:id,prison_name,state_id',
        'presentRank:id,title',
        'initialRank:id,title',
        'directorate:id,name',
        'workDistribution:id,name',
        'trainingInstitute:id,name',
        'staffStatus:id,name',
        'roles:id,name',
    ];

    public function __construct(private readonly StaffReportScopeResolver $scopeResolver) {}

    /**
     * @param  array{global: bool, prison_ids: array<int>, state_ids: array<int>, zone_ids: array<int>}  $scope
     * @return array<string, mixed>
     */
    public function generate(StaffReportCriteria $criteria, array $scope): array
    {
        $query = $this->filteredQuery($criteria, $scope);

        return [
            'summary' => $criteria->includes('summary') ? $this->summary($query) : null,
            'details' => $criteria->includes('details') ? $this->details($query, $criteria) : null,
        ];
    }

    /**
     * @param  array{global: bool, prison_ids: array<int>, state_ids: array<int>, zone_ids: array<int>}  $scope
     */
    public function filteredQuery(StaffReportCriteria $criteria, array $scope): Builder
    {
        $query = $this->scopeResolver->apply(Staff::query(), $scope);
        $filters = $criteria->filters();

        if (isset($filters['search'])) {
            $term = '%'.addcslashes($filters['search'], '%_\\').'%';
            $query->where(function (Builder $search) use ($term): void {
                $search->where('staff.service_no', 'like', $term)
                    ->orWhere('staff.file_no', 'like', $term)
                    ->orWhere('staff.ippis', 'like', $term)
                    ->orWhere('staff.email', 'like', $term)
                    ->orWhere('staff.surname', 'like', $term)
                    ->orWhere('staff.first_name', 'like', $term)
                    ->orWhere('staff.other_names', 'like', $term);
            });
        }

        $this->applyListFilter($query, $filters, 'statuses', 'staff.status');
        $this->applyListFilter($query, $filters, 'staff_status_ids', 'staff.staff_status_id');
        $this->applyListFilter($query, $filters, 'sex', 'staff.sex');
        $this->applyListFilter($query, $filters, 'directorate_ids', 'staff.directorate_id');
        $this->applyListFilter($query, $filters, 'work_distribution_ids', 'staff.work_distribution_id');
        $this->applyListFilter($query, $filters, 'training_institute_ids', 'staff.training_institute_id');
        $this->applyListFilter($query, $filters, 'rank_ids', 'staff.present_rank');
        $this->applyListFilter($query, $filters, 'levels', 'staff.level');
        if (($filters['zone_ids'] ?? []) !== []) {
            $zoneIds = $filters['zone_ids'];
            $query->where(function (Builder $zones) use ($zoneIds): void {
                $zones->whereIn('staff.zone_id', $zoneIds)
                    ->orWhereHas('assignedState', fn (Builder $state) => $state->whereIn('zone_id', $zoneIds))
                    ->orWhereHas('prisonRelation.state', fn (Builder $state) => $state->whereIn('zone_id', $zoneIds));
            });
        }
        $this->applyListFilter($query, $filters, 'state_ids', 'staff.assigned_state');
        $this->applyListFilter($query, $filters, 'prison_ids', 'staff.prison');
        $this->applyListFilter($query, $filters, 'departments', 'staff.department');

        $this->applyDetailListFilter($query, $filters, 'blood_groups', 'blood_group');
        $this->applyDetailListFilter($query, $filters, 'genotypes', 'genotype');
        $this->applyDetailListFilter($query, $filters, 'marital_statuses', 'marital_status');

        if (isset($filters['age']['min'])) {
            $query->whereDate('staff.dob', '<=', today()->subYears((int) $filters['age']['min']));
        }
        if (isset($filters['age']['max'])) {
            $query->whereDate('staff.dob', '>', today()->subYears((int) $filters['age']['max'] + 1));
        }

        foreach ($filters['missing_fields'] ?? [] as $field) {
            $this->applyMissingField($query, $field);
        }

        $this->applyDateRange($query, $filters['appointment_date'] ?? null, 'staff.date_of_first_appointment');
        $this->applyDateRange($query, $filters['date_of_birth'] ?? null, 'staff.dob');
        $this->applyDateRange($query, $filters['record_created'] ?? null, 'staff.created_at');
        $this->applyDateRange($query, $filters['last_login'] ?? null, 'staff.last_login');

        if (array_key_exists('has_email', $filters)) {
            $this->applyPresenceFilter($query, 'staff.email', (bool) $filters['has_email']);
        }
        if (array_key_exists('has_photo', $filters)) {
            $this->applyPresenceFilter($query, 'staff.photo', (bool) $filters['has_photo']);
        }
        if (($filters['never_logged_in'] ?? false) === true) {
            $query->whereNull('staff.last_login');
        }
        if (array_key_exists('verified', $filters)) {
            $query->where('staff.is_verified', (bool) $filters['verified']);
        }
        if (array_key_exists('has_education', $filters)) {
            $filters['has_education'] ? $query->whereHas('education') : $query->whereDoesntHave('education');
        }

        return $query;
    }

    /** @return array<string, mixed> */
    public function detail(Staff $staff): array
    {
        $staff->load(array_merge(self::RELATIONSHIPS, [
            'education:id,service_no,institution,course,type,start_date,end_date',
            'activePosting',
        ]));

        return array_merge($this->row($staff), [
            'identity' => array_merge($this->row($staff)['identity'], [
                'date_of_birth' => $staff->dob?->format('Y-m-d'),
                'state_of_origin' => $staff->state_of_origin,
                'lga' => $staff->lga,
            ]),
            'employment' => array_merge($this->row($staff)['employment'], [
                'initial_rank' => $staff->initialRank?->title,
                'step' => $staff->step,
                'duty' => $staff->duty,
                'present_appointment_date' => $staff->present_appointment_date,
            ]),
            'education' => $staff->education->map(fn ($education) => [
                'id' => $education->id,
                'institution' => $education->institution,
                'course' => $education->course,
                'type' => $education->type,
                'start_date' => $education->start_date,
                'end_date' => $education->end_date,
            ])->values()->all(),
            'active_posting' => $staff->activePosting ? [
                'type' => $staff->activePosting->type,
                'station_name' => $staff->activePosting->station_name,
                'station_location' => $staff->activePosting->station_location,
                'start_date' => $staff->activePosting->start_date?->format('Y-m-d'),
            ] : null,
        ]);
    }

    public function canAccess(Staff $staff, array $scope): bool
    {
        return $this->scopeResolver->apply(Staff::query()->whereKey($staff->getKey()), $scope)->exists();
    }

    /** @return array<string, mixed> */
    public function options(array $scope, StaffReportColumnRegistry $columns): array
    {
        $population = $this->scopeResolver->apply(Staff::query(), $scope);
        $ids = fn (string $column) => (clone $population)->whereNotNull($column)->distinct()->pluck($column);
        $detailValues = fn (string $column) => StaffDetail::query()
            ->whereIn('service_no', (clone $population)->select('staff.service_no'))
            ->whereNotNull($column)
            ->where($column, '!=', '')
            ->distinct()
            ->orderBy($column)
            ->pluck($column)
            ->map(fn ($value) => ['id' => $value, 'name' => $value])
            ->values()
            ->all();

        return [
            'statuses' => [
                ['id' => 1, 'name' => 'Active'],
                ['id' => 0, 'name' => 'Inactive'],
                ['id' => 2, 'name' => 'Suspended'],
            ],
            'sex' => $ids('sex')->sort()->values()->map(fn ($value) => ['id' => $value, 'name' => $value])->all(),
            'departments' => $ids('department')->sort()->values()->map(fn ($value) => ['id' => $value, 'name' => $value])->all(),
            'levels' => $ids('level')->sort()->values()->map(fn ($value) => ['id' => (int) $value, 'name' => (string) $value])->all(),
            'staff_statuses' => Status::query()->orderBy('name')->get(['id', 'name']),
            'directorates' => Directorate::query()->orderBy('name')->get(['id', 'name']),
            'work_distributions' => WorkDistribution::query()->orderBy('name')->get(['id', 'name']),
            'training_institutes' => TrainingInstitute::query()->orderBy('name')->get(['id', 'name']),
            'rankings' => Ranking::query()->whereIn('id', $ids('present_rank'))->orderBy('title')->get(['id', 'title as name']),
            'zones' => Zone::query()->orderBy('zone')->get(['id', 'zone as name']),
            'states' => State::query()->whereIn('id', $ids('assigned_state'))->orderBy('state')->get(['id', 'state as name', 'zone_id']),
            'prisons' => Prison::query()->whereIn('id', $ids('prison'))->orderBy('prison_name')->get(['id', 'prison_name as name', 'state_id']),
            'blood_groups' => $detailValues('blood_group'),
            'genotypes' => $detailValues('genotype'),
            'marital_statuses' => $detailValues('marital_status'),
            'missing_fields' => collect(self::MISSING_FIELD_OPTIONS)->map(fn ($name, $id) => ['id' => $id, 'name' => $name])->values()->all(),
            'columns' => collect($columns->all())->map(fn ($definition, $key) => ['key' => $key, ...$definition])->values()->all(),
            'formats' => [
                ['id' => 'pdf', 'name' => 'PDF'],
                ['id' => 'word', 'name' => 'Word'],
                ['id' => 'image', 'name' => 'Image'],
                ['id' => 'document', 'name' => 'Document'],
            ],
        ];
    }

    public function exportRows(StaffReportCriteria $criteria, array $scope): \Generator
    {
        $query = $this->withReportFields($this->filteredQuery($criteria, $scope));
        $this->applySort($query, $criteria);

        foreach ($query->lazy(500) as $staff) {
            yield $staff;
        }
    }

    /** @return array<string, mixed> */
    private function summary(Builder $query): array
    {
        $total = (clone $query)->count();

        return [
            'total_staff' => $total,
            'active_staff' => (clone $query)->where('staff.status', 1)->count(),
            'inactive_staff' => (clone $query)->where('staff.status', '!=', 1)->count(),
            'verified_staff' => (clone $query)->where('staff.is_verified', true)->count(),
            'with_roles' => (clone $query)->whereHas('roles')->count(),
            'never_logged_in' => (clone $query)->whereNull('staff.last_login')->count(),
            'by_status' => $this->grouped($query, 'status', fn ($value) => match ((int) $value) {
                1 => 'Active', 2 => 'Suspended', default => 'Inactive'
            }),
            'by_gender' => $this->grouped($query, 'sex'),
            'by_department' => $this->grouped($query, 'department'),
            'by_level' => $this->grouped($query, 'level'),
            'by_staff_status' => $this->groupedLookup($query, 'staff_status_id', Status::class, 'name'),
            'by_rank' => $this->groupedLookup($query, 'present_rank', Ranking::class, 'title'),
            'by_directorate' => $this->groupedLookup($query, 'directorate_id', Directorate::class, 'name'),
            'by_state' => $this->groupedLookup($query, 'assigned_state', State::class, 'state'),
            'data_completeness' => [
                'missing_email' => (clone $query)->where(fn (Builder $q) => $q->whereNull('staff.email')->orWhere('staff.email', ''))->count(),
                'missing_photo' => (clone $query)->where(fn (Builder $q) => $q->whereNull('staff.photo')->orWhere('staff.photo', ''))->count(),
                'missing_date_of_birth' => (clone $query)->whereNull('staff.dob')->count(),
                'missing_rank' => (clone $query)->whereNull('staff.present_rank')->count(),
                'missing_location' => (clone $query)->whereNull('staff.assigned_state')->count(),
            ],
        ];
    }

    /** @return array<string, mixed> */
    private function details(Builder $query, StaffReportCriteria $criteria): array
    {
        $query = $this->withReportFields($query);
        $this->applySort($query, $criteria);
        $paginator = $query->paginate($criteria->pageSize(), ['*'], 'page', $criteria->pageNumber());

        return [
            'rows' => $paginator->getCollection()->map(fn (Staff $staff) => $this->row($staff))->all(),
            'pagination' => $this->pagination($paginator),
        ];
    }

    private function withReportFields(Builder $query): Builder
    {
        return $query->select([
            'staff.id', 'staff.service_no', 'staff.surname', 'staff.first_name', 'staff.other_names',
            'staff.email', 'staff.phone_number', 'staff.sex', 'staff.photo', 'staff.status', 'staff.is_verified',
            'staff.staff_status_id', 'staff.present_rank', 'staff.initial_rank', 'staff.level', 'staff.step',
            'staff.department', 'staff.directorate_id', 'staff.work_distribution_id', 'staff.training_institute_id',
            'staff.zone_id', 'staff.assigned_state', 'staff.prison', 'staff.station', 'staff.state_of_origin',
            'staff.lga', 'staff.dob', 'staff.date_of_first_appointment', 'staff.present_appointment_date',
            'staff.duty', 'staff.last_login', 'staff.created_at', 'staff.updated_at',
        ])->with(self::RELATIONSHIPS);
    }

    private function applySort(Builder $query, StaffReportCriteria $criteria): void
    {
        $direction = $criteria->sortDirection();
        match ($criteria->sortField()) {
            'full_name' => $query->orderBy('staff.surname', $direction)->orderBy('staff.first_name', $direction),
            'date_of_first_appointment' => $query->orderBy('staff.date_of_first_appointment', $direction),
            default => $query->orderBy('staff.'.$criteria->sortField(), $direction),
        };
        $query->orderBy('staff.id', 'asc');
    }

    /** @return array<string, mixed> */
    private function row(Staff $staff): array
    {
        return [
            'id' => $staff->service_no,
            'identity' => [
                'service_no' => $staff->service_no,
                'full_name' => trim(implode(' ', array_filter([$staff->surname, $staff->first_name, $staff->other_names]))),
                'surname' => $staff->surname,
                'first_name' => $staff->first_name,
                'other_names' => $staff->other_names,
                'sex' => $staff->sex,
                'work_email' => $staff->email,
                'phone_number' => $staff->phone_number,
                'photo' => $staff->photo,
            ],
            'employment' => [
                'account_status' => match ((int) $staff->status) {
                    1 => 'active', 2 => 'suspended', default => 'inactive'
                },
                'staff_status' => $staff->staffStatus?->name,
                'first_appointment_date' => $staff->date_of_first_appointment,
                'present_rank' => $staff->presentRank?->title,
                'level' => $staff->level,
                'verified' => (bool) $staff->is_verified,
            ],
            'organization' => [
                'department' => $staff->department,
                'directorate' => $staff->directorate?->name,
                'work_distribution' => $staff->workDistribution?->name,
                'training_institute' => $staff->trainingInstitute?->name,
            ],
            'location' => [
                'state' => $staff->assignedState?->state,
                'prison' => $staff->prisonRelation?->prison_name,
                'station' => $staff->station,
            ],
            'account' => [
                'last_login' => $staff->last_login?->toIso8601String(),
                'roles' => $staff->roles->pluck('name')->values()->all(),
            ],
            'metadata' => [
                'created_at' => $staff->created_at?->toIso8601String(),
                'updated_at' => $staff->updated_at?->toIso8601String(),
            ],
        ];
    }

    private function applyListFilter(Builder $query, array $filters, string $key, string $column): void
    {
        if (($filters[$key] ?? []) !== []) {
            $query->whereIn($column, $filters[$key]);
        }
    }

    private function applyDetailListFilter(Builder $query, array $filters, string $key, string $column): void
    {
        if (($filters[$key] ?? []) !== []) {
            $query->whereHas('details', fn (Builder $details) => $details->whereIn($column, $filters[$key]));
        }
    }

    private function applyMissingField(Builder $query, string $field): void
    {
        $staffColumns = [
            'email' => 'staff.email',
            'phone_number' => 'staff.phone_number',
            'photo' => 'staff.photo',
            'date_of_birth' => 'staff.dob',
            'rank' => 'staff.present_rank',
            'department' => 'staff.department',
            'directorate' => 'staff.directorate_id',
            'work_distribution' => 'staff.work_distribution_id',
            'training_institute' => 'staff.training_institute_id',
            'zone' => 'staff.zone_id',
            'custodial_centre' => 'staff.prison',
            'staff_status' => 'staff.staff_status_id',
            'last_login' => 'staff.last_login',
        ];
        $detailColumns = [
            'blood_group' => 'blood_group',
            'genotype' => 'genotype',
            'nin' => 'nin',
            'bvn' => 'bvn',
            'pension_pin' => 'pension_pin',
            'bank_account' => 'account_number',
        ];

        if (isset($staffColumns[$field])) {
            $this->applyPresenceFilter($query, $staffColumns[$field], false);

            return;
        }

        if (isset($detailColumns[$field])) {
            $column = $detailColumns[$field];
            $query->where(function (Builder $missing) use ($column): void {
                $missing->whereDoesntHave('details')
                    ->orWhereHas('details', fn (Builder $details) => $details->whereNull($column)->orWhere($column, ''));
            });

            return;
        }

        if ($field === 'education') {
            $query->whereDoesntHave('education');
        }
    }

    private function applyDateRange(Builder $query, ?array $range, string $column): void
    {
        if (isset($range['from'])) {
            $query->whereDate($column, '>=', $range['from']);
        }
        if (isset($range['to'])) {
            $query->whereDate($column, '<=', $range['to']);
        }
    }

    private function applyPresenceFilter(Builder $query, string $column, bool $present): void
    {
        $query->where(function (Builder $presence) use ($column, $present): void {
            if ($present) {
                $presence->whereNotNull($column)->where($column, '!=', '');
            } else {
                $presence->whereNull($column)->orWhere($column, '');
            }
        });
    }

    /** @return array<int, array{label: string, count: int}> */
    private function grouped(Builder $query, string $column, ?callable $labeler = null): array
    {
        return (clone $query)->reorder()->select($column)->selectRaw('COUNT(*) as aggregate')->groupBy($column)->get()
            ->map(fn ($row) => [
                'label' => $labeler ? $labeler($row->{$column}) : ($row->{$column} === null || $row->{$column} === '' ? 'Unknown' : (string) $row->{$column}),
                'count' => (int) $row->aggregate,
            ])->values()->all();
    }

    /** @return array<int, array{label: string, count: int}> */
    private function groupedLookup(Builder $query, string $column, string $model, string $labelColumn): array
    {
        $groups = $this->grouped($query, $column);
        $labels = $model::query()->whereIn('id', collect($groups)->pluck('label')->filter(fn ($id) => is_numeric($id)))->pluck($labelColumn, 'id');

        return collect($groups)->map(function (array $group) use ($labels): array {
            $group['label'] = $labels[$group['label']] ?? ($group['label'] === 'Unknown' ? 'Unknown' : 'Unmapped');

            return $group;
        })->all();
    }

    /** @return array<string, int|null> */
    private function pagination(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'last_page' => $paginator->lastPage(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }
}
