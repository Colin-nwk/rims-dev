<?php

namespace Tests\Feature\Staff;

use App\Models\Staff;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgeRangeFilterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Setup staff with different ages
        // Using fixed current date reference for stability if needed, but Carbon::setTestNow() is better.
        // For simplicity in this test, we assume relative dates work fine.
        
        // Mock authorization for staff.view
        \Illuminate\Support\Facades\Gate::define('staff.view', function () {
            return true;
        });

        // 17 years old
        Staff::factory()->create([
            'dob' => now()->subYears(17)->subDay(), // 17 years + 1 day old
            'service_no' => 'SVC-17',
        ]);
        
        // 19 years old (Range 18-20)
        Staff::factory()->create([
            'dob' => now()->subYears(19), 
            'service_no' => 'SVC-19',
        ]);

        // 20 years old (Range 18-20)
        Staff::factory()->create([
            'dob' => now()->subYears(20)->subDays(10), 
            'service_no' => 'SVC-20',
        ]);

        // 25 years old (Range 21-25)
        Staff::factory()->create([
            'dob' => now()->subYears(25)->subDays(10), 
            'service_no' => 'SVC-25',
        ]);
        
        // 65 years old (Range 60+)
        Staff::factory()->create([
            'dob' => now()->subYears(65), 
            'service_no' => 'SVC-65',
        ]);
    }

    public function test_filter_exact_range()
    {
        $response = $this->actingAsAdmin()->getJson('/api/v1/staff?age_range=18-20');
        
        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('data.total'));
        $ids = collect($response->json('data.data'))->pluck('service_no')->toArray();

        $this->assertContains('SVC-19', $ids);
        $this->assertContains('SVC-20', $ids);
        $this->assertNotContains('SVC-17', $ids);
        $this->assertNotContains('SVC-25', $ids);
    }

    public function test_filter_less_than()
    {
        $response = $this->actingAsAdmin()->getJson('/api/v1/staff?age_range=less 18');

        $response->assertStatus(200);
        // Should find SVC-17
        $ids = collect($response->json('data.data'))->pluck('service_no')->toArray();
        $this->assertContains('SVC-17', $ids);
        $this->assertNotContains('SVC-19', $ids);
    }

    public function test_filter_above()
    {
        $response = $this->actingAsAdmin()->getJson('/api/v1/staff?age_range=60%2B');

        $response->assertStatus(200);
        $ids = collect($response->json('data.data'))->pluck('service_no')->toArray();
        $this->assertContains('SVC-65', $ids);
        $this->assertNotContains('SVC-25', $ids);
    }

    public function test_filter_above_text()
    {
        $response = $this->actingAsAdmin()->getJson('/api/v1/staff?age_range=above 60');

        $response->assertStatus(200);
        $ids = collect($response->json('data.data'))->pluck('service_no')->toArray();
        $this->assertContains('SVC-65', $ids);
    }

    private function actingAsAdmin()
    {
        $user = \App\Models\User::factory()->create(['status' => 'active']);
        return $this->actingAs($user);
    }


//     GET /api/v1/staff?age_range=18-25
// GET /api/v1/staff?age_range=less 30
// GET /api/v1/staff?age_range=60%2B  (Note: + must be encoded as %2B in URLs)

}
