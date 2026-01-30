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
            $table->string('next_of_kin2_name')->nullable()->after('next_of_kin_address');
            $table->string('next_of_kin2_phone')->nullable()->after('next_of_kin2_name');
            $table->string('next_of_kin2_relationship')->nullable()->after('next_of_kin2_phone');
            $table->text('next_of_kin2_address')->nullable()->after('next_of_kin2_relationship');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff_details', function (Blueprint $table) {
            $table->dropColumn([
                'next_of_kin2_name',
                'next_of_kin2_phone',
                'next_of_kin2_relationship',
                'next_of_kin2_address',
            ]);
        });
    }
};
