<?php

namespace App\Services;

use App\Models\MovimentacaoEstoque;
use App\Models\Produto;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EstoqueService
{
    public function entrada(
        int $produtoId,
        int $quantidade,
        string $origem = 'manual',
        ?int $referenciaId = null,
        ?string $referenciaTipo = null,
        ?string $observacao = null
    ): MovimentacaoEstoque {
        return $this->registrarMovimentacao(
            $produtoId,
            'entrada',
            $quantidade,
            $origem,
            $referenciaId,
            $referenciaTipo,
            $observacao
        );
    }

    public function saida(
        int $produtoId,
        int $quantidade,
        string $origem = 'manual',
        ?int $referenciaId = null,
        ?string $referenciaTipo = null,
        ?string $observacao = null
    ): MovimentacaoEstoque {
        return $this->registrarMovimentacao(
            $produtoId,
            'saida',
            $quantidade,
            $origem,
            $referenciaId,
            $referenciaTipo,
            $observacao
        );
    }

    public function ajuste(
        int $produtoId,
        int $quantidade,
        ?string $observacao = null
    ): MovimentacaoEstoque {
        $produto = Produto::findOrFail($produtoId);
        $diferenca = $quantidade - $produto->estoque_atual;

        return $this->registrarMovimentacaoAjuste(
            $produtoId,
            $quantidade,  // Passa a quantidade final desejada
            $diferenca,   // Passa a diferença
            'manual',
            null,
            null,
            $observacao
        );
    }

    public function cancelar(
        int $produtoId,
        int $quantidade,
        string $origem,
        ?int $referenciaId = null,
        ?string $referenciaTipo = null,
        ?string $observacao = null
    ): MovimentacaoEstoque {
        return $this->registrarMovimentacao(
            $produtoId,
            'cancelamento',
            $quantidade,
            $origem,
            $referenciaId,
            $referenciaTipo,
            $observacao
        );
    }

    protected function registrarMovimentacaoAjuste(
        int $produtoId,
        int $quantidadeFinal,
        int $diferenca,
        string $origem,
        ?int $referenciaId,
        ?string $referenciaTipo,
        ?string $observacao
    ): MovimentacaoEstoque {
        return DB::transaction(function () use (
            $produtoId,
            $quantidadeFinal,
            $diferenca,
            $origem,
            $referenciaId,
            $referenciaTipo,
            $observacao
        ) {
            $produto = Produto::lockForUpdate()->findOrFail($produtoId);

            $movimentacao = MovimentacaoEstoque::create([
                'produto_id' => $produtoId,
                'tipo' => 'ajuste',
                'quantidade' => abs($diferenca),
                'origem' => $origem,
                'referencia_id' => $referenciaId,
                'referencia_tipo' => $referenciaTipo,
                'observacao' => $observacao,
                'usuario_id' => Auth::id(),
            ]);

            // Define diretamente a quantidade final desejada
            $produto->update(['estoque_atual' => max(0, $quantidadeFinal)]);

            return $movimentacao;
        });
    }

    protected function registrarMovimentacao(
        int $produtoId,
        string $tipo,
        int $quantidade,
        string $origem,
        ?int $referenciaId,
        ?string $referenciaTipo,
        ?string $observacao
    ): MovimentacaoEstoque {
        return DB::transaction(function () use (
            $produtoId,
            $tipo,
            $quantidade,
            $origem,
            $referenciaId,
            $referenciaTipo,
            $observacao
        ) {
            $produto = Produto::lockForUpdate()->findOrFail($produtoId);

            $movimentacao = MovimentacaoEstoque::create([
                'produto_id' => $produtoId,
                'tipo' => $tipo,
                'quantidade' => $quantidade,
                'origem' => $origem,
                'referencia_id' => $referenciaId,
                'referencia_tipo' => $referenciaTipo,
                'observacao' => $observacao,
                'usuario_id' => Auth::id(),
            ]);

            $this->atualizarEstoqueCache($produto, $tipo, $quantidade);

            return $movimentacao;
        });
    }

    protected function atualizarEstoqueCache(Produto $produto, string $tipo, int $quantidade): void
    {
        $novoEstoque = match ($tipo) {
            'entrada', 'cancelamento' => $produto->estoque_atual + $quantidade,
            'saida' => $produto->estoque_atual - $quantidade,
            default => $produto->estoque_atual + $quantidade,
        };

        $produto->update(['estoque_atual' => max(0, $novoEstoque)]);
    }

    public function verificarDisponibilidade(int $produtoId, int $quantidade): bool
    {
        $produto = Produto::find($produtoId);
        return $produto && $produto->estoque_atual >= $quantidade;
    }

    public function getHistorico(int $produtoId, int $limit = 50)
    {
        return MovimentacaoEstoque::where('produto_id', $produtoId)
            ->with('usuario')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
