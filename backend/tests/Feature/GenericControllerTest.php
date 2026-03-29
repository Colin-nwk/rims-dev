<?php

namespace Tests\Feature;

use App\Models\Directorate;
use Database\Seeders\DirectorateSeeder;
use Database\Seeders\TrainingInstituteSeeder;
use Database\Seeders\WorkDistributionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GenericControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_generic_data_includes_new_lookup_resources(): void
    {
        $this->seed([
            WorkDistributionSeeder::class,
            TrainingInstituteSeeder::class,
            DirectorateSeeder::class,
        ]);

        $response = $this->getJson('/api/v1/generic-data');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success')
            ->assertJsonStructure([
                'data' => [
                    'work_distributions',
                    'training_institutes',
                    'directorates',
                ],
            ])
            ->assertJsonFragment(['name' => 'General duty'])
            ->assertJsonFragment(['name' => 'Correctional academy Ijebu Igbo'])
            ->assertJsonFragment(['name' => 'Human resource']);
    }

    public function test_can_fetch_directorates_via_generic_index_and_show_routes(): void
    {
        $directorate = Directorate::query()->create([
            'name' => 'Finance & budget',
            'status' => true,
        ]);

        $indexResponse = $this->getJson('/api/v1/directorates');
        $indexResponse->assertStatus(200)
            ->assertJsonPath('status', 'Success')
            ->assertJsonFragment(['name' => 'Finance & budget']);

        $showResponse = $this->getJson("/api/v1/directorates/{$directorate->id}");
        $showResponse->assertStatus(200)
            ->assertJsonPath('status', 'Success')
            ->assertJsonPath('data.name', 'Finance & budget');
    }
}
