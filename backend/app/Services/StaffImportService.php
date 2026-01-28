<?php

namespace App\Services;

use App\Models\Staff;
use App\Models\Zone;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StaffImportService
{
    protected array $stats = [
        'imported' => 0,
        'skipped' => 0,
        'failed' => 0,
        'errors' => [],
    ];

    protected array $columnMap = [
        'S/N' => null,
        'NAME' => 'name',
        'SEX' => 'sex',
        'SER. NO' => 'service_no',
        'FILE NO' => 'file_no',
        'RANK' => 'present_rank',
        'DOB' => 'dob',
        'DOFA' => 'date_of_first_appointment',
        'DOPA' => 'present_appointment_date',
        'QUALIFIC' => 'qualification',
        'STATE OF' => 'state_of_origin',
        'LGA' => 'lga',
        'ZONE' => 'zone',
        'COMMAND' => 'present_command',
        'STATION' => 'initial_command',
    ];

    /**
     * Import staff data from a CSV file
     *
     * @param  array<int, array<string, mixed>>  $rows  Parsed rows with headers as keys
     */
    public function import(array $rows, bool $dryRun = false, bool $skipExisting = false): array
    {
        $this->resetStats();

        foreach ($rows as $index => $row) {
            try {
                $this->processRow($row, $index + 2, $dryRun, $skipExisting);
            } catch (Exception $e) {
                $this->stats['failed']++;
                $this->stats['errors'][] = 'Row '.($index + 2).': '.$e->getMessage();
                Log::warning('Staff import failed for row '.($index + 2), [
                    'error' => $e->getMessage(),
                    'row' => $row,
                ]);
            }
        }

        return $this->stats;
    }

    protected function processRow(array $row, int $rowNum, bool $dryRun, bool $skipExisting): void
    {
        $data = $this->transformRow($row);

        if (empty($data['service_no'])) {
            throw new Exception('Missing service number');
        }

        $existing = Staff::where('service_no', $data['service_no'])->first();

        if ($existing) {
            if ($skipExisting) {
                $this->stats['skipped']++;

                return;
            }
            throw new Exception("Staff with service_no {$data['service_no']} already exists");
        }

        if ($dryRun) {
            $this->stats['imported']++;

            return;
        }

        DB::transaction(function () use ($data) {
            $staffData = $this->extractStaffData($data);
            $staffData['status'] = 1;

            $staff = Staff::create($staffData);

            if (! empty($data['qualification'])) {
                $staff->education()->create([
                    'type' => $data['qualification'],
                    'institution' => 'Not specified',
                    'start_date' => now()->subYears(10),
                ]);
            }
        });

        $this->stats['imported']++;
    }

    protected function transformRow(array $row): array
    {
        $data = [];

        foreach ($row as $header => $value) {
            $normalizedHeader = $this->normalizeHeader($header);
            $field = $this->columnMap[$normalizedHeader] ?? null;

            if ($field && $value !== null && $value !== '') {
                $data[$field] = $this->cleanValue($value);
            }
        }

        if (isset($data['name'])) {
            $nameParts = $this->parseName($data['name']);
            $data = array_merge($data, $nameParts);
            unset($data['name']);
        }

        if (isset($data['dob'])) {
            $data['dob'] = $this->parseDate($data['dob']);
        }

        if (isset($data['date_of_first_appointment'])) {
            $data['date_of_first_appointment'] = $this->parseDate($data['date_of_first_appointment']);
        }

        if (isset($data['present_appointment_date'])) {
            $data['present_appointment_date'] = $this->parseDate($data['present_appointment_date']);
        }

        if (isset($data['zone'])) {
            $data['zone_id'] = $this->findZoneId($data['zone']);
            unset($data['zone']);
        }

        if (isset($data['sex'])) {
            $data['sex'] = $this->normalizeSex($data['sex']);
        }

        return $data;
    }

    protected function extractStaffData(array $data): array
    {
        $staffFields = [
            'service_no', 'email', 'password', 'phone_number', 'assigned_state',
            'prison', 'surname', 'first_name', 'other_names', 'sex', 'initial_rank',
            'present_rank', 'level', 'step', 'dob', 'date_of_first_appointment',
            'present_appointment_date', 'command_post_date', 'initial_command',
            'present_command', 'state_of_origin', 'lga', 'department', 'file_no',
            'duty', 'description', 'photo', 'status', 'zone_id',
        ];

        return array_intersect_key($data, array_flip($staffFields));
    }

    public function parseName(string $name): array
    {
        $name = trim($name);
        $parts = preg_split('/[\s,]+/', $name, -1, PREG_SPLIT_NO_EMPTY);

        if (empty($parts)) {
            return ['surname' => '', 'first_name' => '', 'other_names' => ''];
        }

        $surname = array_shift($parts);
        $firstName = array_shift($parts) ?? '';
        $otherNames = implode(' ', $parts);

        return [
            'surname' => $surname,
            'first_name' => $firstName,
            'other_names' => $otherNames,
        ];
    }

    public function parseDate(mixed $value): ?string
    {
        if (empty($value) || $value === '########') {
            return null;
        }

        if (is_numeric($value)) {
            try {
                $unixTimestamp = ($value - 25569) * 86400;

                return Carbon::createFromTimestamp($unixTimestamp)->format('Y-m-d');
            } catch (Exception $e) {
                return null;
            }
        }

        $formats = ['d/m/Y', 'd/m/y', 'Y-m-d', 'm/d/Y', 'd-m-Y'];

        foreach ($formats as $format) {
            try {
                $date = Carbon::createFromFormat($format, $value);
                if ($date) {
                    return $date->format('Y-m-d');
                }
            } catch (Exception $e) {
                continue;
            }
        }

        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (Exception $e) {
            return null;
        }
    }

    protected function findZoneId(string $zoneName): ?int
    {
        $zoneName = strtoupper(trim($zoneName));

        if (preg_match('/ZONE\s*["\']?([A-Z])["\']?/i', $zoneName, $matches)) {
            $zoneName = 'Zone '.$matches[1];
        }

        $zone = Zone::whereRaw('UPPER(zone) LIKE ?', ['%'.strtoupper($zoneName).'%'])->first();

        return $zone?->id;
    }

    protected function normalizeSex(string $sex): string
    {
        $sex = strtoupper(trim($sex));

        if (in_array($sex, ['M', 'MALE'])) {
            return 'Male';
        }

        if (in_array($sex, ['F', 'FEMALE'])) {
            return 'Female';
        }

        return $sex;
    }

    protected function normalizeHeader(string $header): string
    {
        $header = strtoupper(trim($header));

        $mappings = [
            'SER NO' => 'SER. NO',
            'SERNO' => 'SER. NO',
            'SERVICE NO' => 'SER. NO',
            'SERVICE_NO' => 'SER. NO',
            'FILE_NO' => 'FILE NO',
            'FILENO' => 'FILE NO',
            'STATE' => 'STATE OF',
            'STATE_OF_ORIGIN' => 'STATE OF',
            'QUALIFICATION' => 'QUALIFIC',
        ];

        return $mappings[$header] ?? $header;
    }

    protected function cleanValue(mixed $value): string
    {
        if (is_string($value)) {
            return trim($value);
        }

        return (string) $value;
    }

    protected function resetStats(): void
    {
        $this->stats = [
            'imported' => 0,
            'skipped' => 0,
            'failed' => 0,
            'errors' => [],
        ];
    }

    public function getStats(): array
    {
        return $this->stats;
    }

    /**
     * Parse CSV file into rows array
     */
    public function parseCsvFile(string $filePath): array
    {
        if (! file_exists($filePath)) {
            throw new Exception("File not found: {$filePath}");
        }

        $rows = [];
        $handle = fopen($filePath, 'r');

        if ($handle === false) {
            throw new Exception("Cannot open file: {$filePath}");
        }

        $headers = fgetcsv($handle);

        if ($headers === false) {
            fclose($handle);
            throw new Exception('Cannot read CSV headers');
        }

        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) === count($headers)) {
                $rows[] = array_combine($headers, $data);
            }
        }

        fclose($handle);

        return $rows;
    }
}
