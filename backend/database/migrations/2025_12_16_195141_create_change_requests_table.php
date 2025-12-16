<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('change_requests', function (Blueprint $table) {
            $table->id();
            $table->string('model_type'); // App\Models\Staff
            $table->unsignedBigInteger('model_id')->nullable(); // Null for CREATE
            $table->string('service_no')->nullable(); // Reference
            $table->string('type'); // CREATE, UPDATE
            $table->json('data');
            $table->string('status')->default('PENDING'); // PENDING, APPROVED, REJECTED
            $table->nullableMorphs('requested_by'); // User or Staff who requested
            $table->foreignId('approved_by')->nullable()->constrained('users'); // User who approved
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('change_requests');
    }
};
