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
            $table->string('modular_code', 10)->unique();
            $table->string('name', 150);
            $table->string('district', 100);
            $table->string('populated_center', 100)->nullable();
            
            // Relación con proveedores. 'set null' protege a la I.E. si un proveedor es eliminado.
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