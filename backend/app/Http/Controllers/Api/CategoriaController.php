<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoriaRequest;
use App\Models\Categoria;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Categoria::query();

        if ($request->boolean('apenas_ativos', true)) {
            $query->ativo();
        }

        $categorias = $query->orderBy('ordem')->orderBy('nome')->get();

        return response()->json($categorias);
    }

    public function store(CategoriaRequest $request): JsonResponse
    {
        $categoria = Categoria::create($request->validated());

        return response()->json($categoria, 201);
    }

    public function show(Categoria $categoria): JsonResponse
    {
        return response()->json($categoria);
    }

    public function update(CategoriaRequest $request, Categoria $categoria): JsonResponse
    {
        $categoria->update($request->validated());

        return response()->json($categoria);
    }

    public function destroy(Categoria $categoria): JsonResponse
    {
        if ($categoria->produtos()->exists()) {
            return response()->json([
                'message' => 'Não é possível excluir categoria com produtos',
            ], 422);
        }

        $categoria->delete();

        return response()->json(null, 204);
    }
}
