<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StaffEducation>
 */
class StaffEducationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'institution' => $this->faker->city() . ' University',
            'course' => $this->faker->jobTitle(),
            'type' => $this->faker->randomElement(['Primary', 'Secondary', 'Bachelors', 'Masters', 'PhD', 'Certification']),
            'start_date' => $this->faker->date(),
            'end_date' => $this->faker->date(),
            'url' => $this->faker->imageUrl(),
        ];
    }
}
