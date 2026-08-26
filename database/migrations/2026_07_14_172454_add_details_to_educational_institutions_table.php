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
        Schema::table('educational_institutions', function (Blueprint $table) {
           // Agregar columnas faltantes
            $table->string('local_code', 20)->nullable();
        $table->string('level', 50)->nullable(); // nullable para que no rompa los antiguos
        $table->string('type_management', 100)->nullable();
        $table->string('department', 100)->default('Huánuco');
        $table->string('province', 100)->default('Ambo');
        $table->string('ugel', 100)->default('UGEL Ambo');
        $table->string('address', 255)->nullable();
            // NOTA: is_active ya existe, no la agregues de nuevo
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('educational_institutions', function (Blueprint $table) {
            //
        });
    }
};
