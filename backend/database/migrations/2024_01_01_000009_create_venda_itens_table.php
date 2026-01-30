<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('venda_itens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venda_id')->constrained('vendas')->onDelete('cascade');
            $table->foreignId('produto_id')->constrained('produtos')->onDelete('restrict');
            $table->string('produto_nome');
            $table->string('codigo_barras')->nullable();
            $table->decimal('preco_unitario', 10, 2);
            $table->integer('quantidade');
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();

            $table->index('venda_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('venda_itens');
    }
};
