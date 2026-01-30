<?php

namespace Database\Factories;

use App\Models\Categoria;
use App\Models\Produto;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProdutoFactory extends Factory
{
    protected $model = Produto::class;

    public function definition(): array
    {
        return [
            'nome' => fake()->words(3, true),
            'descricao' => fake()->sentence(),
            'preco' => fake()->randomFloat(2, 1, 100),
            'preco_promocional' => null,
            'codigo_barras' => fake()->ean13(),
            'unidade' => fake()->randomElement(['un', 'kg', 'L', 'g']),
            'estoque_atual' => 0,
            'estoque_minimo' => fake()->numberBetween(5, 20),
            'ativo' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'ativo' => false,
        ]);
    }

    public function withStock(int $quantity): static
    {
        return $this->state(fn (array $attributes) => [
            'estoque_atual' => $quantity,
        ]);
    }

    public function promotional(float $price): static
    {
        return $this->state(fn (array $attributes) => [
            'preco_promocional' => $price,
        ]);
    }
}
