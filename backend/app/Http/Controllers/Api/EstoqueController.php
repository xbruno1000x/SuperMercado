<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MovimentacaoEstoqueRequest;
use App\Models\MovimentacaoEstoque;
use App\Models\Produto;
use App\Services\EstoqueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EstoqueController extends Controller
{
    protected EstoqueService $estoqueService;

    public function __construct(EstoqueService $estoqueService)
    {
        $this->estoqueService = $estoqueService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Produto::select('id', 'nome', 'codigo_barras', 'estoque_atual', 'estoque_minimo');

        if ($request->boolean('estoque_baixo')) {
            $query->whereColumn('estoque_atual', '<=', 'estoque_minimo');
        }

        $produtos = $query->orderBy('nome')->paginate($request->get('per_page', 50));

        return response()->json($produtos);
    }

    public function movimentar(MovimentacaoEstoqueRequest $request): JsonResponse
    {
        try {
            $movimentacao = match ($request->tipo) {
                'entrada' => $this->estoqueService->entrada(
                    $request->produto_id,
                    $request->quantidade,
                    'manual',
                    null,
                    null,
                    $request->observacao
                ),
                'saida' => $this->estoqueService->saida(
                    $request->produto_id,
                    $request->quantidade,
                    'manual',
                    null,
                    null,
                    $request->observacao
                ),
                'ajuste' => $this->estoqueService->ajuste(
                    $request->produto_id,
                    $request->quantidade,
                    $request->observacao
                ),
            };

            return response()->json($movimentacao->load('produto'), 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function historico(Produto $produto): JsonResponse
    {
        $movimentacoes = $this->estoqueService->getHistorico($produto->id);

        return response()->json([
            'produto' => $produto->only('id', 'nome', 'estoque_atual'),
            'movimentacoes' => $movimentacoes,
        ]);
    }
}
