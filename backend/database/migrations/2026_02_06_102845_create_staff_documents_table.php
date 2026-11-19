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
        Schema::create('staff_documents', function (Blueprint $table) {
            $table->id();
            $table->string('service_no')->index();
            $table->foreign('service_no')->references('service_no')->on('staff')->onDelete('cascade');
            $table->string('document_type'); // birth_certificate, confirmation_certificate, national_id, passport, etc.
            $table->string('document_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->string('verification_status')->default('pending'); // pending, verified, rejected
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->date('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_documents');
    }
};
