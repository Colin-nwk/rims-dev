<?php

namespace App\Services;

use App\Models\Staff;
use Closure;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class RimsMigrationService
{
    protected $oldConnection = 'rims_old';

    protected $newConnection = 'mysql';

    protected $migratedCount = 0;

    protected $failedCount = 0;

    protected $skippedCount = 0;

    protected $errors = [];

    protected const MAX_BATCH_SIZE = 1000;

    /**
     * @param  Closure(int): void|null  $onProgress
     * @return array{migrated: int, failed: int, skipped: int, errors: array<int, array{service_no: string, error: string}>}
     */
    public function migrateStaff(
        ?int $limit = null,
        int $offset = 0,
        int $batchSize = 1000,
        bool $dryRun = false,
        ?Closure $onProgress = null,
        bool $includeDeleted = true,
    ): array {
        $this->resetCounters();
        $batchSize = max(1, min($batchSize, self::MAX_BATCH_SIZE));

        DB::connection($this->newConnection)->disableQueryLog();
        DB::connection($this->oldConnection)->disableQueryLog();

        $fallbackPasswordHash = Hash::make('password');
        $hasQualificationsTable = Schema::connection($this->oldConnection)->hasTable('qualifications');
        $existingServiceNumbers = DB::connection($this->newConnection)
            ->table('staff')
            ->pluck('service_no')
            ->flip()
            ->all();
        $claimedEmails = DB::connection($this->newConnection)
            ->table('staff')
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->pluck('email')
            ->mapWithKeys(fn ($email): array => [$this->normalizeEmailKey($email) => true])
            ->all();

        $baseQuery = DB::connection($this->oldConnection)->table('staff');
        if (! $includeDeleted) {
            $baseQuery->where('deleted', 0);
        }
        $startingServiceNumber = (clone $baseQuery)
            ->orderBy('serviceNo')
            ->offset($offset)
            ->value('serviceNo');

        if ($startingServiceNumber === null) {
            return $this->result();
        }

        $remaining = $limit;
        $lastServiceNumber = null;

        while ($remaining === null || $remaining > 0) {
            $pageSize = min($batchSize, $remaining ?? $batchSize);
            $pageQuery = (clone $baseQuery)->orderBy('serviceNo')->limit($pageSize);

            if ($lastServiceNumber === null) {
                $pageQuery->where('serviceNo', '>=', $startingServiceNumber);
            } else {
                $pageQuery->where('serviceNo', '>', $lastServiceNumber);
            }

            $records = $pageQuery->get();
            if ($records->isEmpty()) {
                break;
            }

            $staffBatch = [];
            $detailsBatch = [];
            $serviceNos = [];
            $batchTimestamp = now()->toDateTimeString();

            foreach ($records as $oldStaffRecord) {
                $serviceNumber = (string) $oldStaffRecord->serviceNo;

                if (isset($existingServiceNumbers[$serviceNumber])) {
                    $this->skippedCount++;

                    continue;
                }

                try {
                    $mappedData = $this->mapStaffData($oldStaffRecord, $batchTimestamp, $fallbackPasswordHash);
                    $mappedData['staff']['email'] = $this->claimUniqueEmail($oldStaffRecord->email, $claimedEmails);
                    $staffBatch[] = $mappedData['staff'];
                    $detailsBatch[] = $mappedData['details'];
                    $serviceNos[] = $serviceNumber;
                } catch (\Exception $exception) {
                    $this->failedCount++;
                    $this->errors[] = [
                        'service_no' => $serviceNumber,
                        'error' => $exception->getMessage(),
                    ];
                    Log::error("Failed to migrate staff: {$serviceNumber}", [
                        'error' => $exception->getMessage(),
                    ]);
                }
            }

            if ($staffBatch !== []) {
                $migrated = $dryRun
                    ? count($staffBatch)
                    : $this->processBatch($staffBatch, $detailsBatch, $serviceNos, $batchTimestamp, $hasQualificationsTable);

                $this->migratedCount += $migrated;
                foreach ($serviceNos as $serviceNumber) {
                    $existingServiceNumbers[$serviceNumber] = true;
                }
            }

            $processed = $records->count();
            $lastServiceNumber = (string) $records->last()->serviceNo;
            $remaining = $remaining === null ? null : $remaining - $processed;
            $onProgress?->__invoke($processed);
        }

        return $this->result();
    }

    protected function mapStaffData(object $oldStaffRecord, string $timestamp, string $fallbackPasswordHash): array
    {
        $staff = [
            'service_no' => $oldStaffRecord->serviceNo,
            'email' => filled(trim((string) $oldStaffRecord->email)) ? trim((string) $oldStaffRecord->email) : null,
            'password' => $oldStaffRecord->pwrd ?: $fallbackPasswordHash,
            'phone_number' => $oldStaffRecord->phone,
            'assigned_state' => $this->parseInteger($oldStaffRecord->assigned_state),
            'prison' => $this->parseInteger($oldStaffRecord->prison),
            'surname' => $oldStaffRecord->sname,
            'first_name' => $oldStaffRecord->fname,
            'other_names' => $oldStaffRecord->othernames,
            'sex' => $oldStaffRecord->sex,
            'initial_rank' => $oldStaffRecord->iniRank,
            'present_rank' => $oldStaffRecord->presentRank,
            'level' => $this->parseInteger($oldStaffRecord->level),
            'step' => $this->parseInteger($oldStaffRecord->Step),
            'dob' => $this->parseDate($oldStaffRecord->dob),
            'date_of_first_appointment' => $this->parseDate($oldStaffRecord->first_appt_date),
            'present_appointment_date' => $this->parseDate($oldStaffRecord->present_appt_date),
            'command_post_date' => $this->parseDate($oldStaffRecord->presentCommand_post_date),
            'initial_command' => $oldStaffRecord->initialCommand,
            'present_command' => $oldStaffRecord->presentCommand,
            'state_of_origin' => $oldStaffRecord->stateOfOrigin,
            'lga' => $oldStaffRecord->lga,
            'department' => $oldStaffRecord->dept,
            'file_no' => $oldStaffRecord->fileNo,
            'duty' => $oldStaffRecord->duty,
            'description' => $oldStaffRecord->description,
            'photo' => $oldStaffRecord->photo,
            'last_login' => $this->parseDate($oldStaffRecord->last_login),
            'is_verified' => (bool) $oldStaffRecord->verified,
            'status' => $this->parseInteger($oldStaffRecord->status),
            'zone_id' => $this->mapZone($oldStaffRecord->presentZone),
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ];

        $details = [
            'service_no' => $oldStaffRecord->serviceNo,
            'pfa_name' => $oldStaffRecord->pfa,
            'pension_pin' => $oldStaffRecord->pencom,
            'ippis' => $oldStaffRecord->ippis,
            'nin' => $oldStaffRecord->nin,
            'bvn' => $oldStaffRecord->bvn,
            'place_of_birth' => $oldStaffRecord->place_of_birth,
            'contact_address' => $oldStaffRecord->contact_address,
            'permanent_home_address' => $oldStaffRecord->permanent_home_address,
            'height' => $this->parseFloat($oldStaffRecord->height),
            'blood_group' => $oldStaffRecord->blood_group,
            'genotype' => $oldStaffRecord->blood_genotype,
            'complexion' => $oldStaffRecord->complexion,
            'hair_colour' => $oldStaffRecord->hair_colour,
            'is_deformed' => $this->parseBooleanField($oldStaffRecord->deformed),
            'deformity' => $oldStaffRecord->deformity,
            'is_convicted' => $this->parseBooleanField($oldStaffRecord->convicted),
            'previous_convictions' => $oldStaffRecord->previous_conviction,
            'next_of_kin_name' => $oldStaffRecord->next_of_kin1,
            'next_of_kin_phone' => null,
            'next_of_kin_relationship' => $oldStaffRecord->next_of_kin1_relationship,
            'next_of_kin_address' => $oldStaffRecord->next_of_kin1_address,
            'next_of_kin2_name' => $oldStaffRecord->next_of_kin2,
            'next_of_kin2_phone' => null,
            'next_of_kin2_relationship' => $oldStaffRecord->next_of_kin2_relationship,
            'next_of_kin2_address' => $oldStaffRecord->next_of_kin2_address,
            'marital_status' => $oldStaffRecord->marital_status,
            'spouse_name' => null,
            'spouse_phone' => null,
            'number_of_children' => $this->parseInteger($oldStaffRecord->no_of_children),
            'bank_name' => $oldStaffRecord->bank,
            'account_number' => $oldStaffRecord->account_no,
            'account_name' => null,
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ];

        return ['staff' => $staff, 'details' => $details];
    }

    protected function processBatch(array $staffBatch, array $detailsBatch, array $serviceNos, string $timestamp, bool $hasQualificationsTable): int
    {
        return DB::connection($this->newConnection)->transaction(function () use ($staffBatch, $detailsBatch, $serviceNos, $timestamp, $hasQualificationsTable): int {
            $insertedStaff = $this->bulkInsertIgnore('staff', $staffBatch);
            if ($insertedStaff !== count($staffBatch)) {
                throw new \RuntimeException(sprintf(
                    'Staff batch insert affected %d of %d rows. The batch was rolled back to prevent a false success.',
                    $insertedStaff,
                    count($staffBatch),
                ));
            }

            $insertedDetails = $this->bulkInsertIgnore('staff_details', $detailsBatch);
            if ($insertedDetails !== count($detailsBatch)) {
                throw new \RuntimeException(sprintf(
                    'Staff details batch insert affected %d of %d rows. The batch was rolled back to keep staff data consistent.',
                    $insertedDetails,
                    count($detailsBatch),
                ));
            }

            if ($hasQualificationsTable) {
                $this->migrateEducationBatch($serviceNos, $timestamp);
            }

            return $insertedStaff;
        });
    }

    protected function bulkInsertIgnore(string $table, array $data): int
    {
        if (empty($data)) {
            return 0;
        }

        $columns = array_keys($data[0]);
        $placeholders = '('.implode(',', array_fill(0, count($columns), '?')).')';
        $allPlaceholders = implode(',', array_fill(0, count($data), $placeholders));

        $values = [];
        foreach ($data as $row) {
            foreach ($columns as $col) {
                $values[] = $row[$col];
            }
        }

        $sql = "INSERT IGNORE INTO {$table} (".implode(',', $columns).") VALUES {$allPlaceholders}";

        return DB::connection($this->newConnection)->affectingStatement($sql, $values);
    }

    /** @param array<string, bool> $claimedEmails */
    protected function claimUniqueEmail(mixed $email, array &$claimedEmails): ?string
    {
        $email = trim((string) $email);
        if ($email === '') {
            return null;
        }

        $key = $this->normalizeEmailKey($email);
        if (isset($claimedEmails[$key])) {
            return null;
        }

        $claimedEmails[$key] = true;

        return $email;
    }

    protected function normalizeEmailKey(mixed $email): string
    {
        return strtolower(trim((string) $email));
    }

    protected function migrateEducationBatch(array $serviceNos, string $timestamp): void
    {
        $qualifications = DB::connection($this->oldConnection)
            ->table('qualifications')
            ->whereIn('serviceNo', $serviceNos)
            ->get();

        if ($qualifications->isEmpty()) {
            return;
        }

        $educationData = [];

        foreach ($qualifications as $qualification) {
            $educationData[] = [
                'service_no' => $qualification->serviceNo,
                'institution' => $qualification->school,
                'course' => $qualification->course,
                'type' => $this->mapDegreeType($qualification->degree_type),
                'start_date' => $this->parseYear($qualification->start_year),
                'end_date' => $this->parseYear($qualification->end_year),
                'url' => $qualification->attachment,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }

        if (! empty($educationData)) {
            foreach (array_chunk($educationData, self::MAX_BATCH_SIZE) as $chunk) {
                $this->bulkInsertIgnore('staff_education', $chunk);
            }
        }
    }

    /**
     * @return array{source: int, migrated: int, skipped: int}
     */
    public function migrateStaffEducationFromSqlDump(string $sqlPath, bool $dryRun = false): array
    {
        $source = $this->readStaffEducationInsert($sqlPath);
        $sourceIds = $source['ids'];
        $sourceServiceNumbers = array_values(array_unique($source['service_numbers']));
        $matchedServiceNumbers = DB::connection($this->newConnection)
            ->table('staff')
            ->whereIn('service_no', $sourceServiceNumbers)
            ->pluck('service_no')
            ->map(fn ($serviceNumber): string => (string) $serviceNumber)
            ->all();
        $missingServiceNumbers = array_values(array_diff($sourceServiceNumbers, $matchedServiceNumbers));

        if ($missingServiceNumbers !== []) {
            throw new \RuntimeException(sprintf(
                'Education import references %d staff records that have not been migrated. Examples: %s',
                count($missingServiceNumbers),
                implode(', ', array_slice($missingServiceNumbers, 0, 10)),
            ));
        }

        $existingCount = DB::connection($this->newConnection)
            ->table('staff_education')
            ->whereIn('id', $sourceIds)
            ->count();
        $pendingCount = count($sourceIds) - $existingCount;

        if ($dryRun || $pendingCount === 0) {
            return [
                'source' => count($sourceIds),
                'migrated' => $pendingCount,
                'skipped' => $existingCount,
            ];
        }

        $insertSql = preg_replace('/^INSERT\s+INTO/i', 'INSERT IGNORE INTO', $source['sql'], 1);

        $insertedCount = DB::connection($this->newConnection)->transaction(function () use ($insertSql, $sourceIds): int {
            $inserted = DB::connection($this->newConnection)->affectingStatement($insertSql);
            $presentCount = DB::connection($this->newConnection)
                ->table('staff_education')
                ->whereIn('id', $sourceIds)
                ->count();

            if ($presentCount !== count($sourceIds)) {
                throw new \RuntimeException(sprintf(
                    'Education import affected %d rows, but only %d of %d source IDs are present. The import was rolled back.',
                    $inserted,
                    $presentCount,
                    count($sourceIds),
                ));
            }

            return $inserted;
        });

        return [
            'source' => count($sourceIds),
            'migrated' => $insertedCount,
            'skipped' => count($sourceIds) - $insertedCount,
        ];
    }

    /** @return array{sql: string, ids: array<int, int>, service_numbers: array<int, string>} */
    protected function readStaffEducationInsert(string $sqlPath): array
    {
        if (! is_file($sqlPath) || ! is_readable($sqlPath)) {
            throw new \RuntimeException("Education SQL dump is not readable: {$sqlPath}");
        }

        $statementLines = [];
        $capturing = false;
        $complete = false;
        $file = new \SplFileObject($sqlPath, 'r');

        foreach ($file as $line) {
            if (! $capturing && preg_match('/^\s*INSERT\s+INTO\s+`?staff_education`?/i', $line) === 1) {
                $capturing = true;
            }

            if (! $capturing) {
                continue;
            }

            $statementLines[] = $line;
            if (preg_match('/;\s*$/', $line) === 1) {
                $complete = true;

                break;
            }
        }

        if (! $capturing) {
            throw new \RuntimeException('The SQL dump does not contain a staff_education INSERT statement.');
        }

        if (! $complete) {
            throw new \RuntimeException('The staff_education INSERT statement is incomplete.');
        }

        $ids = [];
        $serviceNumbers = [];
        foreach ($statementLines as $line) {
            if (preg_match("/^\s*\((\d+),\s*'((?:\\\\.|[^'])*)'/", $line, $matches) !== 1) {
                continue;
            }

            $ids[] = (int) $matches[1];
            $serviceNumbers[] = str_replace("\\'", "'", $matches[2]);
        }

        if ($ids === []) {
            throw new \RuntimeException('The staff_education INSERT statement contains no data rows.');
        }

        if (count(array_unique($ids)) !== count($ids)) {
            throw new \RuntimeException('The staff_education INSERT statement contains duplicate IDs.');
        }

        return [
            'sql' => trim(implode('', $statementLines)),
            'ids' => $ids,
            'service_numbers' => $serviceNumbers,
        ];
    }

    protected function parseDate($date): ?string
    {
        if (empty($date) || $date === '0000-00-00' || $date === '0000-00-00 00:00:00') {
            return null;
        }

        $date = trim((string) $date);
        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})(?: \d{2}:\d{2}:\d{2})?$/', $date, $matches) === 1) {
            if (! checkdate((int) $matches[2], (int) $matches[3], (int) $matches[1])) {
                return null;
            }

            return strlen($date) === 10 ? "{$date} 00:00:00" : $date;
        }

        try {
            return \Carbon\Carbon::parse($date)->toDateTimeString();
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function parseYear($year): ?string
    {
        if (preg_match('/^\d{4}$/', trim((string) $year)) !== 1) {
            return null;
        }

        $year = (int) $year;
        if ($year < 1900 || $year > 2100) {
            return null;
        }

        return "{$year}-01-01 00:00:00";
    }

    protected function parseBooleanField($value): bool
    {
        if (empty($value)) {
            return false;
        }

        $value = strtolower(trim($value));

        return in_array($value, ['yes', '1', 'true', 'y']);
    }

    protected function parseInteger($value): ?int
    {
        if ($value === '' || $value === null) {
            return null;
        }

        return (int) $value;
    }

    protected function parseFloat($value): ?float
    {
        if ($value === '' || $value === null) {
            return null;
        }

        return (float) $value;
    }

    protected function mapZone($oldZone): ?int
    {
        $zoneMapping = [];

        return $zoneMapping[$oldZone] ?? null;
    }

    protected function mapDegreeType($degreeType): ?string
    {
        $typeMapping = [
            'bachelor' => 'Bachelor',
            'masters' => 'Masters',
            'phd' => 'PhD',
            'diploma' => 'Diploma',
            'certificate' => 'Certificate',
            'hnd' => 'HND',
            'ond' => 'OND',
            'nce' => 'NCE',
            'ssce' => 'SSCE',
            'fslc' => 'FSLC',
        ];

        $normalizedType = strtolower(trim($degreeType ?? ''));

        return $typeMapping[$normalizedType] ?? $degreeType;
    }

    /** @return array{old_database_total: int, new_database_total: int, pending_migration: int} */
    public function getStatistics(bool $includeDeleted = true): array
    {
        $oldQuery = DB::connection($this->oldConnection)->table('staff');
        if (! $includeDeleted) {
            $oldQuery->where('deleted', 0);
        }

        $oldTotal = (clone $oldQuery)->count();

        $newTotal = Staff::count();

        // Optimized: use NOT EXISTS instead of loading all IDs into memory
        $pendingQuery = DB::connection($this->oldConnection)
            ->table('staff as old')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from(DB::connection($this->newConnection)->getDatabaseName().'.staff as new')
                    ->whereColumn('new.service_no', 'old.serviceNo');
            });

        if (! $includeDeleted) {
            $pendingQuery->where('old.deleted', 0);
        }

        $pendingCount = $pendingQuery->count();

        return [
            'old_database_total' => $oldTotal,
            'new_database_total' => $newTotal,
            'pending_migration' => $pendingCount,
        ];
    }

    public function resetCounters(): void
    {
        $this->migratedCount = 0;
        $this->failedCount = 0;
        $this->skippedCount = 0;
        $this->errors = [];
    }

    /** @return array{migrated: int, failed: int, skipped: int, errors: array<int, array{service_no: string, error: string}>} */
    protected function result(): array
    {
        return [
            'migrated' => $this->migratedCount,
            'failed' => $this->failedCount,
            'skipped' => $this->skippedCount,
            'errors' => $this->errors,
        ];
    }
}
