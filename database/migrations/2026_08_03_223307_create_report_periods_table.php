<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_periods', function (Blueprint $table) {
            $table->id();
            $table->integer('month'); // 1-12
            $table->integer('year'); // 2024, 2025, etc.
            $table->date('start_date'); // Fecha de inicio del período
            $table->date('end_date'); // Fecha de fin del período
            $table->boolean('is_active')->default(true);
            $table->text('message')->nullable();
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
            
            // Índices únicos por mes/año
            $table->unique(['month', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_periods');
    }
};