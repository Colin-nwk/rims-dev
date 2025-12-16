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
        Schema::create('staff_education', function (Blueprint $table) {
            $table->id();
            $table->string('service_no')->index();
            $table->foreign('service_no')->references('service_no')->on('staff')->onDelete('cascade');
            $table->string('institution');
            $table->string('course')->nullable();
            $table->string('type'); // e.g., Primary, Secondary, Bachelors
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_education');
    }
};
