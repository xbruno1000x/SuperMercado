<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Venda extends Model
{
    use HasFactory;

    protected $fillable = [
        'usuario_id',
        'codigo',
        'subtotal',
        'desconto',
        'total',
        'forma_pagamento',
        'valor_recebido',
        'troco',
        'status',
        'observacoes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'desconto' => 'decimal:2',
        'total' => 'decimal:2',
        'valor_recebido' => 'decimal:2',
        'troco' => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($venda) {
            if (empty($venda->codigo)) {
                $venda->codigo = 'VDA' . strtoupper(uniqid());
            }
        });
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function itens()
    {
        return $this->hasMany(VendaItem::class);
    }

    public function movimentacoes()
    {
        return $this->morphMany(MovimentacaoEstoque::class, 'referencia');
    }

    public function scopeHoje($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeDoUsuario($query, $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }
}
