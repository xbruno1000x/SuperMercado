<?php

namespace App\Services;

use App\Models\Produto;
use App\Models\Venda;
use App\Models\VendaItem;
use Illuminate\Support\Facades\DB;

class VendaService
{
    protected EstoqueService $estoqueService;

    public function __construct(EstoqueService $estoqueService)
    {
        $this->estoqueService = $estoqueService;
    }

    public function criarVenda(
        int $usuarioId,
        array $itens,
        string $formaPagamento,
        float $desconto = 0,
        ?float $valorRecebido = null,
        ?string $observacoes = null
    ): Venda {
        return DB::transaction(function () use (
            $usuarioId,
            $itens,
            $formaPagamento,
            $desconto,
            $valorRecebido,
            $observacoes
        ) {
            $this->validarItens($itens);

            $subtotal = 0;
            $itensProcessados = [];

            foreach ($itens as $item) {
                $produto = Produto::findOrFail($item['produto_id']);

                if (!$this->estoqueService->verificarDisponibilidade($produto->id, $item['quantidade'])) {
                    throw new \Exception("Estoque insuficiente para: {$produto->nome}");
                }

                $precoUnitario = $produto->preco_final;
                $itemSubtotal = $precoUnitario * $item['quantidade'];
                $subtotal += $itemSubtotal;

                $itensProcessados[] = [
                    'produto' => $produto,
                    'quantidade' => $item['quantidade'],
                    'preco_unitario' => $precoUnitario,
                    'subtotal' => $itemSubtotal,
                ];
            }

            $total = $subtotal - $desconto;
            $troco = null;

            if ($formaPagamento === 'dinheiro' && $valorRecebido) {
                $troco = $valorRecebido - $total;
                if ($troco < 0) {
                    throw new \Exception('Valor recebido insuficiente');
                }
            }

            $venda = Venda::create([
                'usuario_id' => $usuarioId,
                'subtotal' => $subtotal,
                'desconto' => $desconto,
                'total' => $total,
                'forma_pagamento' => $formaPagamento,
                'valor_recebido' => $valorRecebido,
                'troco' => $troco,
                'observacoes' => $observacoes,
            ]);

            foreach ($itensProcessados as $itemData) {
                VendaItem::create([
                    'venda_id' => $venda->id,
                    'produto_id' => $itemData['produto']->id,
                    'produto_nome' => $itemData['produto']->nome,
                    'codigo_barras' => $itemData['produto']->codigo_barras,
                    'preco_unitario' => $itemData['preco_unitario'],
                    'quantidade' => $itemData['quantidade'],
                    'subtotal' => $itemData['subtotal'],
                ]);

                $this->estoqueService->saida(
                    $itemData['produto']->id,
                    $itemData['quantidade'],
                    'venda_caixa',
                    $venda->id,
                    Venda::class
                );
            }

            return $venda->load('itens');
        });
    }

    public function cancelarVenda(Venda $venda): Venda
    {
        return DB::transaction(function () use ($venda) {
            if ($venda->status === 'cancelada') {
                throw new \Exception('Venda já está cancelada');
            }

            foreach ($venda->itens as $item) {
                $this->estoqueService->cancelar(
                    $item->produto_id,
                    $item->quantidade,
                    'venda_caixa',
                    $venda->id,
                    Venda::class,
                    'Cancelamento da venda ' . $venda->codigo
                );
            }

            $venda->status = 'cancelada';
            $venda->save();

            return $venda;
        });
    }

    protected function validarItens(array $itens): void
    {
        if (empty($itens)) {
            throw new \Exception('Nenhum item informado');
        }

        foreach ($itens as $item) {
            if (!isset($item['produto_id']) || !isset($item['quantidade'])) {
                throw new \Exception('Dados do item inválidos');
            }

            if ($item['quantidade'] <= 0) {
                throw new \Exception('Quantidade deve ser maior que zero');
            }
        }
    }

    public function listarVendasHoje(int $usuarioId)
    {
        return Venda::hoje()
            ->doUsuario($usuarioId)
            ->with('itens')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function listarVendas(int $perPage = 15, ?string $data = null, ?int $usuarioId = null)
    {
        $query = Venda::with('itens', 'usuario');

        if ($data) {
            $query->whereDate('created_at', $data);
        }

        if ($usuarioId) {
            $query->doUsuario($usuarioId);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getResumoVendasHoje(int $usuarioId): array
    {
        $vendas = Venda::hoje()->doUsuario($usuarioId)->where('status', 'finalizada');

        return [
            'total_vendas' => $vendas->count(),
            'valor_total' => $vendas->sum('total'),
            'dinheiro' => $vendas->clone()->where('forma_pagamento', 'dinheiro')->sum('total'),
            'cartao' => $vendas->clone()->where('forma_pagamento', 'cartao')->sum('total'),
            'pix' => $vendas->clone()->where('forma_pagamento', 'pix')->sum('total'),
        ];
    }
}
