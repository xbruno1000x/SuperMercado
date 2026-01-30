<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Produto;
use App\Models\User;
use App\Services\EstoqueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendaTest extends TestCase
{
    use RefreshDatabase;

    private User $caixa;
    private Produto $produto;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->caixa = User::factory()->create(['perfil' => 'caixa']);
        
        $categoria = Categoria::create([
            'nome' => 'Teste',
            'descricao' => 'Categoria de teste',
        ]);

        $this->produto = Produto::factory()->create([
            'categoria_id' => $categoria->id,
            'preco' => 10.00,
            'estoque_atual' => 0,
        ]);

        $estoqueService = app(EstoqueService::class);
        $estoqueService->entrada($this->produto->id, 100, 'manual');
    }

    public function test_caixa_can_create_venda(): void
    {
        $response = $this->actingAs($this->caixa, 'sanctum')
            ->postJson('/api/vendas', [
                'forma_pagamento' => 'dinheiro',
                'itens' => [
                    [
                        'produto_id' => $this->produto->id,
                        'quantidade' => 2,
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'total',
                'forma_pagamento',
                'itens',
            ]);

        $this->assertEquals(20.00, $response->json('total'));
    }

    public function test_venda_reduces_estoque(): void
    {
        $this->produto->refresh();
        $estoqueInicial = $this->produto->estoque_atual;

        $response = $this->actingAs($this->caixa, 'sanctum')
            ->postJson('/api/vendas', [
                'forma_pagamento' => 'cartao',
                'itens' => [
                    [
                        'produto_id' => $this->produto->id,
                        'quantidade' => 5,
                    ],
                ],
            ]);

        $response->assertStatus(201);
        
        $this->produto->refresh();
        $this->assertEquals($estoqueInicial - 5, $this->produto->estoque_atual);
    }

    public function test_cannot_sell_without_estoque(): void
    {
        $produtoSemEstoque = Produto::factory()->create([
            'categoria_id' => $this->produto->categoria_id,
            'estoque_atual' => 0,
        ]);

        $response = $this->actingAs($this->caixa, 'sanctum')
            ->postJson('/api/vendas', [
                'forma_pagamento' => 'dinheiro',
                'itens' => [
                    [
                        'produto_id' => $produtoSemEstoque->id,
                        'quantidade' => 1,
                    ],
                ],
            ]);

        $response->assertStatus(422);
    }

    public function test_caixa_can_list_vendas(): void
    {
        $this->actingAs($this->caixa, 'sanctum')
            ->postJson('/api/vendas', [
                'forma_pagamento' => 'pix',
                'itens' => [
                    ['produto_id' => $this->produto->id, 'quantidade' => 1],
                ],
            ]);

        $response = $this->actingAs($this->caixa, 'sanctum')
            ->getJson('/api/vendas');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'total', 'forma_pagamento'],
                ],
            ]);
    }

    public function test_caixa_can_view_venda(): void
    {
        $vendaResponse = $this->actingAs($this->caixa, 'sanctum')
            ->postJson('/api/vendas', [
                'forma_pagamento' => 'cartao',
                'itens' => [
                    ['produto_id' => $this->produto->id, 'quantidade' => 3],
                ],
            ]);

        $vendaId = $vendaResponse->json('id');

        $response = $this->actingAs($this->caixa, 'sanctum')
            ->getJson("/api/vendas/{$vendaId}");

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'itens', 'usuario']);
    }

    public function test_cliente_cannot_create_venda(): void
    {
        $cliente = User::factory()->create(['perfil' => 'cliente']);

        $response = $this->actingAs($cliente, 'sanctum')
            ->postJson('/api/vendas', [
                'forma_pagamento' => 'dinheiro',
                'itens' => [
                    ['produto_id' => $this->produto->id, 'quantidade' => 1],
                ],
            ]);

        $response->assertStatus(403);
    }

    public function test_venda_with_desconto(): void
    {
        $response = $this->actingAs($this->caixa, 'sanctum')
            ->postJson('/api/vendas', [
                'forma_pagamento' => 'dinheiro',
                'desconto' => 5.00,
                'itens' => [
                    ['produto_id' => $this->produto->id, 'quantidade' => 3],
                ],
            ]);

        $response->assertStatus(201);
        $this->assertEquals(25.00, $response->json('total'));
        $this->assertEquals(5.00, $response->json('desconto'));
    }
}
