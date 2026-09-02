<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('educational_institutions', function (Blueprint $table) {
            $table->id();
            $table->string('modular_code', 10)->nullable(); // ✅ Ahora permite NULL
            $table->string('name', 150)->nullable(); // ✅ Ahora permite NULL
            $table->string('district', 100)->nullable(); // ✅ Ahora permite NULL
            $table->string('populated_center', 100)->nullable();
            
            // Relación con proveedores
            $table->foreignId('current_provider_id')
                  ->nullable()
                  ->constrained('providers')
                  ->onDelete('set null');
                  
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('educational_institutions');
    }
};