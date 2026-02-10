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
        Schema::table('staff', function (Blueprint $table) {
            // Drop valid for SQLite/MySQL if data loss is acceptable or handled
            // For simple structure change (string -> id), drop and recreate is clean
            $table->dropColumn(['initial_command', 'present_command']);
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->unsignedBigInteger('initial_command')->nullable()->after('command_post_date');
            $table->unsignedBigInteger('present_command')->nullable()->after('initial_command');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn(['initial_command', 'present_command']);
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->string('initial_command')->nullable()->after('command_post_date');
            $table->string('present_command')->nullable()->after('initial_command');
        });
    }
};
