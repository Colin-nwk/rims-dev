<?php

namespace App\Services;

use App\Models\ChangeRequest;
use App\Models\Directorate;
use App\Models\Prison;
use App\Models\Ranking;
use App\Models\Staff;
use App\Models\StaffDocument;
use App\Models\StaffPosting;
use App\Models\State;
use App\Models\Status;
use App\Models\TrainingInstitute;
use App\Models\User;
use App\Models\WorkDistribution;
use App\Models\Zone;

class ChangeRequestDisplayValueService
{
    /**
     * Map flattened field suffix → [Model class FQCN, label column].
     *
     * @var array<string, array{0: class-string, 1: string}>
     */
    protected const SIMPLE_FK_MAP = [
        'assigned_state' => [State::class, 'state'],
        'initial_command' => [State::class, 'state'],
        'present_command' => [State::class, 'state'],
        'prison' => [Prison::class, 'prison_name'],
        'initial_rank' => [Ranking::class, 'title'],
        'present_rank' => [Ranking::class, 'title'],
        'zone_id' => [Zone::class, 'zone'],
        'work_distribution_id' => [WorkDistribution::class, 'name'],
        'training_institute_id' => [TrainingInstitute::class, 'name'],
        'directorate_id' => [Directorate::class, 'name'],
        'staff_status_id' => [Status::class, 'name'],
    ];

    /**
     * Resolved labels from simple FK lookups keyed "ModelClass\@column:id".
     *
     * @var array<string, string|null>
     */
    protected array $labelCache = [];

    /**
     * @return array{data_ui: array<string, string|null>, model_ui: array<string, string|null>}
     */
    public function mapsFor(ChangeRequest $changeRequest): array
    {
        $modelType = (string) $changeRequest->model_type;
        $data = is_array($changeRequest->data) ? $changeRequest->data : [];
        $modelPayload = $this->modelPayload($changeRequest);

        return [
            'data_ui' => $this->buildResolvedFlat($modelType, $data),
            'model_ui' => $this->buildResolvedFlat($modelType, $modelPayload),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, string|null>
     */
    public function buildResolvedFlat(string $modelType, array $payload): array
    {
        $flat = $this->flattenData($payload);
        $this->warmCachesForFlat($flat);
        $resolved = [];

        foreach ($flat as $dotKey => $value) {
            $suffix = $this->lastSegment($dotKey);
            $label = $this->resolveValue($suffix, $dotKey, $value, $flat, $modelType);
            if ($label !== null) {
                $resolved[$dotKey] = $label;
            }
        }

        return $resolved;
    }

    protected function modelPayload(ChangeRequest $changeRequest): array
    {
        $model = $changeRequest->model;

        if ($model instanceof \Illuminate\Database\Eloquent\Model) {
            return $model->toArray();
        }

        if (is_array($model)) {
            return $model;
        }

        return [];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function flattenData(array $data, string $prefix = ''): array
    {
        $result = [];

        foreach ($data as $key => $value) {
            $newKey = $prefix !== '' ? $prefix.'.'.$key : (string) $key;

            if (is_array($value)) {
                if ($value === []) {
                    $result[$newKey] = $value;
                } elseif ($this->isAssocArray($value)) {
                    $result = array_merge($result, $this->flattenData($value, $newKey));
                } else {
                    $result[$newKey] = $value;
                }
            } elseif ($value instanceof \DateTimeInterface) {
                $result[$newKey] = $value;
            } else {
                $result[$newKey] = $value;
            }
        }

        return $result;
    }

    /**
     * Bulk-load FK labels referenced in a flattened payload.
     *
     * @param  array<string, mixed>  $flat
     */
    protected function warmCachesForFlat(array $flat): void
    {
        /** @var array<string, array<int, true>> $idsGrouped */
        $idsGrouped = [];

        foreach ($flat as $dotKey => $value) {
            $suffix = $this->lastSegment($dotKey);
            if (! isset(self::SIMPLE_FK_MAP[$suffix])) {
                continue;
            }
            $id = $this->normalizeId($value);
            if ($id === null) {
                continue;
            }
            [$fqcn] = self::SIMPLE_FK_MAP[$suffix];
            $column = self::SIMPLE_FK_MAP[$suffix][1];
            $bucketKey = $fqcn.'@'.$column;
            $idsGrouped[$bucketKey][$id] = true;
        }

        foreach ($idsGrouped as $bucketKey => $idSet) {
            [$fqcn, $column] = explode('@', $bucketKey, 2);
            /** @var class-string $fqcnClass */
            $fqcnClass = $fqcn;
            $columnName = $column;

            $missingIds = array_values(array_filter(
                array_keys($idSet),
                fn (string|int $id) => ! isset($this->labelCache[$this->simpleFkCacheKey($fqcnClass, $columnName, (int) $id)])
            ));

            if ($missingIds === []) {
                continue;
            }

            /** @phpstan-ignore-next-line */
            $labels = $fqcnClass::query()
                ->whereKey($missingIds)
                ->pluck($columnName, 'id');

            foreach ($missingIds as $id) {
                $cacheKey = $this->simpleFkCacheKey($fqcnClass, $columnName, (int) $id);
                /** @var mixed $raw */
                $raw = $labels->get((int) $id);
                $this->labelCache[$cacheKey] = $raw !== null ? (string) $raw : null;
            }
        }
    }

    /**
     * @param  array<string, mixed>  $flat
     */
    protected function resolveValue(
        string $suffix,
        string $dotKey,
        mixed $value,
        array $flat,
        string $modelType,
    ): ?string {
        if ($suffix === 'verifier_id') {
            if ($modelType !== StaffDocument::class) {
                return null;
            }

            return $this->resolveMorphPairLabel($dotKey, $value, $flat, 'verifier_id', 'verifier_type');
        }

        if ($suffix === 'created_by_id') {
            if ($modelType !== StaffPosting::class) {
                return null;
            }

            return $this->resolveMorphPairLabel($dotKey, $value, $flat, 'created_by_id', 'created_by_type');
        }

        if (! isset(self::SIMPLE_FK_MAP[$suffix])) {
            return null;
        }

        $id = $this->normalizeId($value);

        if ($id === null) {
            return null;
        }

        [$fqcn, $column] = self::SIMPLE_FK_MAP[$suffix];
        $cacheKey = $this->simpleFkCacheKey($fqcn, $column, $id);

        if (! isset($this->labelCache[$cacheKey])) {
            /** @phpstan-ignore-next-line */
            $label = $fqcn::query()->whereKey($id)->value($column);
            $this->labelCache[$cacheKey] = $label !== null ? (string) $label : null;
        }

        $label = $this->labelCache[$cacheKey];

        if ($label === null) {
            return 'Unknown (#'.$id.')';
        }

        return $label;
    }

    /**
     * @param  array<string, mixed>  $flat
     */
    protected function resolveMorphPairLabel(
        string $dotKey,
        mixed $value,
        array $flat,
        string $idFieldName,
        string $typeFieldName,
    ): ?string {
        if ($dotKey !== $idFieldName && ! str_ends_with($dotKey, '.'.$idFieldName)) {
            return null;
        }

        $id = $this->normalizeId($value);

        if ($id === null) {
            return null;
        }

        $prefix = $dotKey === $idFieldName
            ? ''
            : substr($dotKey, 0, (int) strrpos($dotKey, '.'.$idFieldName));

        $typeKey = $prefix !== ''
            ? $prefix.'.'.$typeFieldName
            : $typeFieldName;

        $type = $flat[$typeKey] ?? null;

        if (! is_string($type) || $type === '') {
            return 'Unknown (#'.$id.')';
        }

        if ($type === User::class) {
            $name = User::query()->whereKey($id)->value('name');

            return $name !== null ? (string) $name : 'Unknown (#'.$id.')';
        }

        if ($type === Staff::class) {
            $staff = Staff::query()->whereKey($id)->first();

            if (! $staff) {
                return 'Unknown (#'.$id.')';
            }

            $composed = trim(implode(' ', array_filter([
                $staff->first_name,
                $staff->surname,
            ]))).($staff->service_no !== null && $staff->service_no !== '' ? ' ('.$staff->service_no.')' : '');

            return $composed !== '' ? $composed : 'Unknown (#'.$id.')';
        }

        return 'Unknown (#'.$id.')';
    }

    /**
     * @param  class-string  $fqcn
     */
    protected function simpleFkCacheKey(string $fqcn, string $column, int $id): string
    {
        return $fqcn.'@'.$column.':'.$id;
    }

    protected function normalizeId(mixed $value): ?int
    {
        if (is_int($value)) {
            return $value;
        }

        if (is_string($value) && ctype_digit($value)) {
            return (int) $value;
        }

        return null;
    }

    protected function lastSegment(string $dotKey): string
    {
        $parts = explode('.', $dotKey);

        return end($parts) ?: $dotKey;
    }

    /**
     * @param  array<string, mixed>  $array
     */
    protected function isAssocArray(array $array): bool
    {
        return array_keys($array) !== range(0, count($array) - 1);
    }
}
