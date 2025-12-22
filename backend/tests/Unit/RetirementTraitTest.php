<?php

namespace Tests\Unit;

use App\Models\Staff;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RetirementTraitTest extends TestCase
{
    use RefreshDatabase;

    public function test_retirement_by_service_comes_first()
    {
        // Staff hired young: service retirement comes first
        $staff = Staff::factory()->create([
            'dob' => Carbon::now()->subYears(25), // 25 years old
            'date_of_first_appointment' => Carbon::now()->subYears(5), // 5 years of service
        ]);

        // Service retirement = first_appointment + 35 = now + 30 years
        // Age retirement = dob + 65 = now + 40 years
        // Service comes first
        $expectedRetirement = Carbon::now()->subYears(5)->addYears(35);

        $this->assertEquals($expectedRetirement->format('Y-m-d'), $staff->retirement_date_formatted);
        $this->assertFalse($staff->is_retired);
        $this->assertEquals('active', $staff->retirement_time_remaining['status']);
    }

    public function test_retirement_by_age_comes_first()
    {
        // Staff hired late: age retirement comes first
        $staff = Staff::factory()->create([
            'dob' => Carbon::now()->subYears(55), // 55 years old
            'date_of_first_appointment' => Carbon::now()->subYears(5), // 5 years of service
        ]);

        // Service retirement = first_appointment + 35 = now + 30 years
        // Age retirement = dob + 65 = now + 10 years
        // Age comes first
        $expectedRetirement = Carbon::now()->subYears(55)->addYears(65);

        $this->assertEquals($expectedRetirement->format('Y-m-d'), $staff->retirement_date_formatted);
        $this->assertFalse($staff->is_retired);
    }

    public function test_staff_is_retired()
    {
        $staff = Staff::factory()->create([
            'dob' => Carbon::now()->subYears(70), // 70 years old (already past 65)
            'date_of_first_appointment' => Carbon::now()->subYears(40), // 40 years of service
        ]);

        $this->assertTrue($staff->is_retired);
        $this->assertEquals('retired', $staff->retirement_time_remaining['status']);
        $this->assertEquals('Already retired', $staff->retirement_time_remaining['human_readable']);
    }

    public function test_retirement_time_remaining_format()
    {
        $staff = Staff::factory()->create([
            'dob' => Carbon::now()->subYears(30),
            'date_of_first_appointment' => Carbon::now()->subYears(2),
        ]);

        $remaining = $staff->retirement_time_remaining;

        $this->assertArrayHasKey('status', $remaining);
        $this->assertArrayHasKey('years', $remaining);
        $this->assertArrayHasKey('months', $remaining);
        $this->assertArrayHasKey('days', $remaining);
        $this->assertArrayHasKey('human_readable', $remaining);
    }
}
