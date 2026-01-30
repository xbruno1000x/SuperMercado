<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('produtos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('categoria_id')->constrained('categorias')->onDelete('restrict');
            $table->string('nome');
            $table->string('slug')->unique();
            $table->text('descricao')->nullable();
            $table->string('codigo_barras', 50)->nullable()->unique();
            $table->decimal('preco', 10, 2);
            $table->decimal('preco_promocional', 10, 2)->nullable();
            $table->string('unidade', 20)->default('un');
            $table->string('imagem')->nullable();
            $table->integer('estoque_atual')->default(0);
            $table->integer('estoque_minimo')->default(0);
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            $table->index('codigo_barras');
            $table->index('nome');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('produtos');
    }
};
