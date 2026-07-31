<?php

namespace App\Services;

class StaffReportCriteria
{
    /** @param array<string, mixed> $criteria */
    public function __construct(
        private readonly array $criteria,
        private readonly array $include,
        private readonly int $pageNumber,
        private readonly int $pageSize,
        private readonly string $sortField,
        private readonly string $sortDirection,
    ) {}

    /** @param array<string, mixed> $validated */
    public static function fromValidated(array $validated): self
    {
        $criteria = $validated['criteria'] ?? [];
        $listKeys = [
            'statuses', 'staff_status_ids', 'sex', 'directorate_ids',
            'work_distribution_ids', 'training_institute_ids', 'rank_ids',
            'levels', 'zone_ids', 'state_ids', 'prison_ids', 'departments',
        ];

        foreach ($listKeys as $key) {
            if (isset($criteria[$key])) {
                $criteria[$key] = array_values(array_unique($criteria[$key], SORT_REGULAR));
                sort($criteria[$key]);
            }
        }

        if (isset($criteria['search'])) {
            $criteria['search'] = trim($criteria['search']);
            if ($criteria['search'] === '') {
                unset($criteria['search']);
            }
        }

        $sort = $validated['sort'][0] ?? ['field' => 'service_no', 'direction' => 'asc'];

        return new self(
            criteria: $criteria,
            include: $validated['include'] ?? ['summary', 'details'],
            pageNumber: (int) ($validated['page']['number'] ?? 1),
            pageSize: (int) ($validated['page']['size'] ?? 25),
            sortField: $sort['field'],
            sortDirection: $sort['direction'],
        );
    }

    /** @return array<string, mixed> */
    public function filters(): array
    {
        return $this->criteria;
    }

    public function includes(string $section): bool
    {
        return in_array($section, $this->include, true);
    }

    public function pageNumber(): int
    {
        return $this->pageNumber;
    }

    public function pageSize(): int
    {
        return $this->pageSize;
    }

    public function sortField(): string
    {
        return $this->sortField;
    }

    public function sortDirection(): string
    {
        return $this->sortDirection;
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'criteria' => $this->criteria,
            'include' => $this->include,
            'page' => ['number' => $this->pageNumber, 'size' => $this->pageSize],
            'sort' => [['field' => $this->sortField, 'direction' => $this->sortDirection]],
        ];
    }
}
