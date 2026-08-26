<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Documento de identidad usado para el login seguro[cite: 1]
            $table->string('dni', 8)->unique()->after('id')->nullable(); 
            
            // Roles extraídos de los perfiles de usuario[cite: 1]
            $table->enum('role', ['admin', 'executive', 'specialist', 'supervisor', 'director'])->default('director')->after('password');
            
            // Relación con la institución (solo aplicable a rol 'director')
            $table->foreignId('institution_id')->nullable()->after('role')->constrained('educational_institutions')->onDelete('set null');
            
            // Firma digitalizada para el Acta de Conformidad[cite: 1]
            $table->string('digital_signature')->nullable()->after('institution_id');
            $table->string('pin', 4)->nullable()->after('digital_signature');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['institution_id']);
            $table->dropColumn(['dni', 'role', 'institution_id', 'digital_signature', 'pin']);
        });
    }
};