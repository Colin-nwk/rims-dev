<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MaritalStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            'Single',
            'Married',
            'Divorced',
            'Widowed',
            'Complicated',
        ];

        foreach ($statuses as $status) {
            \App\Models\MaritalStatus::firstOrCreate(
                ['name' => $status],
                ['status' => 1]
            );
        }
    }
}
