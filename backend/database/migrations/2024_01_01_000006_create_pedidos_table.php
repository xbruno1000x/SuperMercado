<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('endereco_id')->nullable()->constrained('enderecos')->onDelete('set null');
            $table->string('codigo', 20)->unique();
            $table->enum('status', [
                'criado',
                'pago',
                'em_separacao',
                'pronto',
                'entregue',
                'cancelado'
            ])->default('criado');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('taxa_entrega', 10, 2)->default(0);
            $table->decimal('desconto', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->enum('forma_pagamento', ['dinheiro', 'cartao', 'pix'])->nullable();
            $table->decimal('troco_para', 10, 2)->nullable();
            $table->text('observacoes')->nullable();
            $table->timestamp('data_pagamento')->nullable();
            $table->timestamp('data_entrega')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('codigo');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pedidos');
    }
};
