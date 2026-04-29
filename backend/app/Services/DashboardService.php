<?php

namespace App\Services;

use App\Models\ChangeRequest;
use App\Models\Prison;
use App\Models\Staff;
use App\Models\State;
use App\Models\User;
use App\Models\Zone;
use App\Models\WorkDistribution;
use App\Models\Directorate;
use App\Models\TrainingInstitute;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * @return array<string, int>
     */
    protected function getStaffDistribution(
        string $foreignKey,
        string $table,
        string $nameColumn,
    ): array {
        return Staff::query()
            ->leftJoin($table, "staff.{$foreignKey}", "=", "{$table}.id")
            ->selectRaw(
                "COALESCE({$table}.{$nameColumn}, 'Unassigned') as label, COUNT(staff.id) as count",
            )
            ->groupBy(DB::raw("COALESCE({$table}.{$nameColumn}, 'Unassigned')"))
            ->orderBy("label")
            ->pluck("count", "label")
            ->map(fn($count) => (int) $count)
            ->toArray();
    }

    public function getStats(): array
    {
        return [
            "staff" => [
                "total" => Staff::count(),
                "active" => Staff::where("status", 1)->count(),
            ],
            "users" => [
                "total" => User::count(),
            ],
            "change_requests" => [
                "total" => ChangeRequest::count(),
                "pending" => ChangeRequest::where("status", "PENDING")->count(),
                "approved" => ChangeRequest::where(
                    "status",
                    "APPROVED",
                )->count(),
                "rejected" => ChangeRequest::where(
                    "status",
                    "REJECTED",
                )->count(),
            ],
            "zones" => Zone::count(),
            "states" => State::query()
                ->whereRaw('LOWER(`state`) NOT LIKE ?', ['%national%'])
                ->whereRaw('LOWER(`state`) NOT LIKE ?', ['%hq%'])
                ->whereRaw('LOWER(`state`) NOT LIKE ?', ['%headquarters%'])
                ->count(),
            "prisons" => Prison::count(),
            "work_distributions" => WorkDistribution::count(),
            "directorates" => Directorate::count(),
            "training_schools" => TrainingInstitute::count(),
            "staff_distributions" => [
                "work_distributions" => $this->getStaffDistribution(
                    "work_distribution_id",
                    "work_distributions",
                    "name",
                ),
                "directorates" => $this->getStaffDistribution(
                    "directorate_id",
                    "directorates",
                    "name",
                ),
                "training_schools" => $this->getStaffDistribution(
                    "training_institute_id",
                    "training_institutes",
                    "name",
                ),
            ],
        ];
    }
}
