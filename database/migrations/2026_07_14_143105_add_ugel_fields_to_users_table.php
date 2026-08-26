<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'dni')) {
                $table->string('dni', 8)->unique()->nullable()->after('id');
            }
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['admin', 'executive', 'specialist', 'supervisor', 'director'])->default('director')->after('password');
            }
            if (!Schema::hasColumn('users', 'institution_id')) {
                $table->foreignId('institution_id')->nullable()->after('role')->constrained('educational_institutions')->onDelete('set null');
            }
            if (!Schema::hasColumn('users', 'digital_signature')) {
                $table->string('digital_signature')->nullable()->after('institution_id');
            }
            if (!Schema::hasColumn('users', 'pin')) {
                $table->string('pin', 4)->nullable()->after('digital_signature');
            }
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