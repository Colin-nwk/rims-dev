<?php

namespace Tests\Unit;

use App\Models\Staff;
use App\Models\StaffCareer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_updating_hook_creates_career_history()
    {
        $staff = Staff::factory()->create([
            'present_rank' => 'Corporal',
        ]);

        // Update the rank directly
        $staff->update([
            'present_rank' => 'Sergeant',
        ]);

        // Check that a career history record was created
        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
        ]);
    }
}