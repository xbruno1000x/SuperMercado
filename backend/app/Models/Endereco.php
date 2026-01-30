<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Endereco extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'cep',
        'logradouro',
        'numero',
        'complemento',
        'bairro',
        'cidade',
        'estado',
        'principal',
    ];

    protected $casts = [
        'principal' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getEnderecoCompletoAttribute()
    {
        $endereco = "{$this->logradouro}, {$this->numero}";
        if ($this->complemento) {
            $endereco .= " - {$this->complemento}";
        }
        $endereco .= " - {$this->bairro}, {$this->cidade}/{$this->estado}";
        return $endereco;
    }
}
