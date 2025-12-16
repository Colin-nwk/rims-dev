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
