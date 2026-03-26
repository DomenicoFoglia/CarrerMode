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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('company');
            $table->string('role');
            $table->longText('offer_text')->nullable();
            $table->string('url')->nullable();
            $table->string('source')->nullable();
            $table->string('contract_type')->nullable();
            $table->string('location')->nullable();
            $table->string('salary_range')->nullable();
            $table->enum('status', ['sent', 'interview', 'waiting', 'rejected', 'draft'])->default('sent');
            $table->tinyInteger('interest_rating')->nullable();
            $table->tinyInteger('match_score')->nullable();
            $table->text('notes')->nullable();
            $table->date('applied_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
