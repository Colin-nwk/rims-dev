<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Complaint>
 */
class ComplaintFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'subject' => $this->faker->sentence(6),
            'category' => $this->faker->randomElement(['Payroll', 'Leave', 'Workplace', 'IT', 'Other']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'critical']),
            'status' => 'open',
            'created_by' => \App\Models\Staff::factory(),
            'created_by_type' => \App\Models\Staff::class,
        ];
    }
}
