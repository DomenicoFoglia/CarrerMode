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
        Schema::create('application_tag', function (Blueprint $table) {
            $table->foreignId('application_id')->constrained()->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            //Chiave primaria coomposta(impedisce di collegare lo stesso tag alla stessa 
            //candidatura piu' di una volta)
            $table->primary(['application_id','tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_tag');
    }
};
