<?php

namespace Tests\Feature;

use Database\Seeders\DirectorateSeeder;
use Database\Seeders\TrainingInstituteSeeder;
use Database\Seeders\WorkDistributionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LookupReferenceSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_work_distribution_seeder_populates_expected_records(): void
    {
        $this->seed(WorkDistributionSeeder::class);

        $this->assertDatabaseCount('work_distributions', 7);
        $this->assertDatabaseHas('work_distributions', [
            'name' => 'General duty',
            'status' => 1,
        ]);
    }

    public function test_training_institute_seeder_populates_expected_records(): void
    {
        $this->seed(TrainingInstituteSeeder::class);

        $this->assertDatabaseCount('training_institutes', 12);
        $this->assertDatabaseHas('training_institutes', [
            'name' => 'Correctional training college Enugu',
            'status' => 1,
        ]);
    }

    public function test_directorate_seeder_populates_expected_records(): void
    {
        $this->seed(DirectorateSeeder::class);

        $this->assertDatabaseCount('directorates', 8);
        $this->assertDatabaseHas('directorates', [
            'name' => 'Finance & budget',
            'status' => 1,
        ]);
    }
}
