<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Staff>
 */
class StaffFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nigerianStates = [
            'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
            'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
            'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
            'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
            'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
            'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
            'FCT',
        ];

        $lgas = [
            'Aba North', 'Aba South', 'Ikeja', 'Surulere', 'Yaba', 'Apapa',
            'Mushin', 'Alimosho', 'Oshodi-Isolo', 'Kosofe', 'Ikorodu',
            'Enugu North', 'Enugu South', 'Nsukka', 'Udi', 'Awka North',
            'Awka South', 'Onitsha North', 'Onitsha South', 'Owerri Municipal',
            'Owerri North', 'Port Harcourt', 'Obio-Akpor', 'Eleme', 'Ikwerre',
            'Kaduna North', 'Kaduna South', 'Zaria', 'Kano Municipal', 'Gwale',
            'Tarauni', 'Kumbotso', 'Jos North', 'Jos South', 'Abuja Municipal',
        ];

        return [
            'service_no' => $this->faker->unique()->regexify('[A-Z]{3}[0-9]{5}'),
            'email' => $this->faker->unique()->safeEmail(),
            'password' => 'password',
            'surname' => $this->faker->lastName(),
            'first_name' => $this->faker->firstName(),
            'other_names' => $this->faker->firstName(),
            'sex' => $this->faker->randomElement(['Male', 'Female']),
            'initial_rank' => $this->faker->word(),
            'present_rank' => $this->faker->word(),
            'level' => $this->faker->numberBetween(1, 17), // Changed to integer
            'dob' => $this->faker->date(),
            'date_of_first_appointment' => $this->faker->date(),
            'state_of_origin' => $this->faker->randomElement($nigerianStates),
            'lga' => $this->faker->randomElement($lgas),
            'department' => $this->faker->word(),
            'file_no' => $this->faker->bothify('FILE-####'),
            'duty' => $this->faker->jobTitle(),
            'description' => $this->faker->sentence(),
            'status' => 1,
            'assigned_state' => null,
            'prison' => null,
            'zone_id' => null,
            'initial_command' => null,
            'present_command' => null,
        ];
    }
}
