<?php

namespace Database\Factories;

use App\Models\Staff;
use App\Models\StaffPosting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StaffPosting>
 */
class StaffPostingFactory extends Factory
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
            'type' => $this->faker->randomElement(['farm_center', 'training_school', 'other']),
            'station_name' => $this->faker->company.' '.$this->faker->randomElement(['Center', 'School', 'Facility', 'Station']),
            'station_location' => $this->faker->address,
            'start_date' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'end_date' => null,
            'status' => 'active',
            'reason' => $this->faker->sentence,
            'remarks' => $this->faker->optional()->sentence,
            'created_by_type' => null,
            'created_by_id' => null,
        ];
    }

    /**
     * Indicate that the posting is for a farm center.
     */
    public function farmCenter(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'farm_center',
            'station_name' => $this->faker->company.' Farm Center',
        ]);
    }

    /**
     * Indicate that the posting is for a training school.
     */
    public function trainingSchool(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'training_school',
            'station_name' => $this->faker->company.' Training School',
        ]);
    }

    /**
     * Indicate that the posting is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'end_date' => null,
        ]);
    }

    /**
     * Indicate that the posting is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'end_date' => $this->faker->dateTimeBetween('-1 month', '+1 month'),
        ]);
    }

    /**
     * Indicate that the posting is terminated.
     */
    public function terminated(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'terminated',
            'end_date' => $this->faker->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    /**
     * Indicate that the posting has an end date.
     */
    public function withEndDate(): static
    {
        return $this->state(fn (array $attributes) => [
            'end_date' => $this->faker->dateTimeBetween('+1 month', '+1 year'),
        ]);
    }

    /**
     * Set the creator of the posting (polymorphic).
     */
    public function createdBy($creator): static
    {
        return $this->state(fn (array $attributes) => [
            'created_by_type' => get_class($creator),
            'created_by_id' => $creator->id,
        ]);
    }
}
