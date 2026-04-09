<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class WorkDistributionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $workDistributions = [
            'General duty',
            'Medical',
            'Works',
            'Industry',
            'Non custodial',
            'Arm squad',
            'Intelligence',
        ];

        foreach ($workDistributions as $workDistribution) {
            \App\Models\WorkDistribution::firstOrCreate(
                ['name' => $workDistribution],
                ['status' => 1]
            );
        }
    }
}
