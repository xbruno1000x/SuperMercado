<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Produto;
use Illuminate\Database\Seeder;

class ProdutoSeeder extends Seeder
{
    public function run(): void
    {
        // Definições de unidades com nome e fator de conversão
        $unidades = UnidadeSeeder::$unidades;

        $produtos = [
            ['categoria' => 'Hortifruti', 'nome' => 'Banana Prata', 'preco' => 5.99, 'codigo_barras' => '7891000100101', 'unidade' => 'kg', 'estoque_atual' => 100],
            ['categoria' => 'Hortifruti', 'nome' => 'Maçã Fuji', 'preco' => 8.99, 'codigo_barras' => '7891000100102', 'unidade' => 'kg', 'estoque_atual' => 80],
            ['categoria' => 'Hortifruti', 'nome' => 'Tomate', 'preco' => 6.49, 'codigo_barras' => '7891000100103', 'unidade' => 'kg', 'estoque_atual' => 60],
            ['categoria' => 'Hortifruti', 'nome' => 'Alface Americana', 'preco' => 3.99, 'codigo_barras' => '7891000100104', 'unidade' => 'un', 'estoque_atual' => 40],
            ['categoria' => 'Hortifruti', 'nome' => 'Cenoura', 'preco' => 4.99, 'codigo_barras' => '7891000100105', 'unidade' => 'kg', 'estoque_atual' => 50],
            ['categoria' => 'Hortifruti', 'nome' => 'Alho (100g)', 'preco' => 3.49, 'codigo_barras' => '7891000100106', 'unidade' => 'g', 'estoque_atual' => 200],

            ['categoria' => 'Carnes', 'nome' => 'Picanha Bovina', 'preco' => 79.90, 'codigo_barras' => '7891000200101', 'unidade' => 'kg', 'estoque_atual' => 30],
            ['categoria' => 'Carnes', 'nome' => 'Frango Inteiro', 'preco' => 15.90, 'codigo_barras' => '7891000200102', 'unidade' => 'kg', 'estoque_atual' => 50],
            ['categoria' => 'Carnes', 'nome' => 'Carne Moída', 'preco' => 29.90, 'codigo_barras' => '7891000200103', 'unidade' => 'kg', 'estoque_atual' => 40],
            ['categoria' => 'Carnes', 'nome' => 'Filé Mignon (500g)', 'preco' => 49.90, 'codigo_barras' => '7891000200104', 'unidade' => 'g', 'estoque_atual' => 25],

            ['categoria' => 'Laticínios', 'nome' => 'Leite Integral', 'preco' => 5.49, 'codigo_barras' => '7891000300101', 'unidade' => 'L', 'estoque_atual' => 200],
            ['categoria' => 'Laticínios', 'nome' => 'Queijo Mussarela', 'preco' => 39.90, 'codigo_barras' => '7891000300102', 'unidade' => 'kg', 'estoque_atual' => 25],
            ['categoria' => 'Laticínios', 'nome' => 'Iogurte Natural', 'preco' => 6.99, 'codigo_barras' => '7891000300103', 'unidade' => 'un', 'estoque_atual' => 60],
            ['categoria' => 'Laticínios', 'nome' => 'Manteiga (200g)', 'preco' => 12.90, 'codigo_barras' => '7891000300104', 'unidade' => 'g', 'estoque_atual' => 45],

            ['categoria' => 'Padaria', 'nome' => 'Pão Francês', 'preco' => 14.90, 'codigo_barras' => '7891000400101', 'unidade' => 'kg', 'estoque_atual' => 100],
            ['categoria' => 'Padaria', 'nome' => 'Pão de Forma', 'preco' => 8.99, 'codigo_barras' => '7891000400102', 'unidade' => 'un', 'estoque_atual' => 45],

            ['categoria' => 'Bebidas', 'nome' => 'Água Mineral 500ml', 'preco' => 2.50, 'codigo_barras' => '7891000500101', 'unidade' => 'ml', 'estoque_atual' => 300],
            ['categoria' => 'Bebidas', 'nome' => 'Refrigerante Cola 2L', 'preco' => 9.99, 'codigo_barras' => '7891000500102', 'unidade' => 'L', 'estoque_atual' => 150],
            ['categoria' => 'Bebidas', 'nome' => 'Suco de Laranja 1L', 'preco' => 7.99, 'codigo_barras' => '7891000500103', 'unidade' => 'L', 'estoque_atual' => 80],

            ['categoria' => 'Limpeza', 'nome' => 'Detergente 500ml', 'preco' => 2.99, 'codigo_barras' => '7891000600101', 'unidade' => 'ml', 'estoque_atual' => 120],
            ['categoria' => 'Limpeza', 'nome' => 'Sabão em Pó 1kg', 'preco' => 12.90, 'codigo_barras' => '7891000600102', 'unidade' => 'kg', 'estoque_atual' => 80],
            ['categoria' => 'Limpeza', 'nome' => 'Água Sanitária 2L', 'preco' => 6.49, 'codigo_barras' => '7891000600103', 'unidade' => 'L', 'estoque_atual' => 90],

            ['categoria' => 'Higiene', 'nome' => 'Sabonete', 'preco' => 2.49, 'codigo_barras' => '7891000700101', 'unidade' => 'un', 'estoque_atual' => 200],
            ['categoria' => 'Higiene', 'nome' => 'Shampoo 400ml', 'preco' => 15.90, 'codigo_barras' => '7891000700102', 'unidade' => 'ml', 'estoque_atual' => 60],
            ['categoria' => 'Higiene', 'nome' => 'Creme Dental', 'preco' => 6.99, 'codigo_barras' => '7891000700103', 'unidade' => 'un', 'estoque_atual' => 100],

            ['categoria' => 'Mercearia', 'nome' => 'Arroz 5kg', 'preco' => 24.90, 'codigo_barras' => '7891000800101', 'unidade' => 'kg', 'estoque_atual' => 100],
            ['categoria' => 'Mercearia', 'nome' => 'Feijão Preto 1kg', 'preco' => 8.99, 'codigo_barras' => '7891000800102', 'unidade' => 'kg', 'estoque_atual' => 80],
            ['categoria' => 'Mercearia', 'nome' => 'Macarrão 500g', 'preco' => 4.49, 'codigo_barras' => '7891000800103', 'unidade' => 'g', 'estoque_atual' => 150],
            ['categoria' => 'Mercearia', 'nome' => 'Óleo de Soja 900ml', 'preco' => 7.99, 'codigo_barras' => '7891000800104', 'unidade' => 'ml', 'estoque_atual' => 120],

            ['categoria' => 'Congelados', 'nome' => 'Pizza Congelada', 'preco' => 19.90, 'codigo_barras' => '7891000900101', 'unidade' => 'un', 'estoque_atual' => 40],
            ['categoria' => 'Congelados', 'nome' => 'Lasanha Congelada', 'preco' => 24.90, 'codigo_barras' => '7891000900102', 'unidade' => 'un', 'estoque_atual' => 35],

            ['categoria' => 'Doces e Sobremesas', 'nome' => 'Chocolate ao Leite', 'preco' => 6.99, 'codigo_barras' => '7891001000101', 'unidade' => 'un', 'estoque_atual' => 100],
            ['categoria' => 'Doces e Sobremesas', 'nome' => 'Sorvete 2L', 'preco' => 24.90, 'codigo_barras' => '7891001000102', 'unidade' => 'L', 'estoque_atual' => 30],
        ];

        foreach ($produtos as $produtoData) {
            $categoria = Categoria::where('nome', $produtoData['categoria'])->first();
            $unidadeSigla = $produtoData['unidade'];
            
            unset($produtoData['categoria']);
            
            $produtoData['categoria_id'] = $categoria->id;
            $produtoData['estoque_minimo'] = 10;
            
            // Adicionar nome_unidade e fator_unidade baseado na sigla
            if (isset($unidades[$unidadeSigla])) {
                $produtoData['nome_unidade'] = $unidades[$unidadeSigla]['nome_unidade'];
                $produtoData['fator_unidade'] = $unidades[$unidadeSigla]['fator_unidade'];
            }
            
            Produto::create($produtoData);
        }
    }
}
