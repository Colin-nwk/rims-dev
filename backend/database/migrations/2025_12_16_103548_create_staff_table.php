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
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('service_no')->unique();
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->unsignedBigInteger('assigned_state')->nullable();
            $table->unsignedBigInteger('prison')->nullable();
            $table->string('surname')->nullable();
            $table->string('first_name')->nullable();
            $table->string('other_names')->nullable();
            $table->string('sex')->nullable();
            $table->string('initial_rank')->nullable();
            $table->string('present_rank')->nullable();
            $table->string('level')->nullable();
            $table->date('dob')->nullable();
            $table->date('date_of_first_appointment')->nullable();
            $table->string('state_of_origin')->nullable();
            $table->string('lga')->nullable();
            $table->string('department')->nullable();
            $table->string('file_no')->nullable();
            $table->string('duty')->nullable();
            $table->longText('description')->nullable();
            $table->text('photo')->nullable();
            $table->timestamp('last_login')->nullable();
            $table->integer('status');
            $table->unsignedBigInteger('zone_id')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
