<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class HairColourSeeder extends Seeder
{
    public function run(): void
    {
        $colours = [
            'Black',
            'Dark Brown',
            'Brown',
            'Light Brown',
            'Auburn',
            'Red',
            'Blonde',
            'Platinum Blonde',
            'Grey',
            'White',
            'Salt and Pepper',
            'Bald',
        ];

        foreach ($colours as $colour) {
            \App\Models\HairColour::firstOrCreate(
                ['title' => $colour],
                ['status' => true]
            );
        }
    }
}
