<?php

namespace Database\Seeders;

use App\Models\Produto;
use App\Services\EstoqueService;
use Illuminate\Database\Seeder;

class EstoqueSeeder extends Seeder
{
    public function run(): void
    {
        $estoqueService = app(EstoqueService::class);
        
        $produtos = Produto::all();
        
        foreach ($produtos as $produto) {
            if ($produto->estoque_atual > 0) {
                $estoqueService->entrada(
                    $produto->id,
                    $produto->estoque_atual,
                    'manual',
                    null,
                    null,
                    'Estoque inicial - Seeder'
                );
            }
        }
    }
}
