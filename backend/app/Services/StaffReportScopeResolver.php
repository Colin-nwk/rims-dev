<?php

namespace App\Services;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Builder;

class StaffReportScopeResolver
{
    /** @return array{global: bool, prison_ids: array<int>, state_ids: array<int>, zone_ids: array<int>, label: string} */
    public function resolve(Authenticatable $actor): array
    {
        $roles = $actor->roles()
            ->whereHas('permissions', fn (Builder $query) => $query->where('name', 'report.view'))
            ->get();

        $global = $roles->contains('scopeless', true);
        $prisonIds = $roles->pluck('prison_id')->filter()->map(fn ($id) => (int) $id)->unique()->values()->all();
        $stateIds = $roles->pluck('state_id')->filter()->map(fn ($id) => (int) $id)->unique()->values()->all();
        $zoneIds = $roles->pluck('zone_id')->filter()->map(fn ($id) => (int) $id)->unique()->values()->all();

        return [
            'global' => $global,
            'prison_ids' => $prisonIds,
            'state_ids' => $stateIds,
            'zone_ids' => $zoneIds,
            'label' => $global ? 'All staff' : 'Restricted organizational scope',
        ];
    }

    /** @param array{global: bool, prison_ids: array<int>, state_ids: array<int>, zone_ids: array<int>} $scope */
    public function apply(Builder $query, array $scope): Builder
    {
        if ($scope['global']) {
            return $query;
        }

        return $query->where(function (Builder $scoped) use ($scope): void {
            $hasScope = false;

            if ($scope['prison_ids'] !== []) {
                $scoped->whereIn('staff.prison', $scope['prison_ids']);
                $hasScope = true;
            }
            if ($scope['state_ids'] !== []) {
                $method = $hasScope ? 'orWhereIn' : 'whereIn';
                $scoped->{$method}('staff.assigned_state', $scope['state_ids']);
                $hasScope = true;
            }
            if ($scope['zone_ids'] !== []) {
                $method = $hasScope ? 'orWhereIn' : 'whereIn';
                $scoped->{$method}('staff.zone_id', $scope['zone_ids']);
                $hasScope = true;
            }

            if (! $hasScope) {
                $scoped->whereRaw('1 = 0');
            }
        });
    }
}
