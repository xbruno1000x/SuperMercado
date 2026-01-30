<?php

namespace App\Services;

use App\Models\Venda;
use App\Models\VendaItem;
use App\Models\Pedido;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RelatorioService
{
    /**
     * Resumo diário de vendas do caixa
     */
    public function resumoDiario(?int $usuarioId = null, ?string $data = null): array
    {
        $data = $data ? Carbon::parse($data) : Carbon::today();
        
        $query = Venda::whereDate('created_at', $data)
            ->where('status', 'finalizada');
        
        if ($usuarioId) {
            $query->doUsuario($usuarioId);
        }

        $vendas = $query->get();
        
        $resumo = [
            'data' => $data->format('Y-m-d'),
            'total_vendas' => $vendas->count(),
            'valor_total' => (float) $vendas->sum('total'),
            'valor_descontos' => (float) $vendas->sum('desconto'),
            'por_forma_pagamento' => [
                'dinheiro' => (float) $vendas->where('forma_pagamento', 'dinheiro')->sum('total'),
                'cartao' => (float) $vendas->where('forma_pagamento', 'cartao')->sum('total'),
                'pix' => (float) $vendas->where('forma_pagamento', 'pix')->sum('total'),
            ],
            'ticket_medio' => $vendas->count() > 0 ? round($vendas->sum('total') / $vendas->count(), 2) : 0,
            'primeira_venda' => $vendas->min('created_at'),
            'ultima_venda' => $vendas->max('created_at'),
        ];

        return $resumo;
    }

    /**
     * Relatório de vendas por período
     */
    public function vendasPorPeriodo(string $dataInicio, string $dataFim, ?int $usuarioId = null): array
    {
        $inicio = Carbon::parse($dataInicio)->startOfDay();
        $fim = Carbon::parse($dataFim)->endOfDay();

        $query = Venda::whereBetween('created_at', [$inicio, $fim])
            ->where('status', 'finalizada');

        if ($usuarioId) {
            $query->doUsuario($usuarioId);
        }

        $vendas = $query->get();
        
        // Agrupar por dia
        $vendasPorDia = $vendas->groupBy(function ($venda) {
            return Carbon::parse($venda->created_at)->format('Y-m-d');
        })->map(function ($vendasDia) {
            return [
                'quantidade' => $vendasDia->count(),
                'total' => (float) $vendasDia->sum('total'),
            ];
        });

        return [
            'periodo' => [
                'inicio' => $inicio->format('Y-m-d'),
                'fim' => $fim->format('Y-m-d'),
            ],
            'total_vendas' => $vendas->count(),
            'valor_total' => (float) $vendas->sum('total'),
            'valor_descontos' => (float) $vendas->sum('desconto'),
            'ticket_medio' => $vendas->count() > 0 ? round($vendas->sum('total') / $vendas->count(), 2) : 0,
            'por_forma_pagamento' => [
                'dinheiro' => (float) $vendas->where('forma_pagamento', 'dinheiro')->sum('total'),
                'cartao' => (float) $vendas->where('forma_pagamento', 'cartao')->sum('total'),
                'pix' => (float) $vendas->where('forma_pagamento', 'pix')->sum('total'),
            ],
            'por_dia' => $vendasPorDia,
        ];
    }

    /**
     * Produtos mais vendidos
     */
    public function produtosMaisVendidos(?string $dataInicio = null, ?string $dataFim = null, int $limite = 10): array
    {
        $query = VendaItem::join('vendas', 'venda_itens.venda_id', '=', 'vendas.id')
            ->where('vendas.status', 'finalizada')
            ->select(
                'venda_itens.produto_id',
                'venda_itens.produto_nome',
                DB::raw('SUM(venda_itens.quantidade) as quantidade_total'),
                DB::raw('SUM(venda_itens.subtotal) as valor_total')
            )
            ->groupBy('venda_itens.produto_id', 'venda_itens.produto_nome');

        if ($dataInicio && $dataFim) {
            $inicio = Carbon::parse($dataInicio)->startOfDay();
            $fim = Carbon::parse($dataFim)->endOfDay();
            $query->whereBetween('vendas.created_at', [$inicio, $fim]);
        }

        $produtos = $query->orderByDesc('quantidade_total')
            ->limit($limite)
            ->get();

        return $produtos->map(function ($item) {
            return [
                'produto_id' => $item->produto_id,
                'produto_nome' => $item->produto_nome,
                'quantidade' => (int) $item->quantidade_total,
                'valor_total' => (float) $item->valor_total,
            ];
        })->toArray();
    }

    /**
     * Resumo de caixa (abertura/fechamento)
     */
    public function resumoCaixa(int $usuarioId): array
    {
        $hoje = Carbon::today();
        
        $vendas = Venda::whereDate('created_at', $hoje)
            ->doUsuario($usuarioId)
            ->where('status', 'finalizada')
            ->get();

        $canceladas = Venda::whereDate('created_at', $hoje)
            ->doUsuario($usuarioId)
            ->where('status', 'cancelada')
            ->count();

        return [
            'data' => $hoje->format('Y-m-d'),
            'operador' => $usuarioId,
            'vendas_realizadas' => $vendas->count(),
            'vendas_canceladas' => $canceladas,
            'subtotal' => (float) $vendas->sum('subtotal'),
            'descontos' => (float) $vendas->sum('desconto'),
            'total_liquido' => (float) $vendas->sum('total'),
            'formas_pagamento' => [
                'dinheiro' => [
                    'quantidade' => $vendas->where('forma_pagamento', 'dinheiro')->count(),
                    'valor' => (float) $vendas->where('forma_pagamento', 'dinheiro')->sum('total'),
                ],
                'cartao' => [
                    'quantidade' => $vendas->where('forma_pagamento', 'cartao')->count(),
                    'valor' => (float) $vendas->where('forma_pagamento', 'cartao')->sum('total'),
                ],
                'pix' => [
                    'quantidade' => $vendas->where('forma_pagamento', 'pix')->count(),
                    'valor' => (float) $vendas->where('forma_pagamento', 'pix')->sum('total'),
                ],
            ],
            'primeira_venda' => $vendas->min('created_at'),
            'ultima_venda' => $vendas->max('created_at'),
        ];
    }

    /**
     * Comparativo de vendas (hoje vs ontem vs semana passada)
     */
    public function comparativoVendas(?int $usuarioId = null): array
    {
        $hoje = Carbon::today();
        $ontem = Carbon::yesterday();
        $semanaPassada = Carbon::today()->subWeek();

        $calcularResumo = function ($data) use ($usuarioId) {
            $query = Venda::whereDate('created_at', $data)
                ->where('status', 'finalizada');
            
            if ($usuarioId) {
                $query->doUsuario($usuarioId);
            }

            return [
                'quantidade' => $query->count(),
                'total' => (float) $query->sum('total'),
            ];
        };

        return [
            'hoje' => $calcularResumo($hoje),
            'ontem' => $calcularResumo($ontem),
            'semana_passada' => $calcularResumo($semanaPassada),
        ];
    }
}
