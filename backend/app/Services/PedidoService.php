<?php

namespace App\Services;

use App\Models\Carrinho;
use App\Models\CarrinhoItem;
use App\Models\Endereco;
use App\Models\Pedido;
use App\Models\PedidoItem;
use App\Models\Produto;
use Illuminate\Support\Facades\DB;

class PedidoService
{
    protected EstoqueService $estoqueService;

    public function __construct(EstoqueService $estoqueService)
    {
        $this->estoqueService = $estoqueService;
    }

    public function criarPedido(
        int $userId,
        int $enderecoId,
        string $formaPagamento,
        ?float $trocoPara = null,
        ?string $observacoes = null,
        float $taxaEntrega = 0
    ): Pedido {
        return DB::transaction(function () use (
            $userId,
            $enderecoId,
            $formaPagamento,
            $trocoPara,
            $observacoes,
            $taxaEntrega
        ) {
            $carrinho = Carrinho::where('user_id', $userId)
                ->with('itens.produto')
                ->firstOrFail();

            if ($carrinho->itens->isEmpty()) {
                throw new \Exception('Carrinho vazio');
            }

            $this->validarEstoqueItens($carrinho->itens);

            $subtotal = $carrinho->total;
            $total = $subtotal + $taxaEntrega;

            $pedido = Pedido::create([
                'user_id' => $userId,
                'endereco_id' => $enderecoId,
                'status' => Pedido::STATUS_CRIADO,
                'subtotal' => $subtotal,
                'taxa_entrega' => $taxaEntrega,
                'total' => $total,
                'forma_pagamento' => $formaPagamento,
                'troco_para' => $trocoPara,
                'observacoes' => $observacoes,
            ]);

            foreach ($carrinho->itens as $item) {
                PedidoItem::create([
                    'pedido_id' => $pedido->id,
                    'produto_id' => $item->produto_id,
                    'produto_nome' => $item->produto->nome,
                    'preco_unitario' => $item->produto->preco_final,
                    'quantidade' => $item->quantidade,
                    'subtotal' => $item->subtotal,
                    'permite_substituicao' => $item->permite_substituicao ?? true,
                ]);
            }

            $carrinho->itens()->delete();

            return $pedido->load('itens', 'endereco');
        });
    }

    public function atualizarStatus(Pedido $pedido, string $novoStatus): Pedido
    {
        return DB::transaction(function () use ($pedido, $novoStatus) {
            $statusAnterior = $pedido->status;

            // Dar baixa no estoque quando iniciar a separação
            if ($novoStatus === Pedido::STATUS_EM_SEPARACAO && $statusAnterior === Pedido::STATUS_CRIADO) {
                $this->processarBaixaEstoque($pedido);
            }

            // Estornar estoque se cancelar um pedido que já teve baixa
            if ($novoStatus === Pedido::STATUS_CANCELADO && 
                in_array($statusAnterior, [Pedido::STATUS_EM_SEPARACAO, Pedido::STATUS_PRONTO, Pedido::STATUS_CANCELAMENTO_SOLICITADO])) {
                $this->estornarEstoque($pedido);
            }

            if ($novoStatus === Pedido::STATUS_ENTREGUE) {
                $pedido->data_entrega = now();
            }

            $pedido->status = $novoStatus;
            $pedido->save();

            return $pedido;
        });
    }

    protected function validarEstoqueItens($itens): void
    {
        foreach ($itens as $item) {
            if (!$this->estoqueService->verificarDisponibilidade($item->produto_id, $item->quantidade)) {
                throw new \Exception("Estoque insuficiente para o produto: {$item->produto->nome}");
            }
        }
    }

    protected function processarBaixaEstoque(Pedido $pedido): void
    {
        foreach ($pedido->itens as $item) {
            $this->estoqueService->saida(
                $item->produto_id,
                $item->quantidade,
                'pedido_app',
                $pedido->id,
                Pedido::class
            );
        }
    }

    protected function estornarEstoque(Pedido $pedido): void
    {
        foreach ($pedido->itens as $item) {
            $this->estoqueService->cancelar(
                $item->produto_id,
                $item->quantidade,
                'pedido_app',
                $pedido->id,
                Pedido::class,
                'Cancelamento do pedido ' . $pedido->codigo
            );
        }
    }

    public function listarPedidosCliente(int $userId, int $perPage = 15)
    {
        return Pedido::where('user_id', $userId)
            ->with('itens')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getPedido(int $pedidoId, ?int $userId = null): Pedido
    {
        $query = Pedido::with(['itens.produto', 'endereco']);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->findOrFail($pedidoId);
    }

    public function adicionarItens(Pedido $pedido, array $itens): Pedido
    {
        return DB::transaction(function () use ($pedido, $itens) {
            $subtotalAdicional = 0;

            foreach ($itens as $item) {
                $produto = Produto::findOrFail($item['produto_id']);
                
                // Verificar disponibilidade no estoque
                if (!$this->estoqueService->verificarDisponibilidade($produto->id, $item['quantidade'])) {
                    throw new \Exception("Estoque insuficiente para o produto: {$produto->nome}");
                }

                $precoUnitario = $produto->preco_final;
                $subtotal = $precoUnitario * $item['quantidade'];

                // Verifica se o produto já existe no pedido
                $itemExistente = $pedido->itens()->where('produto_id', $produto->id)->first();

                if ($itemExistente) {
                    $itemExistente->quantidade += $item['quantidade'];
                    $itemExistente->subtotal = $itemExistente->preco_unitario * $itemExistente->quantidade;
                    $itemExistente->save();
                    $subtotalAdicional += $precoUnitario * $item['quantidade'];
                } else {
                    PedidoItem::create([
                        'pedido_id' => $pedido->id,
                        'produto_id' => $produto->id,
                        'produto_nome' => $produto->nome,
                        'preco_unitario' => $precoUnitario,
                        'quantidade' => $item['quantidade'],
                        'subtotal' => $subtotal,
                    ]);
                    $subtotalAdicional += $subtotal;
                }
            }

            // Atualiza os totais do pedido
            $pedido->subtotal += $subtotalAdicional;
            $pedido->total = $pedido->subtotal + $pedido->taxa_entrega - ($pedido->desconto ?? 0);
            $pedido->save();

            return $pedido->load('itens', 'endereco');
        });
    }
}
