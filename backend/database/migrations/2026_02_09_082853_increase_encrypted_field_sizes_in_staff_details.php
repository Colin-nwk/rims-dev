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
        Schema::table('staff_details', function (Blueprint $table) {
            // Increase sizes for encrypted fields
            $table->text('pfa_name')->nullable()->change();
            $table->text('pension_pin')->nullable()->change();
            $table->text('ippis')->nullable()->change();
            $table->text('nin')->nullable()->change();
            $table->text('bvn')->nullable()->change();
            $table->text('contact_address')->nullable()->change();
            $table->text('permanent_home_address')->nullable()->change();
            $table->text('next_of_kin_phone')->nullable()->change();
            $table->text('next_of_kin2_phone')->nullable()->change();
            $table->text('spouse_phone')->nullable()->change();
            $table->text('bank_name')->nullable()->change();
            $table->text('account_number')->nullable()->change();
            $table->text('account_name')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff_details', function (Blueprint $table) {
            // Revert to original sizes
            $table->string('pfa_name')->nullable()->change();
            $table->string('pension_pin')->nullable()->change();
            $table->string('ippis')->nullable()->change();
            $table->string('nin')->nullable()->change();
            $table->string('bvn')->nullable()->change();
            $table->text('contact_address')->nullable()->change();
            $table->text('permanent_home_address')->nullable()->change();
            $table->string('next_of_kin_phone')->nullable()->change();
            $table->string('next_of_kin2_phone')->nullable()->change();
            $table->string('spouse_phone')->nullable()->change();
            $table->string('bank_name')->nullable()->change();
            $table->string('account_number')->nullable()->change();
            $table->string('account_name')->nullable()->change();
        });
    }
};
