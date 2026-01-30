<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nome',
        'email',
        'password',
        'cpf',
        'telefone',
        'perfil',
        'ativo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'ativo' => 'boolean',
    ];

    public function enderecos()
    {
        return $this->hasMany(Endereco::class);
    }

    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }

    public function carrinho()
    {
        return $this->hasOne(Carrinho::class);
    }

    public function vendas()
    {
        return $this->hasMany(Venda::class, 'usuario_id');
    }

    public function isAdmin(): bool
    {
        return $this->perfil === 'admin';
    }

    public function isCaixa(): bool
    {
        return $this->perfil === 'caixa';
    }

    public function isCliente(): bool
    {
        return $this->perfil === 'cliente';
    }
}
