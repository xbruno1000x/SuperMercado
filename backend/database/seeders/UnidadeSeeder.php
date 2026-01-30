<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnidadeSeeder extends Seeder
{
    /**
     * Definições de unidades de medida com seus fatores de conversão.
     * 
     * O fator_unidade representa a conversão para a unidade base:
     * - Para peso: kg é a base (fator = 1)
     * - Para volume: L é a base (fator = 1)
     * - Para unidades: un é a base (fator = 1)
     */
    public static array $unidades = [
        // Unidades de peso
        'kg' => [
            'nome_unidade' => 'quilograma',
            'fator_unidade' => 1.000000,
        ],
        'g' => [
            'nome_unidade' => 'grama',
            'fator_unidade' => 0.001000,
        ],
        // Unidades de volume
        'L' => [
            'nome_unidade' => 'litro',
            'fator_unidade' => 1.000000,
        ],
        'ml' => [
            'nome_unidade' => 'mililitro',
            'fator_unidade' => 0.001000,
        ],
        // Unidades discretas
        'un' => [
            'nome_unidade' => 'unidade',
            'fator_unidade' => 1.000000,
        ],
        'pct' => [
            'nome_unidade' => 'pacote',
            'fator_unidade' => 1.000000,
        ],
        'cx' => [
            'nome_unidade' => 'caixa',
            'fator_unidade' => 1.000000,
        ],
        'dz' => [
            'nome_unidade' => 'dúzia',
            'fator_unidade' => 12.000000,
        ],
    ];

    public function run(): void
    {
        // Este seeder apenas define as unidades disponíveis.
        // Os produtos usam essas definições via getUnidadeInfo().
        $this->command->info('Unidades de medida disponíveis:');
        foreach (self::$unidades as $sigla => $info) {
            $this->command->line("  - {$sigla}: {$info['nome_unidade']} (fator: {$info['fator_unidade']})");
        }
    }

    /**
     * Retorna informações de uma unidade pela sigla.
     */
    public static function getUnidadeInfo(string $sigla): ?array
    {
        return self::$unidades[$sigla] ?? null;
    }
}
