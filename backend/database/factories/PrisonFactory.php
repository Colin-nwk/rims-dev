<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Prison>
 */
class PrisonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'prison_name' => $this->faker->word.' Prison',
            'state_id' => \App\Models\State::factory(), // Creates a related state
            'address' => $this->faker->address,
            'capacity' => $this->faker->numberBetween(100, 1000),
            'active' => true,
            'status' => true,
        ];
    }
}
