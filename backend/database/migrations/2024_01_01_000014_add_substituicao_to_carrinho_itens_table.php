<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adiciona campo para permitir substituição de item no carrinho.
     */
    public function up(): void
    {
        Schema::table('carrinho_itens', function (Blueprint $table) {
            $table->boolean('permite_substituicao')->default(true)->after('quantidade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carrinho_itens', function (Blueprint $table) {
            $table->dropColumn('permite_substituicao');
        });
    }
};
