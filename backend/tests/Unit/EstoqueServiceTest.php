<?php

namespace Tests\Unit;

use App\Models\Categoria;
use App\Models\Produto;
use App\Services\EstoqueService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EstoqueServiceTest extends TestCase
{
    use RefreshDatabase;

    private EstoqueService $estoqueService;
    private Produto $produto;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->estoqueService = app(EstoqueService::class);
        
        $categoria = Categoria::create([
            'nome' => 'Teste',
            'descricao' => 'Categoria de teste',
        ]);

        $this->produto = Produto::factory()->create([
            'categoria_id' => $categoria->id,
            'estoque_atual' => 0,
        ]);
    }

    public function test_entrada_increases_estoque(): void
    {
        $this->estoqueService->entrada($this->produto->id, 50, 'manual');

        $this->produto->refresh();
        $this->assertEquals(50, $this->produto->estoque_atual);
    }

    public function test_saida_decreases_estoque(): void
    {
        $this->estoqueService->entrada($this->produto->id, 100, 'manual');
        $this->estoqueService->saida($this->produto->id, 30, 'manual');

        $this->produto->refresh();
        $this->assertEquals(70, $this->produto->estoque_atual);
    }

    public function test_saida_allows_negative_estoque(): void
    {
        // O sistema permite saída mesmo sem estoque suficiente (será zerado)
        $this->estoqueService->entrada($this->produto->id, 10, 'manual');
        $this->estoqueService->saida($this->produto->id, 20, 'manual');

        $this->produto->refresh();
        $this->assertEquals(0, $this->produto->estoque_atual);
    }

    public function test_ajuste_sets_exact_quantity(): void
    {
        $this->estoqueService->entrada($this->produto->id, 100, 'manual');
        $this->estoqueService->ajuste($this->produto->id, 75, 'Ajuste de inventário');

        $this->produto->refresh();
        $this->assertEquals(75, $this->produto->estoque_atual);
    }

    public function test_verificar_disponibilidade_returns_true(): void
    {
        $this->estoqueService->entrada($this->produto->id, 50, 'manual');

        $result = $this->estoqueService->verificarDisponibilidade($this->produto->id, 30);

        $this->assertTrue($result);
    }

    public function test_verificar_disponibilidade_returns_false(): void
    {
        $this->estoqueService->entrada($this->produto->id, 10, 'manual');

        $result = $this->estoqueService->verificarDisponibilidade($this->produto->id, 20);

        $this->assertFalse($result);
    }

    public function test_movimentacao_is_recorded(): void
    {
        $this->estoqueService->entrada(
            $this->produto->id,
            25,
            'manual',
            null,
            null,
            'Entrada de teste'
        );

        $this->assertDatabaseHas('movimentacoes_estoque', [
            'produto_id' => $this->produto->id,
            'tipo' => 'entrada',
            'quantidade' => 25,
            'origem' => 'manual',
            'observacao' => 'Entrada de teste',
        ]);
    }

    public function test_get_historico(): void
    {
        $this->estoqueService->entrada($this->produto->id, 100, 'manual');
        $this->estoqueService->saida($this->produto->id, 20, 'venda_caixa');
        $this->estoqueService->saida($this->produto->id, 10, 'pedido_app');

        $historico = $this->estoqueService->getHistorico($this->produto->id);

        $this->assertCount(3, $historico);
    }
}
