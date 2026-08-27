<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('network_equipments', function (Blueprint $table) {
            $table->id();
            $table->string('local_code', 20)->nullable(); // Código local de la IE
            $table->string('institution_name', 255)->nullable(); // Nombre de la IE
            $table->string('level', 100)->nullable(); // Nivel educativo
            $table->string('description', 255); // DESCRIPCION (ej: ONU/Router GPON)
            $table->string('brand', 100); // MARCA
            $table->string('model', 100); // MODELO
            $table->string('mac_address', 50)->nullable(); // MAC
            $table->string('status', 50)->default('OPERATIVO'); // ESTADO
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Índice para búsquedas por código local
            $table->index('local_code');
            $table->index('institution_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('network_equipments');
    }
};