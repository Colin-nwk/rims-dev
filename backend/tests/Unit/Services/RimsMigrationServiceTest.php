<?php

namespace Tests\Unit\Services;

use App\Services\RimsMigrationService;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class RimsMigrationServiceTest extends TestCase
{
    public function test_mapping_reuses_the_run_level_fallback_password_hash(): void
    {
        $service = $this->service();
        $record = $this->legacyRecord(['serviceNo' => 'RIMS-001', 'pwrd' => '']);
        $fallbackHash = '$2y$12$precomputed-hash';

        $first = $service->map($record, $fallbackHash);
        $second = $service->map($record, $fallbackHash);

        $this->assertSame($fallbackHash, $first['staff']['password']);
        $this->assertSame($fallbackHash, $second['staff']['password']);
    }

    public function test_fast_date_and_year_parsing_preserves_validation(): void
    {
        $service = $this->service();

        $this->assertSame('2024-02-29 00:00:00', $service->date('2024-02-29'));
        $this->assertNull($service->date('2024-02-31'));
        $this->assertSame('2020-01-01 00:00:00', $service->year('2020'));
        $this->assertNull($service->year('2020.5'));
    }

    public function test_blank_and_duplicate_emails_become_null_instead_of_dropping_staff_rows(): void
    {
        $service = $this->service();
        $claimedEmails = ['used@example.com' => true];

        $this->assertNull($service->claim('', $claimedEmails));
        $this->assertNull($service->claim(' USED@example.com ', $claimedEmails));
        $this->assertSame('new@example.com', $service->claim(' new@example.com ', $claimedEmails));
        $this->assertNull($service->claim('NEW@example.com', $claimedEmails));

        $mapped = $service->map($this->legacyRecord(['email' => '']), 'fallback');
        $this->assertNull($mapped['staff']['email']);
    }

    public function test_it_extracts_a_complete_staff_education_insert_from_a_sql_dump(): void
    {
        $service = $this->service();
        $path = tempnam(sys_get_temp_dir(), 'rims-education-');
        file_put_contents($path, <<<'SQL'
            -- unrelated statement
            INSERT INTO `staff` (`id`) VALUES (1);
            INSERT INTO `staff_education` (`id`, `service_no`) VALUES
            (1, '1001'),
            (2, '1002');
            ALTER TABLE `staff_education` ADD PRIMARY KEY (`id`);
            SQL);

        try {
            $result = $service->educationInsert($path);

            $this->assertSame([1, 2], $result['ids']);
            $this->assertSame(['1001', '1002'], $result['service_numbers']);
            $this->assertStringStartsWith('INSERT INTO `staff_education`', $result['sql']);
        } finally {
            unlink($path);
        }
    }

    public function test_it_rejects_an_incomplete_staff_education_insert(): void
    {
        $service = $this->service();
        $path = tempnam(sys_get_temp_dir(), 'rims-education-');
        file_put_contents($path, "INSERT INTO `staff_education` (`id`, `service_no`) VALUES\n(1, '1001'),\n");

        try {
            $this->expectException(RuntimeException::class);
            $this->expectExceptionMessage('incomplete');
            $service->educationInsert($path);
        } finally {
            unlink($path);
        }
    }

    private function service(): RimsMigrationService
    {
        return new class extends RimsMigrationService
        {
            public function map(object $record, string $fallbackHash): array
            {
                return $this->mapStaffData($record, '2026-01-01 00:00:00', $fallbackHash);
            }

            public function date(mixed $date): ?string
            {
                return $this->parseDate($date);
            }

            public function year(mixed $year): ?string
            {
                return $this->parseYear($year);
            }

            /** @param array<string, bool> $claimedEmails */
            public function claim(mixed $email, array &$claimedEmails): ?string
            {
                return $this->claimUniqueEmail($email, $claimedEmails);
            }

            /** @return array{sql: string, ids: array<int, int>, service_numbers: array<int, string>} */
            public function educationInsert(string $path): array
            {
                return $this->readStaffEducationInsert($path);
            }
        };
    }

    /** @param array<string, mixed> $overrides */
    private function legacyRecord(array $overrides = []): object
    {
        $fields = [
            'serviceNo', 'email', 'pwrd', 'phone', 'assigned_state', 'prison', 'sname', 'fname',
            'othernames', 'sex', 'iniRank', 'presentRank', 'level', 'Step', 'dob', 'first_appt_date',
            'present_appt_date', 'presentCommand_post_date', 'initialCommand', 'presentCommand',
            'stateOfOrigin', 'lga', 'dept', 'fileNo', 'duty', 'description', 'photo', 'last_login',
            'verified', 'status', 'presentZone', 'pfa', 'pencom', 'ippis', 'nin', 'bvn', 'place_of_birth',
            'contact_address', 'permanent_home_address', 'height', 'blood_group', 'blood_genotype',
            'complexion', 'hair_colour', 'deformed', 'deformity', 'convicted', 'previous_conviction',
            'next_of_kin1', 'next_of_kin1_relationship', 'next_of_kin1_address', 'next_of_kin2',
            'next_of_kin2_relationship', 'next_of_kin2_address', 'marital_status', 'no_of_children',
            'bank', 'account_no',
        ];

        return (object) array_replace(array_fill_keys($fields, null), $overrides);
    }
}
