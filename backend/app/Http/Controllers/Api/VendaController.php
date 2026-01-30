<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VendaRequest;
use App\Models\Venda;
use App\Services\VendaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendaController extends Controller
{
    protected VendaService $vendaService;

    public function __construct(VendaService $vendaService)
    {
        $this->vendaService = $vendaService;
    }

    public function index(Request $request): JsonResponse
    {
        $vendas = $this->vendaService->listarVendas(
            $request->get('per_page', 20),
            $request->get('data'),
            $request->get('usuario_id')
        );

        return response()->json($vendas);
    }

    public function store(VendaRequest $request): JsonResponse
    {
        try {
            $venda = $this->vendaService->criarVenda(
                $request->user()->id,
                $request->itens,
                $request->forma_pagamento,
                $request->get('desconto', 0),
                $request->valor_recebido,
                $request->observacoes
            );

            return response()->json($venda, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function show(Venda $venda): JsonResponse
    {
        return response()->json($venda->load('itens', 'usuario'));
    }

    public function cancelar(Venda $venda): JsonResponse
    {
        try {
            $venda = $this->vendaService->cancelarVenda($venda);

            return response()->json($venda);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function hoje(Request $request): JsonResponse
    {
        $vendas = $this->vendaService->listarVendasHoje($request->user()->id);

        return response()->json($vendas);
    }

    public function resumo(Request $request): JsonResponse
    {
        $resumo = $this->vendaService->getResumoVendasHoje($request->user()->id);

        return response()->json($resumo);
    }
}
