<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StaffDocument>
 */
class StaffDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'service_no' => fn () => \App\Models\Staff::factory()->create()->service_no,
            'document_type' => $this->faker->randomElement([
                'birth_certificate',
                'confirmation_certificate',
                'national_id',
                'passport',
                'appointment_letter',
                'promotion_letter',
                'transfer_letter',
            ]),
            'document_name' => $this->faker->sentence(3),
            'file_path' => 'staff/documents/'.$this->faker->uuid().'.pdf',
            'file_size' => $this->faker->numberBetween(10000, 5000000),
            'mime_type' => $this->faker->randomElement(['application/pdf', 'image/jpeg', 'image/png']),
            'verification_status' => 'pending',
            'notes' => $this->faker->optional()->sentence(),
            'expires_at' => $this->faker->optional()->dateTimeBetween('now', '+5 years'),
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'verified',
            'verified_at' => now(),
            'verifier_id' => \App\Models\User::factory(),
            'verifier_type' => \App\Models\User::class,
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'verification_status' => 'rejected',
            'rejection_reason' => $this->faker->sentence(),
            'verifier_id' => \App\Models\User::factory(),
            'verifier_type' => \App\Models\User::class,
        ]);
    }
}
