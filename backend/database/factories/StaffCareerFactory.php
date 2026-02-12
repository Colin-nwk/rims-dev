<?php

namespace Database\Factories;

use App\Models\Staff;
use App\Models\StaffCareer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StaffCareer>
 */
class StaffCareerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'service_no' => Staff::factory(),
            'field_changed' => $this->faker->randomElement(['present_rank', 'present_command']),
            'old_value' => $this->faker->word,
            'new_value' => $this->faker->word,
            'effective_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'reason' => $this->faker->sentence,
            'changed_by' => $this->faker->numberBetween(1, 10),
        ];
    }
}
