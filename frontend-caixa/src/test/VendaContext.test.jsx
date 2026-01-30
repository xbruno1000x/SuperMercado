import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VendaProvider, useVenda } from '../contexts/VendaContext';
import { AuthProvider } from '../contexts/AuthContext';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn().mockResolvedValue({ data: { id: 1 } }),
  },
}));

const TestComponent = () => {
  const { itens, adicionarItem, removerItem, getTotal, limparVenda } = useVenda();
  
  const mockProduto = {
    id: 1,
    nome: 'Produto Teste',
    codigo_barras: '7891234567890',
    preco: 15.00,
    estoque_atual: 50,
  };

  return (
    <div>
      <span data-testid="total">{getTotal()}</span>
      <span data-testid="itens-count">{itens.length}</span>
      {itens.map(item => (
        <span key={item.produto_id} data-testid={`item-${item.produto_id}`}>
          {item.nome} - {item.quantidade}
        </span>
      ))}
      <button onClick={() => adicionarItem(mockProduto, 1)}>Adicionar</button>
      <button onClick={() => removerItem(1)}>Remover</button>
      <button onClick={limparVenda}>Limpar</button>
    </div>
  );
};

const renderWithProviders = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <VendaProvider>
          <TestComponent />
        </VendaProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Venda Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts with empty sale', () => {
    renderWithProviders();
    
    expect(screen.getByTestId('total').textContent).toBe('0');
    expect(screen.getByTestId('itens-count').textContent).toBe('0');
  });

  it('adds item to sale', () => {
    renderWithProviders();
    
    fireEvent.click(screen.getByText('Adicionar'));
    
    expect(screen.getByTestId('total').textContent).toBe('15');
    expect(screen.getByTestId('itens-count').textContent).toBe('1');
  });

  it('removes item from sale', () => {
    renderWithProviders();
    
    fireEvent.click(screen.getByText('Adicionar'));
    fireEvent.click(screen.getByText('Remover'));
    
    expect(screen.getByTestId('total').textContent).toBe('0');
    expect(screen.getByTestId('itens-count').textContent).toBe('0');
  });

  it('accumulates quantity when adding same product', () => {
    renderWithProviders();
    
    fireEvent.click(screen.getByText('Adicionar'));
    fireEvent.click(screen.getByText('Adicionar'));
    
    expect(screen.getByTestId('total').textContent).toBe('30');
    expect(screen.getByTestId('itens-count').textContent).toBe('1');
  });

  it('clears all items', () => {
    renderWithProviders();
    
    fireEvent.click(screen.getByText('Adicionar'));
    fireEvent.click(screen.getByText('Adicionar'));
    fireEvent.click(screen.getByText('Limpar'));
    
    expect(screen.getByTestId('total').textContent).toBe('0');
    expect(screen.getByTestId('itens-count').textContent).toBe('0');
  });
});
