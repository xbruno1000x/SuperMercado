<?php

namespace App\Services;

use App\Models\Carrinho;
use App\Models\CarrinhoItem;
use App\Models\Produto;
use Illuminate\Support\Facades\DB;

class CarrinhoService
{
    public function getOuCriarCarrinho(int $userId): Carrinho
    {
        return Carrinho::firstOrCreate(['user_id' => $userId]);
    }

    public function adicionarItem(int $userId, int $produtoId, int $quantidade = 1): Carrinho
    {
        return DB::transaction(function () use ($userId, $produtoId, $quantidade) {
            $carrinho = $this->getOuCriarCarrinho($userId);
            $produto = Produto::ativo()->findOrFail($produtoId);

            $item = CarrinhoItem::where('carrinho_id', $carrinho->id)
                ->where('produto_id', $produtoId)
                ->first();

            $novaQuantidade = $item ? $item->quantidade + $quantidade : $quantidade;

            if ($novaQuantidade > $produto->estoque_atual) {
                throw new \Exception('Quantidade excede o estoque disponível');
            }

            if ($item) {
                $item->update(['quantidade' => $novaQuantidade]);
            } else {
                CarrinhoItem::create([
                    'carrinho_id' => $carrinho->id,
                    'produto_id' => $produtoId,
                    'quantidade' => $quantidade,
                ]);
            }

            return $carrinho->load('itens.produto');
        });
    }

    public function atualizarQuantidade(int $userId, int $produtoId, int $quantidade): Carrinho
    {
        return DB::transaction(function () use ($userId, $produtoId, $quantidade) {
            $carrinho = $this->getOuCriarCarrinho($userId);
            $produto = Produto::findOrFail($produtoId);

            if ($quantidade > $produto->estoque_atual) {
                throw new \Exception('Quantidade excede o estoque disponível');
            }

            if ($quantidade <= 0) {
                return $this->removerItem($userId, $produtoId);
            }

            CarrinhoItem::where('carrinho_id', $carrinho->id)
                ->where('produto_id', $produtoId)
                ->update(['quantidade' => $quantidade]);

            return $carrinho->load('itens.produto');
        });
    }

    public function removerItem(int $userId, int $produtoId): Carrinho
    {
        $carrinho = $this->getOuCriarCarrinho($userId);

        CarrinhoItem::where('carrinho_id', $carrinho->id)
            ->where('produto_id', $produtoId)
            ->delete();

        return $carrinho->load('itens.produto');
    }

    public function limparCarrinho(int $userId): Carrinho
    {
        $carrinho = $this->getOuCriarCarrinho($userId);
        $carrinho->itens()->delete();

        return $carrinho->load('itens.produto');
    }

    public function atualizarSubstituicao(int $userId, int $produtoId, bool $permiteSubstituicao): Carrinho
    {
        $carrinho = $this->getOuCriarCarrinho($userId);

        CarrinhoItem::where('carrinho_id', $carrinho->id)
            ->where('produto_id', $produtoId)
            ->update(['permite_substituicao' => $permiteSubstituicao]);

        return $carrinho->load('itens.produto');
    }

    public function getCarrinho(int $userId): Carrinho
    {
        $carrinho = $this->getOuCriarCarrinho($userId);
        return $carrinho->load('itens.produto');
    }
}
