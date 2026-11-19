<?php

namespace Tests\Feature;

use App\Models\Directorate;
use App\Models\Status;
use Database\Seeders\DirectorateSeeder;
use Database\Seeders\StatusSeeder;
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
            StatusSeeder::class,
        ]);

        $response = $this->getJson('/api/v1/generic-data');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'Success')
            ->assertJsonStructure([
                'data' => [
                    'work_distributions',
                    'training_institutes',
                    'directorates',
                    'statuses',
                ],
            ])
            ->assertJsonFragment(['name' => 'General duty'])
            ->assertJsonFragment(['name' => 'Correctional academy Ijebu Igbo'])
            ->assertJsonFragment(['name' => 'Human resource'])
            ->assertJsonFragment(['name' => 'Retirement']);
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

    public function test_can_fetch_statuses_via_generic_index_and_show_routes(): void
    {
        $status = Status::query()->create([
            'name' => 'Study leave',
            'status' => true,
        ]);

        $indexResponse = $this->getJson('/api/v1/statuses');
        $indexResponse->assertStatus(200)
            ->assertJsonPath('status', 'Success')
            ->assertJsonFragment(['name' => 'Study leave']);

        $showResponse = $this->getJson("/api/v1/statuses/{$status->id}");
        $showResponse->assertStatus(200)
            ->assertJsonPath('status', 'Success')
            ->assertJsonPath('data.name', 'Study leave');
    }
}
