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
        Schema::table('staff_postings', function (Blueprint $table) {
            // Add polymorphic creator columns
            $table->string('created_by_type')->nullable()->after('created_by');
            $table->unsignedBigInteger('created_by_id')->nullable()->after('created_by_type');

            // Add index for polymorphic relationship
            $table->index(['created_by_type', 'created_by_id']);
        });

        // Migrate existing data - assume all existing created_by are User IDs
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff_postings', function (Blueprint $table) {
            $table->dropIndex(['created_by_type', 'created_by_id']);
            $table->dropColumn(['created_by_type', 'created_by_id']);
        });
    }
};
