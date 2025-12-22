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
            'CGC', 'DCGC', 'ACGC', 'CC', 'DCC', 'ACC', 'CSC', 'SC', 'DSC',
            'ASC I', 'ASC II', 'IC I', 'IC II', 'CCA', 'AIC', 'SCA',
            'CA I', 'CA II', 'CA III',
        ];

        foreach ($ranks as $rank) {
            \App\Models\Ranking::firstOrCreate(
                ['title' => $rank],
                ['status' => 1]
            );
        }

        // foreach ($ranks as $rank) {
        //     \App\Models\Ranking::create([
        //         'title' => $rank,
        //         'status' => 1,
        //     ]);
        // }
    }
}
