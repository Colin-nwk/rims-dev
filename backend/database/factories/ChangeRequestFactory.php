<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChangeRequest>
 */
class ChangeRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'model_type' => 'App\Models\Staff',
            'model_id' => null,
            'service_no' => $this->faker->regexify('[A-Z]{3}[0-9]{3}'),
            'type' => 'CREATE',
            'data' => [],
            'status' => 'PENDING',
            'requested_by_id' => null,
            'requested_by_type' => null,
        ];
    }
}
