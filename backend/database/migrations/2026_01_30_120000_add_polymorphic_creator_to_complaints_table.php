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
        Schema::table('complaints', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['created_by']);

            // Add the polymorphic type column
            $table->string('created_by_type')->after('created_by')->default('App\\Models\\Staff');

            // Add index for polymorphic relationship
            $table->index(['created_by', 'created_by_type']);
        });

        // Update existing records to have the correct type
        \App\Models\Complaint::query()->update(['created_by_type' => 'App\\Models\\Staff']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropIndex(['created_by', 'created_by_type']);
            $table->dropColumn('created_by_type');
            $table->foreign('created_by')->references('id')->on('staff')->onDelete('cascade');
        });
    }
};
