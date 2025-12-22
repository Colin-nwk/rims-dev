<?php

namespace Tests\Feature;

use App\Models\Staff;
use App\Models\StaffDetail;
use App\Services\StatisticsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatisticsServiceTest extends TestCase
{
    use RefreshDatabase;

    protected StatisticsService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new StatisticsService;
    }

    public function test_get_all_returns_expected_structure(): void
    {
        Staff::factory()->count(5)->create();

        $result = $this->service->getAll();

        $this->assertArrayHasKey('overview', $result);
        $this->assertArrayHasKey('gender', $result);
        $this->assertArrayHasKey('marital_status', $result);
        $this->assertArrayHasKey('state_of_origin', $result);
        $this->assertArrayHasKey('assigned_state', $result);
        $this->assertArrayHasKey('present_rank', $result);
        $this->assertArrayHasKey('level', $result);
        $this->assertArrayHasKey('department', $result);
        $this->assertArrayHasKey('education_type', $result);
        $this->assertArrayHasKey('staff_status', $result);
        $this->assertArrayHasKey('appointment_by_year', $result);
        $this->assertArrayHasKey('appointment_by_month', $result);
    }

    public function test_get_all_overview_shows_correct_totals(): void
    {
        Staff::factory()->count(10)->create();

        $result = $this->service->getAll();

        $this->assertEquals(10, $result['overview']['total_staff']);
    }

    public function test_gender_distribution_calculates_percentages(): void
    {
        Staff::factory()->count(3)->create(['sex' => 'Male']);
        Staff::factory()->count(2)->create(['sex' => 'Female']);

        $result = $this->service->getGenderStats();

        $maleStats = collect($result)->firstWhere('label', 'Male');
        $femaleStats = collect($result)->firstWhere('label', 'Female');

        $this->assertEquals(3, $maleStats['count']);
        $this->assertEquals(60, $maleStats['percentage']);
        $this->assertEquals(2, $femaleStats['count']);
        $this->assertEquals(40, $femaleStats['percentage']);
    }

    public function test_filter_by_state_of_origin(): void
    {
        Staff::factory()->count(3)->create(['state_of_origin' => 'Lagos']);
        Staff::factory()->count(2)->create(['state_of_origin' => 'Kano']);

        $result = $this->service->getAll(['state_of_origin' => 'Lagos']);

        $this->assertEquals(3, $result['overview']['total_staff']);
    }

    public function test_filter_by_sex(): void
    {
        Staff::factory()->count(4)->create(['sex' => 'Male']);
        Staff::factory()->count(6)->create(['sex' => 'Female']);

        $result = $this->service->getAll(['sex' => 'Female']);

        $this->assertEquals(6, $result['overview']['total_staff']);
    }

    public function test_filter_by_year_range(): void
    {
        Staff::factory()->create(['date_of_first_appointment' => '2020-01-15']);
        Staff::factory()->create(['date_of_first_appointment' => '2021-06-20']);
        Staff::factory()->create(['date_of_first_appointment' => '2022-03-10']);
        Staff::factory()->create(['date_of_first_appointment' => '2023-12-01']);

        $result = $this->service->getAll(['year_from' => 2021, 'year_to' => 2022]);

        $this->assertEquals(2, $result['overview']['total_staff']);
    }

    public function test_marital_status_distribution(): void
    {
        $staff1 = Staff::factory()->create();
        $staff2 = Staff::factory()->create();
        $staff3 = Staff::factory()->create();

        StaffDetail::factory()->create(['service_no' => $staff1->service_no, 'marital_status' => 'Married']);
        StaffDetail::factory()->create(['service_no' => $staff2->service_no, 'marital_status' => 'Single']);
        StaffDetail::factory()->create(['service_no' => $staff3->service_no, 'marital_status' => 'Married']);

        $result = $this->service->getMaritalStatusStats();

        $marriedStats = collect($result)->firstWhere('label', 'Married');
        $singleStats = collect($result)->firstWhere('label', 'Single');

        $this->assertEquals(2, $marriedStats['count']);
        $this->assertEquals(1, $singleStats['count']);
    }

    public function test_appointment_trends_returns_correct_structure(): void
    {
        Staff::factory()->create(['date_of_first_appointment' => '2020-05-15']);
        Staff::factory()->create(['date_of_first_appointment' => '2021-08-20']);

        $result = $this->service->getAppointmentTrends();

        $this->assertArrayHasKey('by_year', $result);
        $this->assertArrayHasKey('by_month', $result);
        $this->assertArrayHasKey('by_state_origin_year', $result);
        $this->assertArrayHasKey('summary', $result);
        $this->assertArrayHasKey('with_date', $result['summary']);
        $this->assertArrayHasKey('without_date', $result['summary']);
        $this->assertArrayHasKey('earliest', $result['summary']);
        $this->assertArrayHasKey('latest', $result['summary']);
    }

    public function test_level_distribution_formats_correctly(): void
    {
        Staff::factory()->create(['level' => 8]);
        Staff::factory()->create(['level' => 12]);
        Staff::factory()->create(['level' => 8]);

        $result = $this->service->getAll();

        $level8Stats = collect($result['level'])->firstWhere('label', 'GL-8');

        $this->assertNotNull($level8Stats);
        $this->assertEquals(2, $level8Stats['count']);
    }

    public function test_empty_database_returns_zero_counts(): void
    {
        $result = $this->service->getAll();

        $this->assertEquals(0, $result['overview']['total_staff']);
        $this->assertEquals(0, $result['overview']['staff_with_details']);
        $this->assertEquals(0, $result['overview']['education_records']);
    }

    public function test_multiple_filters_apply_together(): void
    {
        Staff::factory()->create(['sex' => 'Male', 'state_of_origin' => 'Lagos', 'status' => 1]);
        Staff::factory()->create(['sex' => 'Male', 'state_of_origin' => 'Kano', 'status' => 1]);
        Staff::factory()->create(['sex' => 'Female', 'state_of_origin' => 'Lagos', 'status' => 1]);
        Staff::factory()->create(['sex' => 'Male', 'state_of_origin' => 'Lagos', 'status' => 0]);

        $result = $this->service->getAll([
            'sex' => 'Male',
            'state_of_origin' => 'Lagos',
            'status' => 1,
        ]);

        $this->assertEquals(1, $result['overview']['total_staff']);
    }
}
