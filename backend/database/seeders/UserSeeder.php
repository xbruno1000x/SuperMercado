<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'nome' => 'Administrador',
            'email' => 'admin@supermercado.com',
            'password' => Hash::make('admin123'),
            'perfil' => 'admin',
            'ativo' => true,
        ]);

        User::create([
            'nome' => 'Operador de Caixa',
            'email' => 'caixa@supermercado.com',
            'password' => Hash::make('caixa123'),
            'perfil' => 'caixa',
            'ativo' => true,
        ]);

        User::create([
            'nome' => 'Cliente Teste',
            'email' => 'cliente@teste.com',
            'password' => Hash::make('cliente123'),
            'cpf' => '123.456.789-00',
            'telefone' => '(11) 99999-9999',
            'perfil' => 'cliente',
            'ativo' => true,
        ]);
    }
}
