<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class BloodGroupSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            'A+',
            'A-',
            'B+',
            'B-',
            'AB+',
            'AB-',
            'O+',
            'O-',
        ];

        foreach ($groups as $group) {
            \App\Models\BloodGroup::firstOrCreate(
                ['title' => $group],
                ['status' => true]
            );
        }
    }
}
