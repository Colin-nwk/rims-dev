<?php

namespace App\Services;

use App\Models\Staff;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class RimsMigrationService
{
    protected $oldConnection = 'rims_old';

    protected $newConnection = 'mysql';

    protected $migratedCount = 0;

    protected $failedCount = 0;

    protected $skippedCount = 0;

    protected $errors = [];

    // Optimized chunk size for 50K records
    protected $chunkSize = 5000;

    public function migrateStaff($limit = null, $offset = 0)
    {
        // Disable query logging to save memory
        DB::connection($this->newConnection)->disableQueryLog();
        DB::connection($this->oldConnection)->disableQueryLog();

        // Disable FK checks for faster inserts
        DB::connection($this->newConnection)->statement('SET FOREIGN_KEY_CHECKS=0');

        try {
            $query = DB::connection($this->oldConnection)
                ->table('staff')
                ->where('deleted', 0)
                ->offset($offset);

            if ($limit) {
                $query->limit($limit);
            }

            $staffBatch = [];
            $detailsBatch = [];
            $serviceNos = [];

            // Pre-calculate timestamp once per migration run
            $batchTimestamp = now()->toDateTimeString();

            $cursor = $query->cursor();

            foreach ($cursor as $oldStaffRecord) {
                try {
                    $mappedData = $this->mapStaffData($oldStaffRecord, $batchTimestamp);

                    $staffBatch[] = $mappedData['staff'];
                    $detailsBatch[] = $mappedData['details'];
                    $serviceNos[] = $oldStaffRecord->serviceNo;

                    $this->migratedCount++;

                    if (count($staffBatch) >= $this->chunkSize) {
                        $this->processBatch($staffBatch, $detailsBatch, $serviceNos, $batchTimestamp);
                        $staffBatch = [];
                        $detailsBatch = [];
                        $serviceNos = [];
                        gc_collect_cycles();
                    }

                } catch (\Exception $e) {
                    $this->failedCount++;
                    $this->errors[] = [
                        'service_no' => $oldStaffRecord->serviceNo,
                        'error' => $e->getMessage(),
                    ];
                    Log::error("Failed to migrate staff: {$oldStaffRecord->serviceNo}", [
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            // Process remaining
            if (! empty($staffBatch)) {
                $this->processBatch($staffBatch, $detailsBatch, $serviceNos, $batchTimestamp);
            }

        } finally {
            // Re-enable FK checks
            DB::connection($this->newConnection)->statement('SET FOREIGN_KEY_CHECKS=1');
        }

        return [
            'migrated' => $this->migratedCount,
            'failed' => $this->failedCount,
            'skipped' => $this->skippedCount,
            'errors' => $this->errors,
        ];
    }

    protected function mapStaffData($oldStaffRecord, string $timestamp)
    {
        $staff = [
            'service_no' => $oldStaffRecord->serviceNo,
            'email' => $oldStaffRecord->email ?: '',
            'password' => $oldStaffRecord->pwrd ?: Hash::make('password'),
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

    protected function processBatch($staffBatch, $detailsBatch, $serviceNos, string $timestamp)
    {
        DB::connection($this->newConnection)->transaction(function () use ($staffBatch, $detailsBatch, $serviceNos, $timestamp) {
            // Use raw insert for maximum speed
            $this->bulkInsertIgnore('staff', $staffBatch);
            $this->bulkInsertIgnore('staff_details', $detailsBatch);

            // Migrate education for the batch
            $this->migrateEducationBatch($serviceNos, $timestamp);
        });
    }

    protected function bulkInsertIgnore(string $table, array $data)
    {
        if (empty($data)) {
            return;
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

        DB::connection($this->newConnection)->insert($sql, $values);
    }

    protected function migrateEducationBatch($serviceNos, string $timestamp)
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
            foreach (array_chunk($educationData, 5000) as $chunk) {
                $this->bulkInsertIgnore('staff_education', $chunk);
            }
        }
    }

    protected function parseDate($date)
    {
        if (empty($date) || $date === '0000-00-00' || $date === '0000-00-00 00:00:00') {
            return null;
        }

        try {
            return \Carbon\Carbon::parse($date)->toDateTimeString();
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function parseYear($year)
    {
        if (empty($year) || ! is_numeric($year)) {
            return null;
        }

        try {
            return \Carbon\Carbon::createFromFormat('Y', $year)->startOfYear()->toDateTimeString();
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function parseBooleanField($value)
    {
        if (empty($value)) {
            return false;
        }

        $value = strtolower(trim($value));

        return in_array($value, ['yes', '1', 'true', 'y']);
    }

    protected function parseInteger($value)
    {
        if ($value === '' || $value === null) {
            return null;
        }

        return (int) $value;
    }

    protected function parseFloat($value)
    {
        if ($value === '' || $value === null) {
            return null;
        }

        return (float) $value;
    }

    protected function mapZone($oldZone)
    {
        $zoneMapping = [];

        return $zoneMapping[$oldZone] ?? null;
    }

    protected function mapDegreeType($degreeType)
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

    public function getStatistics()
    {
        $oldTotal = DB::connection($this->oldConnection)
            ->table('staff')
            ->where('deleted', 0)
            ->count();

        $newTotal = Staff::count();

        // Optimized: use NOT EXISTS instead of loading all IDs into memory
        $pendingCount = DB::connection($this->oldConnection)
            ->table('staff as old')
            ->where('old.deleted', 0)
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from(DB::connection($this->newConnection)->getDatabaseName().'.staff as new')
                    ->whereColumn('new.service_no', 'old.serviceNo');
            })
            ->count();

        return [
            'old_database_total' => $oldTotal,
            'new_database_total' => $newTotal,
            'pending_migration' => $pendingCount,
        ];
    }

    public function resetCounters()
    {
        $this->migratedCount = 0;
        $this->failedCount = 0;
        $this->skippedCount = 0;
        $this->errors = [];
    }
}
