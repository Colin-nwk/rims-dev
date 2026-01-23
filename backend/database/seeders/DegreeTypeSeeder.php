<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
// use Illuminate\Database\Seeder;

// class DegreeTypeSeeder extends Seeder
// {
//     /**
//      * Run the database seeds.
//      */
//     public function run(): void
//     {
//         $types = [
//             'Associate',
//             'Bachelor`s',
//             'Master`s',
//             'Doctoral',
//             'O Level',
//             'Professional Certification',
//         ];

//         foreach ($types as $type) {
//             \App\Models\DegreeType::create([
//                 'title' => $type,
//                 'status' => 1,
//             ]);
//         }
//     }
// }

use Illuminate\Database\Seeder;

class DegreeTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            // Primary/Secondary Education
            'Primary School Certificate',
            'Junior Secondary Certificate',
            'WAEC SSCE',
            'NECO SSCE',
            'NABTEB',
            'GCE O Level',
            'GCE A Level',
            'IGCSE',
            'Senior Secondary Certificate',
            'GED General Education Diploma',

            // Vocational/Technical
            'Trade Certificate',
            'Vocational Certificate',
            'Technical Diploma',
            'National Diploma ND',
            'Higher National Diploma HND',

            // Undergraduate
            'Associate Degree',
            'Bachelor Degree',
            'Bachelor of Arts BA',
            'Bachelor of Science BSc',
            'Bachelor of Engineering BEng',
            'Bachelor of Technology BTech',

            // Postgraduate
            'Postgraduate Diploma PGD',
            'Master Degree',
            'Master of Arts MA',
            'Master of Science MSc',
            'Master of Business Administration MBA',
            'Master of Engineering MEng',

            // Doctoral
            'Doctoral Degree PhD',
            'Doctor of Philosophy PhD',
            'Doctor of Medicine MD',
            'Doctor of Education EdD',
            'Professional Doctorate',

            // Professional Certifications
            'Professional Certification',
            'Industry Certification',
            'License Registration',

            // Other
            'Diploma',
            'Advanced Diploma',
            'Certificate',
            'Other',
        ];
        foreach ($types as $type) {
            \App\Models\DegreeType::firstOrCreate(
                ['title' => $type],
                ['status' => 1]
            );
        }

        // foreach ($types as $type) {
        //     \App\Models\DegreeType::create([
        //         'title' => $type,
        //         'status' => 1,
        //     ]);
        // }
    }
}
