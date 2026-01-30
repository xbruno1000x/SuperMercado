<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarrinhoController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\EnderecoController;
use App\Http\Controllers\Api\EstoqueController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\ProdutoController;
use App\Http\Controllers\Api\RelatorioController;
use App\Http\Controllers\Api\VendaController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::put('perfil', [AuthController::class, 'atualizarPerfil']);
        Route::put('senha', [AuthController::class, 'alterarSenha']);
    });
});

Route::get('categorias', [CategoriaController::class, 'index']);
Route::get('categorias/{categoria}', [CategoriaController::class, 'show']);

Route::get('produtos', [ProdutoController::class, 'index']);
Route::get('produtos/busca', [ProdutoController::class, 'buscar']);
Route::get('produtos/buscar', [ProdutoController::class, 'buscar']);
Route::get('produtos/codigo-barras/{codigo}', [ProdutoController::class, 'porCodigoBarras']);
Route::get('produtos/{produto}', [ProdutoController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {

    Route::middleware('perfil:admin')->group(function () {
        Route::post('categorias', [CategoriaController::class, 'store']);
        Route::put('categorias/{categoria}', [CategoriaController::class, 'update']);
        Route::delete('categorias/{categoria}', [CategoriaController::class, 'destroy']);

        Route::post('produtos', [ProdutoController::class, 'store']);
        Route::put('produtos/{produto}', [ProdutoController::class, 'update']);
        Route::delete('produtos/{produto}', [ProdutoController::class, 'destroy']);

        Route::get('estoque', [EstoqueController::class, 'index']);
        Route::post('estoque/movimentar', [EstoqueController::class, 'movimentar']);
        Route::get('estoque/{produto}/historico', [EstoqueController::class, 'historico']);

        Route::get('pedidos/todos', [PedidoController::class, 'listarTodos']);
        Route::patch('pedidos/{pedido}/status', [PedidoController::class, 'atualizarStatus']);
    });

    Route::middleware('perfil:cliente,admin')->group(function () {
        Route::get('carrinho', [CarrinhoController::class, 'index']);
        Route::post('carrinho/adicionar', [CarrinhoController::class, 'adicionar']);
        Route::put('carrinho/atualizar', [CarrinhoController::class, 'atualizar']);
        Route::put('carrinho/substituicao', [CarrinhoController::class, 'atualizarSubstituicao']);
        Route::delete('carrinho/remover/{produtoId}', [CarrinhoController::class, 'remover']);
        Route::delete('carrinho/limpar', [CarrinhoController::class, 'limpar']);

        Route::get('enderecos', [EnderecoController::class, 'index']);
        Route::post('enderecos', [EnderecoController::class, 'store']);
        Route::get('enderecos/{endereco}', [EnderecoController::class, 'show']);
        Route::put('enderecos/{endereco}', [EnderecoController::class, 'update']);
        Route::delete('enderecos/{endereco}', [EnderecoController::class, 'destroy']);
        Route::patch('enderecos/{endereco}/principal', [EnderecoController::class, 'definirPrincipal']);

        Route::get('pedidos', [PedidoController::class, 'index']);
        Route::post('pedidos', [PedidoController::class, 'store']);
        Route::get('pedidos/{id}', [PedidoController::class, 'show']);
        Route::post('pedidos/{id}/solicitar-cancelamento', [PedidoController::class, 'solicitarCancelamento']);
        Route::post('pedidos/{id}/adicionar-itens', [PedidoController::class, 'adicionarItens']);
    });

    Route::middleware('perfil:caixa,admin')->group(function () {
        Route::get('vendas', [VendaController::class, 'index']);
        Route::post('vendas', [VendaController::class, 'store']);
        Route::get('vendas/hoje', [VendaController::class, 'hoje']);
        Route::get('vendas/resumo', [VendaController::class, 'resumo']);
        Route::get('vendas/{venda}', [VendaController::class, 'show']);
        Route::post('vendas/{venda}/cancelar', [VendaController::class, 'cancelar']);

        // Relatórios
        Route::prefix('relatorios')->group(function () {
            Route::get('resumo-diario', [RelatorioController::class, 'resumoDiario']);
            Route::get('vendas-periodo', [RelatorioController::class, 'vendasPorPeriodo']);
            Route::get('produtos-mais-vendidos', [RelatorioController::class, 'produtosMaisVendidos']);
            Route::get('resumo-caixa', [RelatorioController::class, 'resumoCaixa']);
            Route::get('comparativo', [RelatorioController::class, 'comparativo']);
        });
    });
});
