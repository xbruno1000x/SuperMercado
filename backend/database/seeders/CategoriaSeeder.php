<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['nome' => 'Hortifruti', 'ordem' => 1],
            ['nome' => 'Carnes', 'ordem' => 2],
            ['nome' => 'Laticínios', 'ordem' => 3],
            ['nome' => 'Padaria', 'ordem' => 4],
            ['nome' => 'Bebidas', 'ordem' => 5],
            ['nome' => 'Limpeza', 'ordem' => 6],
            ['nome' => 'Higiene', 'ordem' => 7],
            ['nome' => 'Mercearia', 'ordem' => 8],
            ['nome' => 'Congelados', 'ordem' => 9],
            ['nome' => 'Doces e Sobremesas', 'ordem' => 10],
        ];

        foreach ($categorias as $categoria) {
            Categoria::create($categoria);
        }
    }
}
