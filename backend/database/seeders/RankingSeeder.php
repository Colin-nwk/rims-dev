<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class RankingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ranks = [
            ['id' => 1, 'title' => 'CGC', 'status' => 1],
            ['id' => 2, 'title' => 'DCGC', 'status' => 1],
            ['id' => 3, 'title' => 'ACGC', 'status' => 1],
            ['id' => 4, 'title' => 'CC', 'status' => 1],
            ['id' => 5, 'title' => 'DCC', 'status' => 1],
            ['id' => 6, 'title' => 'ACC', 'status' => 1],
            ['id' => 7, 'title' => 'CSC', 'status' => 1],
            ['id' => 8, 'title' => 'SC', 'status' => 1],
            ['id' => 9, 'title' => 'DSC', 'status' => 1],
            ['id' => 10, 'title' => 'ASC I', 'status' => 1],
            ['id' => 11, 'title' => 'ASC II', 'status' => 1],
            ['id' => 12, 'title' => 'IC I', 'status' => 1],
            ['id' => 13, 'title' => 'IC II', 'status' => 1],
            ['id' => 14, 'title' => 'CCA', 'status' => 1],
            ['id' => 15, 'title' => 'AIC', 'status' => 1],
            ['id' => 16, 'title' => 'SCA', 'status' => 1],
            ['id' => 17, 'title' => 'CA I', 'status' => 1],
            ['id' => 18, 'title' => 'CA II', 'status' => 1],
            ['id' => 19, 'title' => 'CA III', 'status' => 1],
        ];

        foreach ($ranks as $rank) {
            \App\Models\Ranking::updateOrCreate(
                ['id' => $rank['id']],
                ['title' => $rank['title'], 'status' => $rank['status']]
            );
        }
    }
}
