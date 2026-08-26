<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institution_id')->constrained('educational_institutions');
            $table->foreignId('user_id')->constrained('users'); // Validado con la tabla users por defecto
            
            $table->integer('month'); // 1 al 12
            $table->integer('year');
            $table->string('office_number', 50)->nullable(); // Nro correlativo ingresado por el director
            
            $table->enum('status', ['pending', 'observed', 'approved', 'rejected'])->default('pending');
            $table->enum('service_state', ['operative', 'intermittent', 'no_service']);
            $table->text('notes')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_reports');
    }
};