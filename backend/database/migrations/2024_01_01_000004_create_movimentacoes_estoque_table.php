<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimentacoes_estoque', function (Blueprint $table) {
            $table->id();
            $table->foreignId('produto_id')->constrained('produtos')->onDelete('restrict');
            $table->enum('tipo', ['entrada', 'saida', 'ajuste', 'cancelamento']);
            $table->integer('quantidade');
            $table->enum('origem', ['pedido_app', 'venda_caixa', 'manual']);
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->string('referencia_tipo')->nullable();
            $table->text('observacao')->nullable();
            $table->foreignId('usuario_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['produto_id', 'created_at']);
            $table->index(['referencia_id', 'referencia_tipo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimentacoes_estoque');
    }
};
