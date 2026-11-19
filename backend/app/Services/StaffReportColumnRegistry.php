<?php

namespace App\Services;

use App\Models\Staff;
use InvalidArgumentException;

class StaffReportColumnRegistry
{
    /** @return array<string, array{label: string, category: string, default: bool}> */
    public function all(): array
    {
        return [
            'service_no' => ['label' => 'Service Number', 'category' => 'Identity', 'default' => true],
            'full_name' => ['label' => 'Full Name', 'category' => 'Identity', 'default' => true],
            'sex' => ['label' => 'Sex', 'category' => 'Identity', 'default' => true],
            'email' => ['label' => 'Work Email', 'category' => 'Contact', 'default' => true],
            'phone_number' => ['label' => 'Phone Number', 'category' => 'Contact', 'default' => false],
            'status' => ['label' => 'Account Status', 'category' => 'Employment', 'default' => true],
            'staff_status' => ['label' => 'Staff Status', 'category' => 'Employment', 'default' => true],
            'present_rank' => ['label' => 'Present Rank', 'category' => 'Employment', 'default' => true],
            'level' => ['label' => 'Level', 'category' => 'Employment', 'default' => true],
            'department' => ['label' => 'Department', 'category' => 'Organization', 'default' => true],
            'directorate' => ['label' => 'Directorate', 'category' => 'Organization', 'default' => true],
            'work_distribution' => ['label' => 'Work Distribution', 'category' => 'Organization', 'default' => false],
            'prison' => ['label' => 'Custodial Centre', 'category' => 'Location', 'default' => true],
            'station' => ['label' => 'Station', 'category' => 'Location', 'default' => false],
            'appointment_date' => ['label' => 'First Appointment', 'category' => 'Employment', 'default' => true],
            'last_login' => ['label' => 'Last Login', 'category' => 'Account', 'default' => false],
        ];
    }

    /** @param array<int, string> $columns */
    public function validate(array $columns): array
    {
        $invalid = array_diff($columns, array_keys($this->all()));
        if ($invalid !== []) {
            throw new InvalidArgumentException('Unsupported report columns: '.implode(', ', $invalid));
        }

        return $columns;
    }

    public function value(Staff $staff, string $column): string|int|null
    {
        return match ($column) {
            'service_no' => $staff->service_no,
            'full_name' => trim(implode(' ', array_filter([$staff->surname, $staff->first_name, $staff->other_names]))),
            'sex' => $staff->sex,
            'email' => $staff->email,
            'phone_number' => $staff->phone_number,
            'status' => match ((int) $staff->status) {
                1 => 'Active', 2 => 'Suspended', default => 'Inactive'
            },
            'staff_status' => $staff->staffStatus?->name,
            'present_rank' => $staff->presentRank?->title,
            'level' => $staff->level,
            'department' => $staff->department,
            'directorate' => $staff->directorate?->name,
            'work_distribution' => $staff->workDistribution?->name,
            'prison' => $staff->prisonRelation?->prison_name,
            'station' => $staff->station,
            'appointment_date' => $staff->date_of_first_appointment,
            'last_login' => $staff->last_login?->toIso8601String(),
            default => null,
        };
    }
}
