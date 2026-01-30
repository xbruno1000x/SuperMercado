<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProdutoRequest;
use App\Models\Produto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Produto::with('categoria');

        if ($request->boolean('apenas_ativos', true)) {
            $query->ativo();
        }

        if ($request->has('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->has('busca')) {
            $query->busca($request->busca);
        }

        if ($request->boolean('com_estoque')) {
            $query->comEstoque();
        }

        $produtos = $query->orderBy('nome')->paginate($request->get('per_page', 20));

        return response()->json($produtos);
    }

    public function store(ProdutoRequest $request): JsonResponse
    {
        $produto = Produto::create($request->validated());

        return response()->json($produto->load('categoria'), 201);
    }

    public function show(Produto $produto): JsonResponse
    {
        return response()->json($produto->load('categoria'));
    }

    public function update(ProdutoRequest $request, Produto $produto): JsonResponse
    {
        $produto->update($request->validated());

        return response()->json($produto->load('categoria'));
    }

    public function destroy(Produto $produto): JsonResponse
    {
        $produto->update(['ativo' => false]);

        return response()->json(null, 204);
    }

    public function buscar(Request $request): JsonResponse
    {
        $termo = $request->get('termo', $request->get('q', ''));

        $produtos = Produto::ativo()
            ->comEstoque()
            ->busca($termo)
            ->with('categoria')
            ->limit(20)
            ->get();

        return response()->json($produtos);
    }

    public function porCodigoBarras(string $codigo): JsonResponse
    {
        $produto = Produto::ativo()
            ->where('codigo_barras', $codigo)
            ->with('categoria')
            ->first();

        if (!$produto) {
            return response()->json([
                'message' => 'Produto não encontrado',
            ], 404);
        }

        return response()->json($produto);
    }
}
