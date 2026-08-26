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
        Schema::table('users', function (Blueprint $table) {
            // Campo para la firma digital (ruta de la imagen)
            $table->string('signature_path')->nullable()->after('digital_signature');
            
            // Campo para saber si la firma está activa
            $table->boolean('signature_active')->default(false)->after('signature_path');
            
            // Fecha de actualización de la firma
            $table->timestamp('signature_updated_at')->nullable()->after('signature_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
             $table->dropColumn(['signature_path', 'signature_active', 'signature_updated_at']);
        });
    }
};
