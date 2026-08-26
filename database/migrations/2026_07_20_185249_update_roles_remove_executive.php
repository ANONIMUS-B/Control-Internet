<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ✅ Eliminar executive del ENUM
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'specialist' , 'director') DEFAULT 'director'");
    }

    public function down(): void
    {
        // ✅ Revertir cambios
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'specialist', 'director', 'executive') DEFAULT 'director'");
    }
};