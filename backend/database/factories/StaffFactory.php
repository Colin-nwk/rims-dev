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
            'level' => $this->faker->bothify('GL-##'),
            'dob' => $this->faker->date(),
            'date_of_first_appointment' => $this->faker->date(),
            'state_of_origin' => $this->faker->state(),
            'lga' => $this->faker->city(),
            'department' => $this->faker->word(),
            'file_no' => $this->faker->bothify('FILE-####'),
            'duty' => $this->faker->jobTitle(),
            'description' => $this->faker->sentence(),
            'status' => 1,
        ];
    }
}
