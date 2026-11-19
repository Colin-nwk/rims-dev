<?php

namespace Tests\Feature\Services;

use App\Models\Staff;
use App\Models\Zone;
use App\Services\StaffImportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffImportServiceTest extends TestCase
{
    use RefreshDatabase;

    protected StaffImportService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(StaffImportService::class);
    }

    public function test_it_can_parse_name_correctly(): void
    {
        $result = $this->service->parseName('DOE JOHN MICHAEL');
        $this->assertEquals('DOE', $result['surname']);
        $this->assertEquals('JOHN', $result['first_name']);
        $this->assertEquals('MICHAEL', $result['other_names']);

        $result = $this->service->parseName('SMITH JANE');
        $this->assertEquals('SMITH', $result['surname']);
        $this->assertEquals('JANE', $result['first_name']);
        $this->assertEquals('', $result['other_names']);

        $result = $this->service->parseName('SOLO');
        $this->assertEquals('SOLO', $result['surname']);
        $this->assertEquals('', $result['first_name']);
    }

    public function test_it_can_parse_date_formats(): void
    {
        $this->assertEquals('1990-09-05', $this->service->parseDate('5/9/1990'));

        $this->assertEquals('2023-01-01', $this->service->parseDate('1/1/2023'));

        $this->assertNull($this->service->parseDate('########'));
        $this->assertNull($this->service->parseDate(''));
        $this->assertNull($this->service->parseDate(null));

        $excelSerial = 44197;
        $result = $this->service->parseDate($excelSerial);
        $this->assertNotNull($result);
    }

    public function test_it_can_import_single_row(): void
    {
        $rows = [
            [
                'S/N' => '1',
                'NAME' => 'DOE JOHN MICHAEL',
                'SEX' => 'M',
                'SER. NO' => '12345',
                'FILE NO' => '67890',
                'RANK' => 'CGC',
                'DOB' => '1/1/1980',
                'STATE OF' => 'LAGOS',
                'LGA' => 'IKEJA',
            ],
        ];

        $stats = $this->service->import($rows);

        $this->assertEquals(1, $stats['imported']);
        $this->assertEquals(0, $stats['failed']);

        $this->assertDatabaseHas('staff', [
            'service_no' => '12345',
            'surname' => 'DOE',
            'first_name' => 'JOHN',
            'sex' => 'Male',
        ]);
    }

    public function test_it_skips_existing_staff_when_flag_set(): void
    {
        Staff::factory()->create(['service_no' => '12345', 'surname' => 'EXISTING']);

        $rows = [
            [
                'NAME' => 'NEW PERSON',
                'SER. NO' => '12345',
                'SEX' => 'M',
            ],
        ];

        $stats = $this->service->import($rows, dryRun: false, skipExisting: true);

        $this->assertEquals(0, $stats['imported']);
        $this->assertEquals(1, $stats['skipped']);

        $this->assertDatabaseHas('staff', [
            'service_no' => '12345',
            'surname' => 'EXISTING',
        ]);
    }

    public function test_dry_run_does_not_persist_data(): void
    {
        $rows = [
            [
                'NAME' => 'DRY RUN TEST',
                'SER. NO' => '99999',
                'SEX' => 'F',
            ],
        ];

        $stats = $this->service->import($rows, dryRun: true);

        $this->assertEquals(1, $stats['imported']);
        $this->assertDatabaseMissing('staff', ['service_no' => '99999']);
    }

    public function test_it_fails_on_missing_service_number(): void
    {
        $rows = [
            [
                'NAME' => 'NO SERVICE NO',
                'SEX' => 'M',
            ],
        ];

        $stats = $this->service->import($rows);

        $this->assertEquals(0, $stats['imported']);
        $this->assertEquals(1, $stats['failed']);
        $this->assertStringContainsString('Missing service number', $stats['errors'][0]);
    }

    public function test_it_creates_education_from_qualification(): void
    {
        $rows = [
            [
                'NAME' => 'EDUCATED PERSON',
                'SER. NO' => '11111',
                'SEX' => 'M',
                'QUALIFIC' => 'B.SC',
            ],
        ];

        $stats = $this->service->import($rows);

        $this->assertEquals(1, $stats['imported']);
        $this->assertDatabaseHas('staff_education', [
            'service_no' => '11111',
            'type' => 'B.SC',
        ]);
    }

    public function test_it_looks_up_zone_id(): void
    {
        Zone::factory()->create(['id' => 5, 'zone' => 'Zone A']);

        $rows = [
            [
                'NAME' => 'ZONED PERSON',
                'SER. NO' => '22222',
                'SEX' => 'M',
                'ZONE' => 'Zone "A"',
            ],
        ];

        $stats = $this->service->import($rows);

        $this->assertEquals(1, $stats['imported']);
        $this->assertDatabaseHas('staff', [
            'service_no' => '22222',
            'zone_id' => 5,
        ]);
    }
}
