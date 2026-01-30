<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adiciona campo para permitir substituição de item caso esteja indisponível.
     */
    public function up(): void
    {
        Schema::table('pedido_itens', function (Blueprint $table) {
            $table->boolean('permite_substituicao')->default(true)->after('subtotal');
            $table->string('observacao_substituicao')->nullable()->after('permite_substituicao');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pedido_itens', function (Blueprint $table) {
            $table->dropColumn(['permite_substituicao', 'observacao_substituicao']);
        });
    }
};
