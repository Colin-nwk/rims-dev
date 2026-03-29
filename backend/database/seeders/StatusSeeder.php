<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class StatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            'Death',
            'Suspension',
            'Study leave',
            'Foreign mission',
            'Retirement',
            'Dismissal',
            'Warning',
            'Interdiction',
            'Compulsory retirement',
            'Suspension',
            'Reduction in rank',
        ];

        foreach ($statuses as $status) {
            \App\Models\Status::firstOrCreate(
                ['name' => $status],
                ['status' => 1]
            );
        }
    }
}
