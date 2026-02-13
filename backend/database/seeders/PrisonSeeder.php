<?php

namespace Database\Seeders;

use App\Models\Prison;
use App\Models\State;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrisonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get state IDs for mapping
        $states = State::all()->keyBy('state');

        // Clear existing data to avoid duplicates
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('prisons')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $prisonData = $this->getPrisonData($states);

        // Insert prisons in chunks for better performance
        $chunks = array_chunk($prisonData, 50);
        foreach ($chunks as $chunk) {
            Prison::insert($chunk);
        }

        $this->command->info('✅ Nigerian Custodial Centers seeded successfully!');
    }

    /**
     * Get correct Nigerian custodial centers from SQL file data properly mapped to their states
     */
    private function getPrisonData($states): array
    {
        $now = now();
        $prisonData = [];

        // Map state IDs to state names based on SQL file patterns
        $stateMapping = $this->getStateIdMapping($states);

        // All prisons from the SQL file with their exact names and state mappings
        $prisons = [
            // Lagos State (ID: 24)
            ['state_id' => 24, 'name' => 'Max. Sec. Kirikiri', 'active' => 0],
            ['state_id' => 24, 'name' => 'Med. Sec. Kirikiri', 'active' => 0],
            ['state_id' => 24, 'name' => 'Female', 'active' => 0],
            ['state_id' => 24, 'name' => 'Ikoyi', 'active' => 1],
            ['state_id' => 24, 'name' => 'Badagry', 'active' => 0],

            // Ogun State (ID: 27)
            ['state_id' => 27, 'name' => 'Abeokuta', 'active' => 1],
            ['state_id' => 27, 'name' => 'Ijebu-Ode', 'active' => 0],
            ['state_id' => 27, 'name' => 'Ilaro', 'active' => 0],
            ['state_id' => 27, 'name' => 'Shagamu', 'active' => 0],
            ['state_id' => 27, 'name' => 'Borstal', 'active' => 0],
            ['state_id' => 27, 'name' => 'New MSP Ab', 'active' => 0],
            ['state_id' => 27, 'name' => 'Ago-Iwoye FC', 'active' => 0],

            // Kaduna State (ID: 18)
            ['state_id' => 18, 'name' => 'Birnin Gwari', 'active' => 0],
            ['state_id' => 18, 'name' => 'Kaduna', 'active' => 0],
            ['state_id' => 18, 'name' => 'Kafanchan', 'active' => 0],
            ['state_id' => 18, 'name' => 'Kakuri Prison Camp', 'active' => 0],
            ['state_id' => 18, 'name' => 'Zaria', 'active' => 0],
            ['state_id' => 18, 'name' => 'Kujama Farm', 'active' => 0],
            ['state_id' => 19, 'name' => 'Borstal', 'active' => 0],
            ['state_id' => 18, 'name' => 'Kachia Satellite', 'active' => 0],
            ['state_id' => 18, 'name' => 'Saminaka Satellite', 'active' => 0],
            ['state_id' => 18, 'name' => 'Soba Satellite', 'active' => 0],
            ['state_id' => 18, 'name' => 'Manchok Satellite', 'active' => 0],
            ['state_id' => 18, 'name' => 'Gwantu Satellite', 'active' => 0],
            ['state_id' => 18, 'name' => 'Kwoi Satellite', 'active' => 0],
            ['state_id' => 18, 'name' => 'Ikara Satellite', 'active' => 0],
            ['state_id' => 18, 'name' => 'Makarfi Satellite', 'active' => 0],

            // Katsina State (ID: 20)
            ['state_id' => 20, 'name' => 'MSP Daura (New)', 'active' => 0],
            ['state_id' => 20, 'name' => 'Daura Old', 'active' => 0],
            ['state_id' => 20, 'name' => 'Katsina', 'active' => 0],
            ['state_id' => 20, 'name' => 'MSP Funtua', 'active' => 0],
            ['state_id' => 20, 'name' => 'Dutsinma Satellite', 'active' => 0],
            ['state_id' => 20, 'name' => 'Kankia Satellite', 'active' => 0],
            ['state_id' => 20, 'name' => 'Malumfashi Satellite', 'active' => 0],
            ['state_id' => 20, 'name' => 'Jibia Satellite', 'active' => 0],
            ['state_id' => 20, 'name' => 'Mani Satellite', 'active' => 0],
            ['state_id' => 20, 'name' => 'Musawa Satellite', 'active' => 0],
            ['state_id' => 20, 'name' => 'Ingawa Satellite', 'active' => 0],

            // Jigawa State (ID: 17)
            ['state_id' => 17, 'name' => 'Hadejia New', 'active' => 0],
            ['state_id' => 17, 'name' => 'Kazaure', 'active' => 0],
            ['state_id' => 17, 'name' => 'Gumel', 'active' => 0],
            ['state_id' => 17, 'name' => 'Birnin Kudu Farm', 'active' => 0],
            ['state_id' => 17, 'name' => 'Birnin Kudu Satellite', 'active' => 0],
            ['state_id' => 17, 'name' => 'Gwaram Satellite', 'active' => 0],
            ['state_id' => 17, 'name' => 'Dutse Satellite', 'active' => 0],
            ['state_id' => 17, 'name' => 'Ringim Satellite', 'active' => 0],
            ['state_id' => 17, 'name' => 'Jahum Satellite', 'active' => 0],
            ['state_id' => 17, 'name' => 'Garki-Satellite', 'active' => 0],
            ['state_id' => 17, 'name' => 'Kiyawa satelite', 'active' => 0],

            // Kano State (ID: 19)
            ['state_id' => 19, 'name' => 'Goron Dutse', 'active' => 0],
            ['state_id' => 19, 'name' => 'Kano Central', 'active' => 1],
            ['state_id' => 19, 'name' => 'Wudil', 'active' => 0],
            ['state_id' => 19, 'name' => 'Gwarzo New Satellite', 'active' => 0],
            ['state_id' => 19, 'name' => 'Bichi Satellite', 'active' => 0],
            ['state_id' => 19, 'name' => 'Rano Satellite', 'active' => 0],
            ['state_id' => 19, 'name' => 'Tudun Wada Satellite', 'active' => 0],
            ['state_id' => 19, 'name' => 'Sumaila Satellite', 'active' => 0],
            ['state_id' => 19, 'name' => 'Kiru Satellite', 'active' => 0],
            ['state_id' => 19, 'name' => 'Dawakin Tofa Satellite', 'active' => 0],

            // Bauchi State (ID: 5)
            ['state_id' => 5, 'name' => 'Bauchi', 'active' => 0],
            ['state_id' => 5, 'name' => 'Azare', 'active' => 0],
            ['state_id' => 5, 'name' => 'Misau', 'active' => 0],
            ['state_id' => 5, 'name' => 'Ningi', 'active' => 0],
            ['state_id' => 5, 'name' => 'MSP Jama`are', 'active' => 0],
            ['state_id' => 5, 'name' => 'Alkaleri Satellite', 'active' => 0],
            ['state_id' => 5, 'name' => 'Burra Satellite', 'active' => 0],
            ['state_id' => 5, 'name' => 'Darazo Satellite', 'active' => 0],
            ['state_id' => 5, 'name' => 'Tora Satellite', 'active' => 0],
            ['state_id' => 5, 'name' => 'Gamawa Satellite', 'active' => 0],
            ['state_id' => 5, 'name' => 'Shira Satellite', 'active' => 0],
            ['state_id' => 5, 'name' => 'Tafawa Balewa Satellite', 'active' => 0],
            ['state_id' => 5, 'name' => 'Katagun Satellite', 'active' => 0],

            // Gombe State (ID: 15)
            ['state_id' => 15, 'name' => 'Gombe', 'active' => 0],
            ['state_id' => 15, 'name' => 'Tula', 'active' => 0],
            ['state_id' => 15, 'name' => 'Cham Satellite', 'active' => 0],
            ['state_id' => 15, 'name' => 'Billiri Satellite', 'active' => 0],
            ['state_id' => 15, 'name' => 'Bajoga Satellite', 'active' => 0],

            // Adamawa State (ID: 2)
            ['state_id' => 2, 'name' => 'Yola', 'active' => 0],
            ['state_id' => 2, 'name' => 'Mubi', 'active' => 0],
            ['state_id' => 2, 'name' => 'Jimeta', 'active' => 0],
            ['state_id' => 2, 'name' => 'Numan', 'active' => 0],
            ['state_id' => 2, 'name' => 'Ganye', 'active' => 0],
            ['state_id' => 2, 'name' => 'Jada', 'active' => 0],
            ['state_id' => 2, 'name' => 'Michika Satellite', 'active' => 0],
            ['state_id' => 2, 'name' => 'Gombi Satellite', 'active' => 0],
            ['state_id' => 2, 'name' => 'Hong Satellite', 'active' => 0],
            ['state_id' => 2, 'name' => 'Dumne Satellite', 'active' => 0],
            ['state_id' => 2, 'name' => 'Guyuk Satellite', 'active' => 0],
            ['state_id' => 2, 'name' => 'Kojoli Satellite', 'active' => 0],
            ['state_id' => 2, 'name' => 'Mayobelwa Satellite', 'active' => 0],
            ['state_id' => 2, 'name' => 'Shelleng Satellite', 'active' => 0],
            ['state_id' => 2, 'name' => 'Maina Satellite', 'active' => 0],
            ['state_id' => 2, 'name' => 'Gulak Saterllite', 'active' => 0],
            ['state_id' => 2, 'name' => 'Karlami Satellite', 'active' => 0],

            // Borno State (ID: 8)
            ['state_id' => 8, 'name' => 'Bama', 'active' => 0],
            ['state_id' => 8, 'name' => 'Biu', 'active' => 0],
            ['state_id' => 8, 'name' => 'New Maiduguri', 'active' => 0],
            ['state_id' => 8, 'name' => 'Gwoza', 'active' => 0],
            ['state_id' => 8, 'name' => 'Maiduguri Farm Centre', 'active' => 0],
            ['state_id' => 8, 'name' => 'Maximum Security Maiduguri', 'active' => 0],
            ['state_id' => 8, 'name' => 'Mongono Satellite', 'active' => 0],
            ['state_id' => 8, 'name' => 'Kukawa Satellite', 'active' => 0],
            ['state_id' => 8, 'name' => 'Gamboru-Ngala Satellite', 'active' => 0],
            ['state_id' => 8, 'name' => 'Kumshe Satellite', 'active' => 0],
            ['state_id' => 8, 'name' => 'Konduga Satellite', 'active' => 0],
            ['state_id' => 8, 'name' => 'Damasak Satellite', 'active' => 0],
            ['state_id' => 8, 'name' => 'Askira Satellite', 'active' => 0],
            ['state_id' => 8, 'name' => 'Shani Satellite', 'active' => 0],
            ['state_id' => 8, 'name' => 'Kwayakusar Satellite', 'active' => 0],

            // Taraba State (ID: 34)
            ['state_id' => 34, 'name' => 'Jalingo', 'active' => 0],
            ['state_id' => 34, 'name' => 'New Wukari', 'active' => 0],
            ['state_id' => 34, 'name' => 'Serti', 'active' => 0],
            ['state_id' => 34, 'name' => 'Gembu', 'active' => 0],
            ['state_id' => 34, 'name' => 'Zing Satellite', 'active' => 0],
            ['state_id' => 34, 'name' => 'Takum Satellite', 'active' => 0],
            ['state_id' => 34, 'name' => 'Baissa Satellite', 'active' => 0],
            ['state_id' => 34, 'name' => 'Bali Satellite', 'active' => 0],
            ['state_id' => 34, 'name' => 'Lau Satellite', 'active' => 0],
            ['state_id' => 34, 'name' => 'Gassol Satellite', 'active' => 0],
            ['state_id' => 34, 'name' => 'M/Biyu Satellite', 'active' => 0],
            ['state_id' => 34, 'name' => 'Karin - Lamido Satellite', 'active' => 0],

            // Yobe State (ID: 35)
            ['state_id' => 35, 'name' => 'Gashua', 'active' => 0],
            ['state_id' => 35, 'name' => 'Nguru', 'active' => 0],
            ['state_id' => 35, 'name' => 'MSP Potiskum', 'active' => 0],
            ['state_id' => 35, 'name' => 'Dapchi Satellite', 'active' => 0],
            ['state_id' => 35, 'name' => 'Damagun Satellite', 'active' => 0],
            ['state_id' => 35, 'name' => 'Geidam Satellite', 'active' => 0],
            ['state_id' => 35, 'name' => 'Damaturu Satellite', 'active' => 0],
            ['state_id' => 35, 'name' => 'Fika Satellite', 'active' => 0],

            // Niger State (ID: 26)
            ['state_id' => 26, 'name' => 'Agaie', 'active' => 0],
            ['state_id' => 26, 'name' => 'Bida', 'active' => 0],
            ['state_id' => 26, 'name' => 'MSP Kotongora', 'active' => 0],
            ['state_id' => 26, 'name' => 'MSP Minna', 'active' => 0],
            ['state_id' => 26, 'name' => 'Lapai', 'active' => 0],
            ['state_id' => 26, 'name' => 'Minna', 'active' => 0],
            ['state_id' => 26, 'name' => 'New - Bussa', 'active' => 0],
            ['state_id' => 26, 'name' => 'Kagara', 'active' => 0],

            // Kwara State (ID: 23)
            ['state_id' => 23, 'name' => 'Ilorin', 'active' => 0],
            ['state_id' => 23, 'name' => 'Ilorin new/Mandala', 'active' => 0],
            ['state_id' => 23, 'name' => 'Lafiagi', 'active' => 0],
            ['state_id' => 23, 'name' => 'MSP Omu-Aran', 'active' => 0],
            ['state_id' => 23, 'name' => 'Borstal', 'active' => 0],

            // Kebbi State (ID: 21)
            ['state_id' => 21, 'name' => 'Old Kebbi', 'active' => 0],
            ['state_id' => 21, 'name' => 'New Kebbi', 'active' => 0],
            ['state_id' => 21, 'name' => 'Argungu', 'active' => 0],
            ['state_id' => 21, 'name' => 'Zuru', 'active' => 0],
            ['state_id' => 21, 'name' => 'Yelwa Yauri', 'active' => 0],
            ['state_id' => 21, 'name' => 'Kamba Satellite', 'active' => 0],
            ['state_id' => 21, 'name' => 'Kangiwa Satellite', 'active' => 0],
            ['state_id' => 21, 'name' => 'Jega Satellite', 'active' => 0],
            ['state_id' => 21, 'name' => 'Bagundu Satellite', 'active' => 0],
            ['state_id' => 21, 'name' => 'Wara Satellite', 'active' => 0],

            // Zamfara State (ID: 36)
            ['state_id' => 36, 'name' => 'Gusau MSP', 'active' => 0],
            ['state_id' => 36, 'name' => 'Talata Mafara Sat.', 'active' => 0],
            ['state_id' => 36, 'name' => 'Maru Satellite', 'active' => 0],
            ['state_id' => 36, 'name' => 'Gumi Satellite', 'active' => 0],
            ['state_id' => 36, 'name' => 'Kaura Namoda Sat.', 'active' => 0],

            // Sokoto State (ID: 33)
            ['state_id' => 33, 'name' => 'Sokoto', 'active' => 0],
            ['state_id' => 33, 'name' => 'Farm Centre Bissalam', 'active' => 0],
            ['state_id' => 33, 'name' => 'Gwadabawa Satellite', 'active' => 0],
            ['state_id' => 33, 'name' => 'Wurno Satellite', 'active' => 0],
            ['state_id' => 33, 'name' => 'Tambuwal Satellite', 'active' => 0],

            // FCT (ID: 37)
            ['state_id' => 37, 'name' => 'Suleja', 'active' => 0],
            ['state_id' => 37, 'name' => 'Kuje', 'active' => 0],
            ['state_id' => 37, 'name' => 'Dukpa Farm center', 'active' => 0],

            // Abia State (ID: 1)
            ['state_id' => 1, 'name' => 'Aba', 'active' => 1],
            ['state_id' => 1, 'name' => 'Umuahia', 'active' => 0],
            ['state_id' => 1, 'name' => 'Arochukwu', 'active' => 0],

            // Akwa Ibom State (ID: 3)
            ['state_id' => 3, 'name' => 'Abak', 'active' => 0],
            ['state_id' => 3, 'name' => 'Eket', 'active' => 0],
            ['state_id' => 3, 'name' => 'Ikot-Abasi', 'active' => 0],
            ['state_id' => 3, 'name' => 'Ikot-Ekpene', 'active' => 0],
            ['state_id' => 3, 'name' => 'Uyo', 'active' => 0],

            // Imo State (ID: 16)
            ['state_id' => 16, 'name' => 'Owerri', 'active' => 0],
            ['state_id' => 16, 'name' => 'Okigwe', 'active' => 0],
            ['state_id' => 16, 'name' => 'Orreh Farm', 'active' => 0],

            // Cross River State (ID: 9)
            ['state_id' => 9, 'name' => 'Adim Farm', 'active' => 0],
            ['state_id' => 9, 'name' => 'Calabar', 'active' => 0],
            ['state_id' => 9, 'name' => 'Obubra', 'active' => 0],
            ['state_id' => 9, 'name' => 'Obudu', 'active' => 0],
            ['state_id' => 9, 'name' => 'Ogoja', 'active' => 0],
            ['state_id' => 9, 'name' => 'Ikom', 'active' => 0],

            // Rivers State (ID: 32)
            ['state_id' => 32, 'name' => 'Ahoada', 'active' => 0],
            ['state_id' => 32, 'name' => 'Degema', 'active' => 0],
            ['state_id' => 32, 'name' => 'Elele Farm', 'active' => 0],
            ['state_id' => 32, 'name' => 'Port-Harcourt', 'active' => 0],

            // Bayelsa State (ID: 6)
            ['state_id' => 6, 'name' => 'Okaka', 'active' => 0],

            // Oyo State (ID: 30)
            ['state_id' => 30, 'name' => 'Agodi', 'active' => 0],
            ['state_id' => 30, 'name' => 'Oyo', 'active' => 0],
            ['state_id' => 30, 'name' => 'Ogbomoso Farm', 'active' => 0],

            // Osun State (ID: 29)
            ['state_id' => 29, 'name' => 'Ile-Ife', 'active' => 0],
            ['state_id' => 29, 'name' => 'Ilesa', 'active' => 0],

            // Ondo State (ID: 28)
            ['state_id' => 28, 'name' => 'Okitipupa', 'active' => 0],
            ['state_id' => 28, 'name' => 'MSP-Ondo', 'active' => 0],
            ['state_id' => 28, 'name' => 'Owo', 'active' => 0],
            ['state_id' => 28, 'name' => 'MSP Akure', 'active' => 0],
            ['state_id' => 28, 'name' => 'Female', 'active' => 0],

            // Ekiti State (ID: 13)
            ['state_id' => 13, 'name' => 'Ado-Ekiti', 'active' => 0],

            // Anambra State (ID: 4)
            ['state_id' => 4, 'name' => 'Awka', 'active' => 0],
            ['state_id' => 4, 'name' => 'Onitsha', 'active' => 0],
            ['state_id' => 4, 'name' => 'MSP Nnewi', 'active' => 0],
            ['state_id' => 4, 'name' => 'Nnewi ', 'active' => 0],
            ['state_id' => 4, 'name' => 'Aguata', 'active' => 0],

            // Edo State (ID: 12)
            ['state_id' => 12, 'name' => 'Benin(Old)', 'active' => 0],
            ['state_id' => 12, 'name' => 'Benin(New)', 'active' => 0],
            ['state_id' => 12, 'name' => 'Ogba Farm', 'active' => 0],
            ['state_id' => 12, 'name' => 'Ozalla Farm', 'active' => 0],
            ['state_id' => 12, 'name' => 'Ubiaja', 'active' => 0],
            ['state_id' => 12, 'name' => 'Auchi', 'active' => 0],

            // Delta State (ID: 10)
            ['state_id' => 10, 'name' => 'Warri', 'active' => 0],
            ['state_id' => 10, 'name' => 'Ogwuashi-Uku', 'active' => 0],
            ['state_id' => 10, 'name' => 'Sapele', 'active' => 0],
            ['state_id' => 10, 'name' => 'Agbor', 'active' => 0],
            ['state_id' => 10, 'name' => 'Kwale', 'active' => 0],

            // Ebonyi State (ID: 11)
            ['state_id' => 11, 'name' => 'Abakaliki', 'active' => 0],
            ['state_id' => 11, 'name' => 'Afikpo', 'active' => 0],

            // Enugu State (ID: 14)
            ['state_id' => 14, 'name' => 'Enugu', 'active' => 0],
            ['state_id' => 14, 'name' => 'Ibite-Olo Farm', 'active' => 0],
            ['state_id' => 14, 'name' => 'Nsukka', 'active' => 0],
            ['state_id' => 14, 'name' => 'Oji River', 'active' => 0],

            // Benue State (ID: 7)
            ['state_id' => 7, 'name' => 'Gboko', 'active' => 0],
            ['state_id' => 7, 'name' => 'MSP Makurdi', 'active' => 0],
            ['state_id' => 7, 'name' => 'Otukpo', 'active' => 0],

            // Nasarawa State (ID: 25)
            ['state_id' => 25, 'name' => 'Lafia', 'active' => 0],
            ['state_id' => 25, 'name' => 'Wamba', 'active' => 0],
            ['state_id' => 25, 'name' => 'MSP Keffi', 'active' => 0],
            ['state_id' => 25, 'name' => 'Old keffi', 'active' => 0],
            ['state_id' => 25, 'name' => 'Nassarawa', 'active' => 0],

            // Plateau State (ID: 31)
            ['state_id' => 31, 'name' => 'Jos', 'active' => 1],
            ['state_id' => 31, 'name' => 'Jos ', 'active' => 0],
            ['state_id' => 31, 'name' => 'Lamingo Prison Camp', 'active' => 0],
            ['state_id' => 31, 'name' => 'Lakushi Farm center', 'active' => 0],
            ['state_id' => 31, 'name' => 'Pankshin', 'active' => 0],
            ['state_id' => 31, 'name' => 'Shedam', 'active' => 0],
            ['state_id' => 31, 'name' => 'Wase', 'active' => 0],
            ['state_id' => 31, 'name' => 'Langtang', 'active' => 0],

            // Kogi State (ID: 22)
            ['state_id' => 22, 'name' => 'Ankpa', 'active' => 0],
            ['state_id' => 22, 'name' => 'Dekina', 'active' => 0],
            ['state_id' => 22, 'name' => 'Idah', 'active' => 0],
            ['state_id' => 22, 'name' => 'Koton-Karfe', 'active' => 0],
            ['state_id' => 22, 'name' => 'Kabba', 'active' => 0],
            ['state_id' => 22, 'name' => 'Okene', 'active' => 0],
        ];

        // Convert to proper format and map state IDs to actual state IDs from database
        foreach ($prisons as $prison) {
            $actualStateId = $stateMapping[$prison['state_id']] ?? null;
            if ($actualStateId) {
                $prisonData[] = [
                    'state_id' => $actualStateId,
                    'prison_name' => $prison['name'],
                    'address' => '', // Empty as per SQL file
                    'capacity' => '', // No capacity set
                    'active' => $prison['active'],
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        return $prisonData;
    }

    /**
     * Map the state IDs from SQL file to actual state IDs in database
     */
    private function getStateIdMapping($states): array
    {
        // This mapping is based on the SQL file state_id patterns
        // We'll map SQL state_id to actual database state IDs
        return [
            1 => $states['Abia']->id ?? null,
            2 => $states['Adamawa']->id ?? null,
            3 => $states['Akwa Ibom']->id ?? null,
            4 => $states['Anambra']->id ?? null,
            5 => $states['Bauchi']->id ?? null,
            6 => $states['Bayelsa']->id ?? null,
            7 => $states['Benue']->id ?? null,
            8 => $states['Borno']->id ?? null,
            9 => $states['Cross River']->id ?? null,
            10 => $states['Delta']->id ?? null,
            11 => $states['Ebonyi']->id ?? null,
            12 => $states['Edo']->id ?? null,
            13 => $states['Ekiti']->id ?? null,
            14 => $states['Enugu']->id ?? null,
            15 => $states['Gombe']->id ?? null,
            16 => $states['Imo']->id ?? null,
            17 => $states['Jigawa']->id ?? null,
            18 => $states['Kaduna']->id ?? null,
            19 => $states['Kano']->id ?? null,
            20 => $states['Katsina']->id ?? null,
            21 => $states['Kebbi']->id ?? null,
            22 => $states['Kogi']->id ?? null,
            23 => $states['Kwara']->id ?? null,
            24 => $states['Lagos']->id ?? null,
            25 => $states['Nasarawa']->id ?? null,
            26 => $states['Niger']->id ?? null,
            27 => $states['Ogun']->id ?? null,
            28 => $states['Ondo']->id ?? null,
            29 => $states['Osun']->id ?? null,
            30 => $states['Oyo']->id ?? null,
            31 => $states['Plateau']->id ?? null,
            32 => $states['Rivers']->id ?? null,
            33 => $states['Sokoto']->id ?? null,
            34 => $states['Taraba']->id ?? null,
            35 => $states['Yobe']->id ?? null,
            36 => $states['Zamfara']->id ?? null,
            37 => $states['FCT']->id ?? null,
        ];
    }
}
