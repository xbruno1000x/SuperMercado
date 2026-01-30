<?php

namespace Tests\Feature;

use App\Models\Categoria;
use App\Models\Produto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProdutoTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Categoria $categoria;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['perfil' => 'admin']);
        $this->categoria = Categoria::create([
            'nome' => 'Teste',
            'descricao' => 'Categoria de teste',
        ]);
    }

    public function test_can_list_produtos(): void
    {
        Produto::factory()->count(5)->create([
            'categoria_id' => $this->categoria->id,
        ]);

        $response = $this->getJson('/api/produtos');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'nome', 'preco', 'categoria'],
                ],
            ]);
    }

    public function test_can_get_produto_by_id(): void
    {
        $produto = Produto::factory()->create([
            'categoria_id' => $this->categoria->id,
        ]);

        $response = $this->getJson("/api/produtos/{$produto->id}");

        $response->assertStatus(200)
            ->assertJson([
                'id' => $produto->id,
                'nome' => $produto->nome,
            ]);
    }

    public function test_can_search_produtos(): void
    {
        Produto::factory()->create([
            'nome' => 'Banana Prata',
            'categoria_id' => $this->categoria->id,
            'estoque_atual' => 100,
        ]);

        Produto::factory()->create([
            'nome' => 'Maçã Fuji',
            'categoria_id' => $this->categoria->id,
            'estoque_atual' => 50,
        ]);

        $response = $this->getJson('/api/produtos/busca?termo=banana');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['nome' => 'Banana Prata']);
    }

    public function test_admin_can_create_produto(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/produtos', [
                'nome' => 'Novo Produto',
                'preco' => 10.99,
                'categoria_id' => $this->categoria->id,
                'codigo_barras' => '7891234567890',
                'unidade' => 'un',
                'estoque_minimo' => 5,
            ]);

        $response->assertStatus(201)
            ->assertJson(['nome' => 'Novo Produto']);

        $this->assertDatabaseHas('produtos', ['nome' => 'Novo Produto']);
    }

    public function test_admin_can_update_produto(): void
    {
        $produto = Produto::factory()->create([
            'categoria_id' => $this->categoria->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/produtos/{$produto->id}", [
                'nome' => 'Produto Atualizado',
                'preco' => 15.99,
                'categoria_id' => $this->categoria->id,
                'codigo_barras' => $produto->codigo_barras,
                'unidade' => 'un',
                'estoque_minimo' => 10,
            ]);

        $response->assertStatus(200)
            ->assertJson(['nome' => 'Produto Atualizado']);
    }

    public function test_admin_can_delete_produto(): void
    {
        $produto = Produto::factory()->create([
            'categoria_id' => $this->categoria->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/produtos/{$produto->id}");

        $response->assertStatus(204);
        
        $this->assertDatabaseHas('produtos', [
            'id' => $produto->id,
            'ativo' => false,
        ]);
    }

    public function test_non_admin_cannot_create_produto(): void
    {
        $cliente = User::factory()->create(['perfil' => 'cliente']);

        $response = $this->actingAs($cliente, 'sanctum')
            ->postJson('/api/produtos', [
                'nome' => 'Produto Teste',
                'preco' => 10.99,
                'categoria_id' => $this->categoria->id,
            ]);

        $response->assertStatus(403);
    }

    public function test_can_filter_by_categoria(): void
    {
        $outraCategoria = Categoria::create([
            'nome' => 'Outra',
            'descricao' => 'Outra categoria',
        ]);

        Produto::factory()->create([
            'nome' => 'Produto A',
            'categoria_id' => $this->categoria->id,
        ]);

        Produto::factory()->create([
            'nome' => 'Produto B',
            'categoria_id' => $outraCategoria->id,
        ]);

        $response = $this->getJson("/api/produtos?categoria_id={$this->categoria->id}");

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Produto A', $data[0]['nome']);
    }
}
