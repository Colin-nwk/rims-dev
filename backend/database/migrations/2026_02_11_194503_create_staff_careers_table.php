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
        Schema::create('staff_careers', function (Blueprint $table) {
            $table->id();
            $table->string('service_no');
            $table->string('field_changed'); // 'rank' or 'command'
            $table->string('old_value')->nullable();
            $table->string('new_value');
            $table->timestamp('effective_date')->nullable(); // Date when the change took effect
            $table->text('reason')->nullable(); // Reason for the change
            $table->unsignedBigInteger('changed_by')->nullable(); // ID of user who made the change
            $table->timestamps();
            
            // Foreign key constraint for staff
            $table->foreign('service_no')->references('service_no')->on('staff')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_careers');
    }
};
