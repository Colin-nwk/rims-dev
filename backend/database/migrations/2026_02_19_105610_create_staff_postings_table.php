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
        Schema::create('staff_postings', function (Blueprint $table) {
            $table->id();
            $table->string('service_no');
            $table->string('type'); // e.g., 'farm_center', 'training_school', 'other'
            $table->string('station_name'); // Name of the farm center, training school, etc.
            $table->string('station_location')->nullable(); // Physical location/address
            $table->date('start_date'); // Duration start
            $table->date('end_date')->nullable(); // Duration end (nullable for ongoing postings)
            $table->string('status')->default('active'); // active, completed, terminated
            $table->text('reason')->nullable(); // Reason for posting
            $table->text('remarks')->nullable(); // Additional remarks
            $table->unsignedBigInteger('created_by')->nullable(); // ID of user who created the posting
            $table->timestamps();

            // Indexes for better query performance
            $table->index('service_no');
            $table->index('type');
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_postings');
    }
};
