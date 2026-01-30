<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('restrict');
            $table->string('codigo', 20)->unique();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('desconto', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->enum('forma_pagamento', ['dinheiro', 'cartao', 'pix']);
            $table->decimal('valor_recebido', 10, 2)->nullable();
            $table->decimal('troco', 10, 2)->nullable();
            $table->enum('status', ['finalizada', 'cancelada'])->default('finalizada');
            $table->text('observacoes')->nullable();
            $table->timestamps();

            $table->index(['usuario_id', 'created_at']);
            $table->index('codigo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendas');
    }
};
