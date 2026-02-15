<?php

namespace Tests\Unit;

use App\Models\Staff;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_staff_with_rank_creates_initial_career_history()
    {
        $rank = \App\Models\Ranking::factory()->create(['title' => 'Corporal']);

        $staff = Staff::factory()->create([
            'present_rank' => $rank->id,
        ]);

        // Check that an initial career history record was created
        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => null,
            'new_value' => 'Corporal',
            'reason' => 'Initial rank assignment',
        ]);
    }

    public function test_creating_staff_with_command_creates_initial_career_history()
    {
        $state = \App\Models\State::factory()->create(['state' => 'Lagos State']);

        $staff = Staff::factory()->create([
            'present_command' => $state->id,
        ]);

        // Check that an initial career history record was created with state name
        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_command',
            'old_value' => null,
            'new_value' => 'Lagos State',
            'reason' => 'Initial command assignment',
        ]);
    }

    public function test_creating_staff_with_both_rank_and_command_creates_two_career_records()
    {
        $rank = \App\Models\Ranking::factory()->create(['title' => 'Sergeant']);
        $state = \App\Models\State::factory()->create(['state' => 'Abuja FCT']);

        $staff = Staff::factory()->create([
            'present_rank' => $rank->id,
            'present_command' => $state->id,
        ]);

        // Check that two initial career history records were created
        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => null,
            'new_value' => 'Sergeant',
            'reason' => 'Initial rank assignment',
        ]);

        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_command',
            'old_value' => null,
            'new_value' => 'Abuja FCT',
            'reason' => 'Initial command assignment',
        ]);

        // Verify exactly 2 records were created
        $this->assertEquals(2, \App\Models\StaffCareer::where('service_no', $staff->service_no)->count());
    }

    public function test_updating_hook_creates_career_history()
    {
        $rank1 = \App\Models\Ranking::factory()->create(['title' => 'Corporal']);
        $rank2 = \App\Models\Ranking::factory()->create(['title' => 'Sergeant']);

        $staff = Staff::factory()->create([
            'present_rank' => $rank1->id,
        ]);

        // Update the rank directly
        $staff->update([
            'present_rank' => $rank2->id,
        ]);

        // Check that a career history record was created for the update
        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
            'reason' => 'Rank update',
        ]);
    }

    public function test_updating_both_rank_and_command_creates_two_career_records()
    {
        $rank1 = \App\Models\Ranking::factory()->create(['title' => 'Corporal']);
        $rank2 = \App\Models\Ranking::factory()->create(['title' => 'Sergeant']);
        $state1 = \App\Models\State::factory()->create(['state' => 'Lagos State']);
        $state2 = \App\Models\State::factory()->create(['state' => 'Kano State']);

        $staff = Staff::factory()->create([
            'present_rank' => $rank1->id,
            'present_command' => $state1->id,
        ]);

        // Clear initial creation records
        \App\Models\StaffCareer::where('service_no', $staff->service_no)->delete();

        // Update both rank and command
        $staff->update([
            'present_rank' => $rank2->id,
            'present_command' => $state2->id,
        ]);

        // Check that two career history records were created
        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_rank',
            'old_value' => 'Corporal',
            'new_value' => 'Sergeant',
            'reason' => 'Rank update',
        ]);

        $this->assertDatabaseHas('staff_careers', [
            'service_no' => $staff->service_no,
            'field_changed' => 'present_command',
            'old_value' => 'Lagos State',
            'new_value' => 'Kano State',
            'reason' => 'Command update',
        ]);

        // Verify exactly 2 records exist (after clearing initial records)
        $this->assertEquals(2, \App\Models\StaffCareer::where('service_no', $staff->service_no)->count());
    }
}
