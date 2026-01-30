<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategoriaSeeder::class,
            UnidadeSeeder::class,
            ProdutoSeeder::class,
            EstoqueSeeder::class,
        ]);
    }
}
