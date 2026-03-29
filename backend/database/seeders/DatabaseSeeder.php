<?php

namespace Database\Seeders;

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
        $this->call([
            // Reference data seeders (run first)
            ZoneSeeder::class,
            StateSeeder::class,
            PrisonSeeder::class,
            LGASeeder::class,
            BloodGroupSeeder::class,
            BloodGenotypeSeeder::class,
            ComplexionSeeder::class,
            HairColourSeeder::class,
            DegreeTypeSeeder::class,
            RankingSeeder::class,
            LevelSeeder::class,
            MaritalStatusSeeder::class,
            WorkDistributionSeeder::class,
            TrainingInstituteSeeder::class,
            DirectorateSeeder::class,

            // Main data seeders
            // StaffSeeder::class,
            SqlStaffSeeder::class,
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
        ]);
    }
}
