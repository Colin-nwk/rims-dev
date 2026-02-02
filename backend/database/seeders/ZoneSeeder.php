<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('zones')->insert([
            [
                'id' => 1,
                'zone' => 'A',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 2,
                'zone' => 'B',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 3,
                'zone' => 'C',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 4,
                'zone' => 'D',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 5,
                'zone' => 'E',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 6,
                'zone' => 'F',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 7,
                'zone' => 'G',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 8,
                'zone' => 'H',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 9,
                'zone' => 'I',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 10,
                'zone' => 'J',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 11,
                'zone' => 'K',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 12,
                'zone' => 'L',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 13,
                'zone' => 'M',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 14,
                'zone' => 'N',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 15,
                'zone' => 'O',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 16,
                'zone' => 'P',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 17,
                'zone' => 'Q',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
            [
                'id' => 18,
                'zone' => 'R',
                'status' => 1,
                'created_at' => '2025-12-05 06:43:21',
                'updated_at' => '2025-12-05 06:43:21',
            ],
        ]);

        DB::statement('ALTER TABLE zones AUTO_INCREMENT = 19;');
    }
}