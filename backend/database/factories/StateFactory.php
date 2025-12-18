<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class StateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'state' => $this->faker->state,
            'capital' => $this->faker->city,
            'zone_id' => \App\Models\Zone::factory(),
        ];
    }
}
