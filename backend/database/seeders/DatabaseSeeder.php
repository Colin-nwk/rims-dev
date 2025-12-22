<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call([
            // Reference data seeders (run first)
            BloodGroupSeeder::class,
            BloodGenotypeSeeder::class,
            ComplexionSeeder::class,
            HairColourSeeder::class,
            DegreeTypeSeeder::class,
            RankingSeeder::class,

            // Main data seeders
            StaffSeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
        ]);
    }
}
