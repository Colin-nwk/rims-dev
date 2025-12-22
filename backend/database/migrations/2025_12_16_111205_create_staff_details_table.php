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
        Schema::create('staff_details', function (Blueprint $table) {
            $table->id();
            $table->string('service_no')->index();
            $table->foreign('service_no')->references('service_no')->on('staff')->onDelete('cascade');

            // PFA Info
            $table->string('pfa_name')->nullable();
            $table->string('pension_pin')->nullable();
            $table->string('ippis')->nullable();

            // Identity Info
            $table->string('nin')->nullable();

            // Personal Info
            $table->text('place_of_birth')->nullable();
            $table->text('permanent_home_address')->nullable();
            $table->text('contact_address')->nullable();

            // Physical Attributes
            $table->string('height')->nullable();
            $table->string('blood_group')->nullable();
            $table->string('genotype')->nullable();
            $table->string('complexion')->nullable();
            $table->string('hair_colour')->nullable();
            $table->boolean('is_deformed')->default(false);
            $table->text('deformity')->nullable();

            // History
            $table->boolean('is_convicted')->default(false);
            $table->text('previous_convictions')->nullable();

            // Next of Kin
            $table->string('next_of_kin_name')->nullable();
            $table->string('next_of_kin_phone')->nullable();
            $table->string('next_of_kin_relationship')->nullable();
            $table->text('next_of_kin_address')->nullable();

            // Family Info
            $table->string('marital_status')->nullable();
            $table->string('spouse_name')->nullable();
            $table->string('spouse_phone')->nullable();
            $table->integer('number_of_children')->nullable();

            // Bank Info
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('bvn')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_details');
    }
};
