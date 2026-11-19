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
        Schema::table('staff_documents', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn('verified_by');
            $table->nullableMorphs('verifier');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff_documents', function (Blueprint $table) {
            $table->dropMorphs('verifier');
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }
};
