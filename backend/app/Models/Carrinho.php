<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Carrinho extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function itens()
    {
        return $this->hasMany(CarrinhoItem::class);
    }

    public function getTotalAttribute()
    {
        return $this->itens->sum(function ($item) {
            return $item->quantidade * $item->produto->preco_final;
        });
    }

    public function getQuantidadeTotalAttribute()
    {
        return $this->itens->sum('quantidade');
    }
}
