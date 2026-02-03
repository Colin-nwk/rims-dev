<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\LGA;
use App\Models\State;

class LGASeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get state IDs for mapping
        $states = State::all()->keyBy('state');

        $lgaData = $this->getLGAData($states);

        // Truncate table to avoid duplicates
        DB::table('lga')->truncate();

        // Insert LGAs in chunks for better performance
        $chunks = array_chunk($lgaData, 100);
        foreach ($chunks as $chunk) {
            LGA::insert($chunk);
        }

        $this->command->info('✅ All 774 LGAs seeded successfully!');
    }

    /**
     * Get all 774 LGAs in Nigeria with correct state mappings
     */
    private function getLGAData($states): array
    {
        $now = now();
        $lgaData = [];

        // ABIA STATE LGAs
        $abiaStateId = $states['Abia']->id ?? null;
        if ($abiaStateId) {
            $abiaLGAs = [
                'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North',
                'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma',
                'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'
            ];
            foreach ($abiaLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $abiaStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // ADAMAWA STATE LGAs
        $adamawaStateId = $states['Adamawa']->id ?? null;
        if ($adamawaStateId) {
            $adamawaLGAs = [
                'Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada',
                'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North',
                'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'
            ];
            foreach ($adamawaLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $adamawaStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // AKWA IBOM STATE LGAs
        $akwaIbomStateId = $states['Akwa Ibom']->id ?? null;
        if ($akwaIbomStateId) {
            $akwaIbomLGAs = [
                'Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo',
                'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono',
                'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin',
                'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo', 'Onna',
                'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'
            ];
            foreach ($akwaIbomLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $akwaIbomStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // ANAMBRA STATE LGAs
        $anambraStateId = $states['Anambra']->id ?? null;
        if ($anambraStateId) {
            $anambraLGAs = [
                'Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South',
                'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala',
                'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South',
                'Orumba North', 'Orumba South', 'Oyi'
            ];
            foreach ($anambraLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $anambraStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // BAUCHI STATE LGAs
        $bauchiStateId = $states['Bauchi']->id ?? null;
        if ($bauchiStateId) {
            $bauchiLGAs = [
                'Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa',
                'Ganjuwa', 'Giade', 'Itas/Gadau', 'Jama\'are', 'Katagum', 'Kirfi',
                'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'
            ];
            foreach ($bauchiLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $bauchiStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // BAYELSA STATE LGAs
        $bayelsaStateId = $states['Bayelsa']->id ?? null;
        if ($bayelsaStateId) {
            $bayelsaLGAs = [
                'Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'
            ];
            foreach ($bayelsaLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $bayelsaStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // BENUE STATE LGAs
        $benueStateId = $states['Benue']->id ?? null;
        if ($benueStateId) {
            $benueLGAs = [
                'Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West',
                'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo',
                'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'
            ];
            foreach ($benueLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $benueStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // BORNO STATE LGAs
        $bornoStateId = $states['Borno']->id ?? null;
        if ($bornoStateId) {
            $bornoLGAs = [
                'Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa',
                'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge',
                'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri',
                'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'
            ];
            foreach ($bornoLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $bornoStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // CROSS RIVER STATE LGAs
        $crossRiverStateId = $states['Cross River']->id ?? null;
        if ($crossRiverStateId) {
            $crossRiverLGAs = [
                'Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki',
                'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku',
                'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakoko', 'Yala'
            ];
            foreach ($crossRiverLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $crossRiverStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // DELTA STATE LGAs
        $deltaStateId = $states['Delta']->id ?? null;
        if ($deltaStateId) {
            $deltaLGAs = [
                'Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West',
                'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East',
                'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani',
                'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North',
                'Warri South', 'Warri South West'
            ];
            foreach ($deltaLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $deltaStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // EBONYI STATE LGAs
        $ebonyiStateId = $states['Ebonyi']->id ?? null;
        if ($ebonyiStateId) {
            $ebonyiLGAs = [
                'Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South',
                'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'
            ];
            foreach ($ebonyiLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $ebonyiStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // EDO STATE LGAs
        $edoStateId = $states['Edo']->id ?? null;
        if ($edoStateId) {
            $edoLGAs = [
                'Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East',
                'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben',
                'Ikpoba Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West',
                'Owan East', 'Owan West', 'Uhunmwonde'
            ];
            foreach ($edoLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $edoStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // EKITI STATE LGAs
        $ekitiStateId = $states['Ekiti']->id ?? null;
        if ($ekitiStateId) {
            $ekitiLGAs = [
                'Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West',
                'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje',
                'Irepodun/Ifelodun', 'Ise/Orun', 'Moba', 'Oye'
            ];
            foreach ($ekitiLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $ekitiStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // ENUGU STATE LGAs
        $enuguStateId = $states['Enugu']->id ?? null;
        if ($enuguStateId) {
            $enuguLGAs = [
                'Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu',
                'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East',
                'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'
            ];
            foreach ($enuguLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $enuguStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // FCT (ABUJA) AREA COUNCILS
        $fctStateId = $states['FCT']->id ?? null;
        if ($fctStateId) {
            $fctLGAs = [
                'Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Municipal Area Council', 'Kwali'
            ];
            foreach ($fctLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $fctStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // GOMBE STATE LGAs
        $gombeStateId = $states['Gombe']->id ?? null;
        if ($gombeStateId) {
            $gombeLGAs = [
                'Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo',
                'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'
            ];
            foreach ($gombeLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $gombeStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // IMO STATE LGAs
        $imoStateId = $states['Imo']->id ?? null;
        if ($imoStateId) {
            $imoLGAs = [
                'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North',
                'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli',
                'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema',
                'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal',
                'Owerri North', 'Owerri West', 'Unuimo'
            ];
            foreach ($imoLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $imoStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // JIGAWA STATE LGAs
        $jigawaStateId = $states['Jigawa']->id ?? null;
        if ($jigawaStateId) {
            $jigawaLGAs = [
                'Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa',
                'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa',
                'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Kaugama', 'Maigatari', 'Malam Madori',
                'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'
            ];
            foreach ($jigawaLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $jigawaStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // KADUNA STATE LGAs
        $kadunaStateId = $states['Kaduna']->id ?? null;
        if ($kadunaStateId) {
            $kadunaLGAs = [
                'Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a',
                'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura',
                'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga',
                'Soba', 'Zangon Kataf', 'Zaria'
            ];
            foreach ($kadunaLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $kadunaStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // KANO STATE LGAs
        $kanoStateId = $states['Kano']->id ?? null;
        if ($kanoStateId) {
            $kanoLGAs = [
                'Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta',
                'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko',
                'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal',
                'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi',
                'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono',
                'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo',
                'Warawa', 'Wudil'
            ];
            foreach ($kanoLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $kanoStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // KATSINA STATE LGAs
        $katsinaStateId = $states['Katsina']->id ?? null;
        if ($katsinaStateId) {
            $katsinaLGAs = [
                'Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume',
                'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua',
                'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina',
                'Kurfi', 'Kusada', 'Mai\'Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu',
                'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'
            ];
            foreach ($katsinaLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $katsinaStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // KEBBI STATE LGAs
        $kebbiStateId = $states['Kebbi']->id ?? null;
        if ($kebbiStateId) {
            $kebbiLGAs = [
                'Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi',
                'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse',
                'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'
            ];
            foreach ($kebbiLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $kebbiStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // KOGI STATE LGAs
        $kogiStateId = $states['Kogi']->id ?? null;
        if ($kogiStateId) {
            $kogiLGAs = [
                'Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah',
                'Igalamela Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa Muro',
                'Ofu', 'Ogori/Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'
            ];
            foreach ($kogiLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $kogiStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // KWARA STATE LGAs
        $kwaraStateId = $states['Kwara']->id ?? null;
        if ($kwaraStateId) {
            $kwaraLGAs = [
                'Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South',
                'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero',
                'Oyun', 'Pategi'
            ];
            foreach ($kwaraLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $kwaraStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // LAGOS STATE LGAs
        $lagosStateId = $states['Lagos']->id ?? null;
        if ($lagosStateId) {
            $lagosLGAs = [
                'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry',
                'Epe', 'Eti Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu',
                'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo',
                'Shomolu', 'Surulere'
            ];
            foreach ($lagosLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $lagosStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // NASARAWA STATE LGAs
        $nasarawaStateId = $states['Nasarawa']->id ?? null;
        if ($nasarawaStateId) {
            $nasarawaLGAs = [
                'Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia',
                'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'
            ];
            foreach ($nasarawaLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $nasarawaStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // NIGER STATE LGAs
        $nigerStateId = $states['Niger']->id ?? null;
        if ($nigerStateId) {
            $nigerLGAs = [
                'Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako',
                'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga',
                'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro',
                'Suleja', 'Tafa', 'Wushishi'
            ];
            foreach ($nigerLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $nigerStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // OGUN STATE LGAs
        $ogunStateId = $states['Ogun']->id ?? null;
        if ($ogunStateId) {
            $ogunLGAs = [
                'Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South',
                'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode',
                'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu',
                'Ogun Waterside', 'Remo North', 'Shagamu'
            ];
            foreach ($ogunLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $ogunStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // ONDO STATE LGAs
        $ondoStateId = $states['Ondo']->id ?? null;
        if ($ondoStateId) {
            $ondoLGAs = [
                'Akoko North-East', 'Akoko North-West', 'Akoko South-West', 'Akoko South-East',
                'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje',
                'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West',
                'Ose', 'Owo'
            ];
            foreach ($ondoLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $ondoStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // OSUN STATE LGAs
        $osunStateId = $states['Osun']->id ?? null;
        if ($osunStateId) {
            $osunLGAs = [
                'Atakunmosa East', 'Atakunmosa West', 'Aiyedaade', 'Aiyedire', 'Boluwaduro',
                'Boripe', 'Ede North', 'Ede South', 'Ife Central', 'Ife East', 'Ife North',
                'Ife South', 'Egbedore', 'Ejigbo', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East',
                'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin',
                'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'
            ];
            foreach ($osunLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $osunStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // OYO STATE LGAs
        $oyoStateId = $states['Oyo']->id ?? null;
        if ($oyoStateId) {
            $oyoLGAs = [
                'Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North',
                'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West',
                'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin',
                'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomoso North', 'Ogbomoso South',
                'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire',
                'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'
            ];
            foreach ($oyoLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $oyoStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // PLATEAU STATE LGAs
        $plateauStateId = $states['Plateau']->id ?? null;
        if ($plateauStateId) {
            $plateauLGAs = [
                'Barkin Ladi', 'Bassa', 'Jos East', 'Jos North', 'Jos South', 'Kanam',
                'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin',
                'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase', 'Bokkos'
            ];
            foreach ($plateauLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $plateauStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // RIVERS STATE LGAs
        $riversStateId = $states['Rivers']->id ?? null;
        if ($riversStateId) {
            $riversLGAs = [
                'Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru',
                'Bonny', 'Degema', 'Eleme', 'Emuoha', 'Etche', 'Gokana', 'Ikwerre', 'Khana',
                'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro',
                'Oyigbo', 'Port Harcourt', 'Tai'
            ];
            foreach ($riversLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $riversStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // SOKOTO STATE LGAs
        $sokotoStateId = $states['Sokoto']->id ?? null;
        if ($sokotoStateId) {
            $sokotoLGAs = [
                'Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa',
                'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari',
                'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta',
                'Wamako', 'Wurno', 'Yabo'
            ];
            foreach ($sokotoLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $sokotoStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // TARABA STATE LGAs
        $tarabaStateId = $states['Taraba']->id ?? null;
        if ($tarabaStateId) {
            $tarabaLGAs = [
                'Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo',
                'Karim Lamido', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari',
                'Yorro', 'Zing'
            ];
            foreach ($tarabaLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $tarabaStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // YOBE STATE LGAs
        $yobeStateId = $states['Yobe']->id ?? null;
        if ($yobeStateId) {
            $yobeLGAs = [
                'Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba',
                'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru',
                'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'
            ];
            foreach ($yobeLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $yobeStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        // ZAMFARA STATE LGAs
        $zamfaraStateId = $states['Zamfara']->id ?? null;
        if ($zamfaraStateId) {
            $zamfaraLGAs = [
                'Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi',
                'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara',
                'Chafe', 'Zurmi'
            ];
            foreach ($zamfaraLGAs as $lga) {
                $lgaData[] = [
                    'state_id' => $zamfaraStateId,
                    'lga' => $lga,
                    'status' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        return $lgaData;
    }
}