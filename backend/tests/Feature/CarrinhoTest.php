<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Produto;
use App\Models\User;
use App\Services\EstoqueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CarrinhoTest extends TestCase
{
    use RefreshDatabase;

    private User $cliente;
    private Produto $produto;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->cliente = User::factory()->create(['perfil' => 'cliente']);
        
        $categoria = Categoria::create([
            'nome' => 'Teste',
            'descricao' => 'Categoria de teste',
        ]);

        $this->produto = Produto::factory()->create([
            'categoria_id' => $categoria->id,
            'preco' => 15.00,
            'estoque_atual' => 0,
        ]);

        $estoqueService = app(EstoqueService::class);
        $estoqueService->entrada($this->produto->id, 50, 'manual');
    }

    public function test_cliente_can_add_item_to_carrinho(): void
    {
        $response = $this->actingAs($this->cliente, 'sanctum')
            ->postJson('/api/carrinho/adicionar', [
                'produto_id' => $this->produto->id,
                'quantidade' => 2,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'carrinho',
                'total',
            ]);
    }

    public function test_cliente_can_view_carrinho(): void
    {
        $this->actingAs($this->cliente, 'sanctum')
            ->postJson('/api/carrinho/adicionar', [
                'produto_id' => $this->produto->id,
                'quantidade' => 1,
            ]);

        $response = $this->actingAs($this->cliente, 'sanctum')
            ->getJson('/api/carrinho');

        $response->assertStatus(200)
            ->assertJsonStructure(['carrinho', 'total']);
    }

    public function test_cliente_can_update_item_quantity(): void
    {
        $this->actingAs($this->cliente, 'sanctum')
            ->postJson('/api/carrinho/adicionar', [
                'produto_id' => $this->produto->id,
                'quantidade' => 1,
            ]);

        $response = $this->actingAs($this->cliente, 'sanctum')
            ->putJson('/api/carrinho/atualizar', [
                'produto_id' => $this->produto->id,
                'quantidade' => 5,
            ]);

        $response->assertStatus(200);
    }

    public function test_cliente_can_remove_item(): void
    {
        $this->actingAs($this->cliente, 'sanctum')
            ->postJson('/api/carrinho/adicionar', [
                'produto_id' => $this->produto->id,
                'quantidade' => 1,
            ]);

        $response = $this->actingAs($this->cliente, 'sanctum')
            ->deleteJson("/api/carrinho/remover/{$this->produto->id}");

        $response->assertStatus(200);
    }

    public function test_cliente_can_clear_carrinho(): void
    {
        $this->actingAs($this->cliente, 'sanctum')
            ->postJson('/api/carrinho/adicionar', [
                'produto_id' => $this->produto->id,
                'quantidade' => 3,
            ]);

        $response = $this->actingAs($this->cliente, 'sanctum')
            ->deleteJson('/api/carrinho/limpar');

        $response->assertStatus(200);
    }

    public function test_caixa_cannot_use_carrinho(): void
    {
        $caixa = User::factory()->create(['perfil' => 'caixa']);

        $response = $this->actingAs($caixa, 'sanctum')
            ->postJson('/api/carrinho/adicionar', [
                'produto_id' => $this->produto->id,
                'quantidade' => 1,
            ]);

        $response->assertStatus(403);
    }
}
