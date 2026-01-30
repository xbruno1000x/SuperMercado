<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarrinhoItem extends Model
{
    use HasFactory;

    protected $table = 'carrinho_itens';

    protected $fillable = [
        'carrinho_id',
        'produto_id',
        'quantidade',
        'permite_substituicao',
    ];

    protected $casts = [
        'permite_substituicao' => 'boolean',
    ];

    public function carrinho()
    {
        return $this->belongsTo(Carrinho::class);
    }

    public function produto()
    {
        return $this->belongsTo(Produto::class);
    }

    public function getSubtotalAttribute()
    {
        return $this->quantidade * $this->produto->preco_final;
    }
}
