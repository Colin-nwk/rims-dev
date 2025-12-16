<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StaffDetail>
 */
class StaffDetailFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'pfa_name' => $this->faker->company(),
            'pension_pin' => $this->faker->numerify('PEN#########'),
            'ippis' => $this->faker->numerify('#####'),
            'next_of_kin_name' => $this->faker->name(),
            'next_of_kin_phone' => $this->faker->phoneNumber(),
            'next_of_kin_relationship' => $this->faker->randomElement(['Spouse', 'Brother', 'Sister', 'Father', 'Mother']),
            'next_of_kin_address' => $this->faker->address(),
            'marital_status' => $this->faker->randomElement(['Single', 'Married', 'Divorced']),
            'spouse_name' => $this->faker->name(),
            'spouse_phone' => $this->faker->phoneNumber(),
            'number_of_children' => $this->faker->numberBetween(0, 5),
            'bank_name' => $this->faker->company() . ' Bank',
            'account_name' => $this->faker->name(),
            'account_number' => $this->faker->numerify('##########'),
        ];
    }
}
