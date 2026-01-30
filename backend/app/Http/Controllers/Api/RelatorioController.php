<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RelatorioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RelatorioController extends Controller
{
    protected RelatorioService $relatorioService;

    public function __construct(RelatorioService $relatorioService)
    {
        $this->relatorioService = $relatorioService;
    }

    /**
     * Resumo diário de vendas
     */
    public function resumoDiario(Request $request): JsonResponse
    {
        $usuarioId = $request->user()->perfil === 'admin' ? null : $request->user()->id;
        $data = $request->get('data');

        $resumo = $this->relatorioService->resumoDiario($usuarioId, $data);

        return response()->json($resumo);
    }

    /**
     * Relatório de vendas por período
     */
    public function vendasPorPeriodo(Request $request): JsonResponse
    {
        $request->validate([
            'data_inicio' => 'required|date',
            'data_fim' => 'required|date|after_or_equal:data_inicio',
        ]);

        $usuarioId = $request->user()->perfil === 'admin' ? null : $request->user()->id;

        $relatorio = $this->relatorioService->vendasPorPeriodo(
            $request->data_inicio,
            $request->data_fim,
            $usuarioId
        );

        return response()->json($relatorio);
    }

    /**
     * Produtos mais vendidos
     */
    public function produtosMaisVendidos(Request $request): JsonResponse
    {
        $limite = $request->get('limite', 10);
        $dataInicio = $request->get('data_inicio');
        $dataFim = $request->get('data_fim');

        $produtos = $this->relatorioService->produtosMaisVendidos(
            $dataInicio,
            $dataFim,
            $limite
        );

        return response()->json($produtos);
    }

    /**
     * Resumo de caixa do operador atual
     */
    public function resumoCaixa(Request $request): JsonResponse
    {
        $resumo = $this->relatorioService->resumoCaixa($request->user()->id);

        return response()->json($resumo);
    }

    /**
     * Comparativo de vendas (hoje vs ontem vs semana passada)
     */
    public function comparativo(Request $request): JsonResponse
    {
        $usuarioId = $request->user()->perfil === 'admin' ? null : $request->user()->id;
        
        $comparativo = $this->relatorioService->comparativoVendas($usuarioId);

        return response()->json($comparativo);
    }
}
