<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Produto extends Model
{
    use HasFactory;

    protected $fillable = [
        'categoria_id',
        'nome',
        'slug',
        'descricao',
        'codigo_barras',
        'preco',
        'preco_promocional',
        'unidade',
        'nome_unidade',
        'fator_unidade',
        'imagem',
        'estoque_atual',
        'estoque_minimo',
        'ativo',
    ];

    protected $casts = [
        'preco' => 'decimal:2',
        'preco_promocional' => 'decimal:2',
        'fator_unidade' => 'decimal:6',
        'ativo' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($produto) {
            if (empty($produto->slug)) {
                $produto->slug = Str::slug($produto->nome);
            }
        });
    }

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function movimentacoes()
    {
        return $this->hasMany(MovimentacaoEstoque::class);
    }

    public function getPrecoFinalAttribute()
    {
        return $this->preco_promocional ?? $this->preco;
    }

    public function scopeAtivo($query)
    {
        return $query->where('ativo', true);
    }

    public function scopeComEstoque($query)
    {
        return $query->where('estoque_atual', '>', 0);
    }

    public function scopeBusca($query, $termo)
    {
        return $query->where(function ($q) use ($termo) {
            $q->where('nome', 'like', "%{$termo}%")
              ->orWhere('codigo_barras', $termo);
        });
    }
}
