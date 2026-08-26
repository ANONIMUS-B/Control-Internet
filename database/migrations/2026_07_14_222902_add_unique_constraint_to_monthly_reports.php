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
        Schema::table('monthly_reports', function (Blueprint $table) {
              // Índice único: una IE solo puede tener un reporte por mes/año
            $table->unique(['institution_id', 'month', 'year'], 'unique_report_per_month_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('monthly_reports', function (Blueprint $table) {
             $table->dropUnique('unique_report_per_month_year');
        });
    }
};
