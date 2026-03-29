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
            $table->unsignedBigInteger('work_distribution_id')->nullable()->after('department');
            $table->unsignedBigInteger('training_institute_id')->nullable()->after('work_distribution_id');
            $table->unsignedBigInteger('directorate_id')->nullable()->after('training_institute_id');
            $table->unsignedBigInteger('staff_status_id')->nullable()->after('directorate_id');

            $table->index('work_distribution_id');
            $table->index('training_institute_id');
            $table->index('directorate_id');
            $table->index('staff_status_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropIndex(['work_distribution_id']);
            $table->dropIndex(['training_institute_id']);
            $table->dropIndex(['directorate_id']);
            $table->dropIndex(['staff_status_id']);

            $table->dropColumn([
                'work_distribution_id',
                'training_institute_id',
                'directorate_id',
                'staff_status_id',
            ]);
        });
    }
};
