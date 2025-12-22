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
            $table->index('state_of_origin');
            $table->index('sex');
            $table->index('present_rank');
            $table->index('level');
            $table->index('department');
            $table->index('date_of_first_appointment');
            $table->index(['state_of_origin', 'date_of_first_appointment'], 'staff_origin_appointment_idx');
            $table->index(['assigned_state', 'date_of_first_appointment'], 'staff_assigned_appointment_idx');
        });

        Schema::table('staff_details', function (Blueprint $table) {
            $table->index('marital_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropIndex(['state_of_origin']);
            $table->dropIndex(['sex']);
            $table->dropIndex(['present_rank']);
            $table->dropIndex(['level']);
            $table->dropIndex(['department']);
            $table->dropIndex(['date_of_first_appointment']);
            $table->dropIndex('staff_origin_appointment_idx');
            $table->dropIndex('staff_assigned_appointment_idx');
        });

        Schema::table('staff_details', function (Blueprint $table) {
            $table->dropIndex(['marital_status']);
        });
    }
};
