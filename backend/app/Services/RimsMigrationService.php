<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\StaffDetail;
use App\Models\StaffEducation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class RimsMigrationService
{
    protected $oldConnection = 'rims_old';
    protected $newConnection = 'mysql';
    
    protected $migratedCount = 0;
    protected $failedCount = 0;
    protected $skippedCount = 0;
    protected $errors = [];

    public function migrateStaff($limit = null, $offset = 0)
    {
        $query = DB::connection($this->oldConnection)
            ->table('staff')
            ->where('deleted', 0)
            ->offset($offset);
        
        if ($limit) {
            $query->limit($limit);
        }
        
        // Chunk size for bulk inserts
        $chunkSize = 1000;
        $staffBatch = [];
        $detailsBatch = [];
        $serviceNos = [];

        // Use cursor for memory efficiency with large datasets
        $cursor = $query->cursor();
        
        foreach ($cursor as $oldStaffRecord) {
            try {
                // Check if staff already exists (skippable if we trust our offset logic, but safer to check)
                // To optimize, we could fetch existing service_nos in batch too, but for migration simple single check is slow.
                // Better: optimize the "exists" check by caching or simple ignore on duplicate key error?
                // Let's stick to simple "exists" check for now, or assume offset handles it.
                // Assuming offset handles it for speed. Or we can check existence later.
                // Actually, checking every record is N+1. 
                // Let's assume user handled clearing or offset correctly.
                
                $mappedData = $this->mapStaffData($oldStaffRecord);
                
                // If mapping failed (e.g. skipped), continue?
                // mapStaffData will return array with 'staff' and 'details' keys.
                
                $staffBatch[] = $mappedData['staff'];
                $detailsBatch[] = $mappedData['details'];
                $serviceNos[] = $oldStaffRecord->serviceNo;
                
                $this->migratedCount++;

                if (count($staffBatch) >= $chunkSize) {
                    $this->processBatch($staffBatch, $detailsBatch, $serviceNos);
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
        if (!empty($staffBatch)) {
            $this->processBatch($staffBatch, $detailsBatch, $serviceNos);
        }
        
        return [
            'migrated' => $this->migratedCount,
            'failed' => $this->failedCount,
            'skipped' => $this->skippedCount,
            'errors' => $this->errors,
        ];
    }

    protected function mapStaffData($oldStaffRecord)
    {
        $now = now();
        
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
            'last_login' => $this->parseDate($oldStaffRecord->last_login), // Ensure date format
            'is_verified' => (bool)$oldStaffRecord->verified,
            'status' => $this->parseInteger($oldStaffRecord->status),
            'zone_id' => $this->mapZone($oldStaffRecord->presentZone),
            'created_at' => $now,
            'updated_at' => $now,
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
            'created_at' => $now,
            'updated_at' => $now,
        ];

        return ['staff' => $staff, 'details' => $details];
    }

    protected function processBatch($staffBatch, $detailsBatch, $serviceNos)
    {
        DB::connection($this->newConnection)->transaction(function () use ($staffBatch, $detailsBatch, $serviceNos) {
            // Using insertOrIgnore to skip duplicates efficiently
            Staff::insertOrIgnore($staffBatch);
            StaffDetail::insertOrIgnore($detailsBatch);
            
            // Migrate education for the batch
            $this->migrateEducationBatch($serviceNos);
        });
    }

    protected function migrateEducationBatch($serviceNos) {
        $qualifications = DB::connection($this->oldConnection)
            ->table('qualifications')
            ->whereIn('service_no', $serviceNos)
            // ->where('status', '!=', '0')
            ->get();
            
        if ($qualifications->isEmpty()) {
            return;
        }

        $educationData = [];
        $now = now();
        
        foreach ($qualifications as $qualification) {
            $educationData[] = [
                'service_no' => $qualification->serviceNo,
                'institution' => $qualification->school,
                'course' => $qualification->course,
                'type' => $this->mapDegreeType($qualification->degree_type),
                'start_date' => $this->parseYear($qualification->start_year),
                'end_date' => $this->parseYear($qualification->end_year),
                'url' => $qualification->attachment,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        
        if (!empty($educationData)) {
            // Chunk education inserts too if they are huge
            foreach (array_chunk($educationData, 1000) as $chunk) {
                StaffEducation::insertOrIgnore($chunk);
            }
        }
    }

    protected function migrateEducation($serviceNo)
    {
        $qualifications = DB::connection($this->oldConnection)
            ->table('qualifications')
            ->where('service_no', $serviceNo)
            // ->where('status', '!=', '0')
            ->get();

        if ($qualifications->isEmpty()) {
            return;
        }

        // Prepare bulk insert data for better performance
        $educationData = [];
        foreach ($qualifications as $qualification) {
            $educationData[] = [
                'service_no' => $serviceNo,
                'institution' => $qualification->school,
                'course' => $qualification->course,
                'type' => $this->mapDegreeType($qualification->degree_type),
                'start_date' => $this->parseYear($qualification->start_year),
                'end_date' => $this->parseYear($qualification->end_year),
                'url' => $qualification->attachment,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Bulk insert for better performance
        if (!empty($educationData)) {
            StaffEducation::insert($educationData);
        }
    }

    protected function parseDate($date)
    {
        if (empty($date) || $date === '0000-00-00' || $date === '0000-00-00 00:00:00') {
            return null;
        }
        
        try {
            return \Carbon\Carbon::parse($date);
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function parseYear($year)
    {
        if (empty($year) || !is_numeric($year)) {
            return null;
        }
        
        try {
            return \Carbon\Carbon::createFromFormat('Y', $year)->startOfYear();
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
        // Map old zone values to new zone_id
        // Adjust this mapping based on your zones table
        $zoneMapping = [
            // Add your zone mappings here
            // 'A' => 1,
            // 'B' => 2,
            // etc.
        ];
        
        return $zoneMapping[$oldZone] ?? null;
    }

    protected function mapDegreeType($degreeType)
    {
        // Map old degree types to new types
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
        return [
            'old_database_total' => DB::connection($this->oldConnection)
                ->table('staff')
                ->where('deleted', 0)
                ->count(),
            'new_database_total' => Staff::count(),
            'pending_migration' => DB::connection($this->oldConnection)
                ->table('staff')
                ->where('deleted', 0)
                ->whereNotIn('service_no', Staff::pluck('service_no'))
                ->count(),
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
