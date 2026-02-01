<?php

namespace Database\Seeders;

use App\Models\Zone;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $zones = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R'];

        foreach ($zones as $zone) {
            Zone::firstOrCreate(
                ['zone' => $zone],
                ['zone' => $zone, 'status' => true]
            );
        }
    }
}