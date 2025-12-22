<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class StateFactory extends Factory
{
    private array $nigerianStates = [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
        'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
        'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna',
        'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
        'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
        'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
        'FCT',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'state' => $this->faker->randomElement($this->nigerianStates),
            'capital' => $this->faker->city,
            'zone_id' => \App\Models\Zone::factory(),
        ];
    }
}
