<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Adiciona suporte para unidades de peso (kg/g) com fator de conversão.
     * - nome_unidade: Nome descritivo da unidade (ex: "quilograma", "grama", "unidade")
     * - fator_unidade: Fator de conversão para a unidade base (kg = 1, g = 0.001)
     */
    public function up(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->string('nome_unidade', 50)->nullable()->after('unidade');
            $table->decimal('fator_unidade', 10, 6)->default(1)->after('nome_unidade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('produtos', function (Blueprint $table) {
            $table->dropColumn(['nome_unidade', 'fator_unidade']);
        });
    }
};
