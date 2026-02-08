<?php

namespace Tests\Feature\Staff;

use App\Models\Staff;
use App\Models\State;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommandRelationshipTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_commands_relationship()
    {
        // Create states
        $state1 = State::factory()->create(['state' => 'Lagos']);
        $state2 = State::factory()->create(['state' => 'Abuja']);

        // Create staff with linked commands
        $staff = Staff::factory()->create([
            'initial_command' => $state1->id,
            'present_command' => $state2->id,
            'assigned_state' => $state1->id,
        ]);

        // Refresh model
        $staff->refresh();

        // Assert relationships
        $this->assertInstanceOf(State::class, $staff->initialCommand);
        $this->assertEquals('Lagos', $staff->initialCommand->state);

        $this->assertInstanceOf(State::class, $staff->presentCommand);
        $this->assertEquals('Abuja', $staff->presentCommand->state);
        
        $this->assertInstanceOf(State::class, $staff->assignedState);
        $this->assertEquals('Lagos', $staff->assignedState->state);
    }
}
