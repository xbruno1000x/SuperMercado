<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'endereco_id',
        'codigo',
        'status',
        'subtotal',
        'taxa_entrega',
        'desconto',
        'total',
        'forma_pagamento',
        'troco_para',
        'observacoes',
        'data_pagamento',
        'data_entrega',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'taxa_entrega' => 'decimal:2',
        'desconto' => 'decimal:2',
        'total' => 'decimal:2',
        'troco_para' => 'decimal:2',
        'data_pagamento' => 'datetime',
        'data_entrega' => 'datetime',
    ];

    const STATUS_CRIADO = 'criado';
    const STATUS_EM_SEPARACAO = 'em_separacao';
    const STATUS_PRONTO = 'pronto';
    const STATUS_ENTREGUE = 'entregue';
    const STATUS_CANCELADO = 'cancelado';
    const STATUS_CANCELAMENTO_SOLICITADO = 'cancelamento_solicitado';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($pedido) {
            if (empty($pedido->codigo)) {
                $pedido->codigo = 'PED' . strtoupper(uniqid());
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function endereco()
    {
        return $this->belongsTo(Endereco::class);
    }

    public function itens()
    {
        return $this->hasMany(PedidoItem::class);
    }

    public function movimentacoes()
    {
        return $this->morphMany(MovimentacaoEstoque::class, 'referencia');
    }

    public function scopeDoCliente($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopePorStatus($query, $status)
    {
        return $query->where('status', $status);
    }
}
