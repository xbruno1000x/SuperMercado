<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CarrinhoItemRequest;
use App\Services\CarrinhoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarrinhoController extends Controller
{
    protected CarrinhoService $carrinhoService;

    public function __construct(CarrinhoService $carrinhoService)
    {
        $this->carrinhoService = $carrinhoService;
    }

    public function index(Request $request): JsonResponse
    {
        $carrinho = $this->carrinhoService->getCarrinho($request->user()->id);

        return response()->json([
            'carrinho' => $carrinho,
            'total' => $carrinho->total,
            'quantidade_total' => $carrinho->quantidade_total,
        ]);
    }

    public function adicionar(CarrinhoItemRequest $request): JsonResponse
    {
        try {
            $carrinho = $this->carrinhoService->adicionarItem(
                $request->user()->id,
                $request->produto_id,
                $request->get('quantidade', 1)
            );

            return response()->json([
                'carrinho' => $carrinho,
                'total' => $carrinho->total,
                'quantidade_total' => $carrinho->quantidade_total,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function atualizar(CarrinhoItemRequest $request): JsonResponse
    {
        try {
            $carrinho = $this->carrinhoService->atualizarQuantidade(
                $request->user()->id,
                $request->produto_id,
                $request->quantidade
            );

            return response()->json([
                'carrinho' => $carrinho,
                'total' => $carrinho->total,
                'quantidade_total' => $carrinho->quantidade_total,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function remover(Request $request, int $produtoId): JsonResponse
    {
        $carrinho = $this->carrinhoService->removerItem($request->user()->id, $produtoId);

        return response()->json([
            'carrinho' => $carrinho,
            'total' => $carrinho->total,
            'quantidade_total' => $carrinho->quantidade_total,
        ]);
    }

    public function limpar(Request $request): JsonResponse
    {
        $carrinho = $this->carrinhoService->limparCarrinho($request->user()->id);

        return response()->json([
            'carrinho' => $carrinho,
            'total' => 0,
            'quantidade_total' => 0,
        ]);
    }

    public function atualizarSubstituicao(Request $request): JsonResponse
    {
        $request->validate([
            'produto_id' => 'required|exists:produtos,id',
            'permite_substituicao' => 'required|boolean',
        ]);

        try {
            $carrinho = $this->carrinhoService->atualizarSubstituicao(
                $request->user()->id,
                $request->produto_id,
                $request->permite_substituicao
            );

            return response()->json([
                'carrinho' => $carrinho,
                'total' => $carrinho->total,
                'quantidade_total' => $carrinho->quantidade_total,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
