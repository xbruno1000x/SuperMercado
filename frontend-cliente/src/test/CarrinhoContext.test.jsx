import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CarrinhoProvider, useCarrinho } from '../contexts/CarrinhoContext';
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
    get: vi.fn().mockResolvedValue({ data: { carrinho: { itens: [] }, total: 0, quantidade_total: 0 } }),
    post: vi.fn().mockResolvedValue({ data: { carrinho: { itens: [] }, total: 0, quantidade_total: 0 } }),
    put: vi.fn().mockResolvedValue({ data: { carrinho: { itens: [] }, total: 0, quantidade_total: 0 } }),
    delete: vi.fn().mockResolvedValue({ data: { carrinho: { itens: [] }, total: 0, quantidade_total: 0 } }),
  },
}));

const TestComponent = ({ onAdd, onRemove }) => {
  const { itens, total, quantidadeTotal, loading, adicionarItem, removerItem, limparCarrinho } = useCarrinho();

  return (
    <div>
      <span data-testid="total">{total}</span>
      <span data-testid="quantidade">{quantidadeTotal}</span>
      <span data-testid="itens-count">{itens.length}</span>
      <span data-testid="loading">{loading ? 'true' : 'false'}</span>
      <button data-testid="add-item" onClick={() => adicionarItem({ id: 1, nome: 'Produto Teste', preco: 10.00 }, 2)}>Adicionar</button>
      <button data-testid="remove-item" onClick={() => removerItem(1)}>Remover</button>
      <button data-testid="clear-cart" onClick={() => limparCarrinho()}>Limpar</button>
    </div>
  );
};

const renderWithProviders = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CarrinhoProvider>
          <TestComponent />
        </CarrinhoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Carrinho Context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts with empty cart values', () => {
    renderWithProviders();
    
    expect(screen.getByTestId('total').textContent).toBe('0');
    expect(screen.getByTestId('quantidade').textContent).toBe('0');
    expect(screen.getByTestId('itens-count').textContent).toBe('0');
  });

  it('provides itens array', () => {
    renderWithProviders();
    
    expect(screen.getByTestId('itens-count').textContent).toMatch(/\d+/);
  });

  it('provides total value', () => {
    renderWithProviders();
    
    expect(screen.getByTestId('total')).toBeInTheDocument();
  });

  it('provides quantidadeTotal value', () => {
    renderWithProviders();
    
    expect(screen.getByTestId('quantidade')).toBeInTheDocument();
  });

  it('can add item to local cart when not logged in', async () => {
    renderWithProviders();
    
    const addButton = screen.getByTestId('add-item');
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('itens-count').textContent).toBe('1');
      expect(screen.getByTestId('quantidade').textContent).toBe('2');
      expect(screen.getByTestId('total').textContent).toBe('20');
    });
  });

  it('persists cart in localStorage when not logged in', async () => {
    renderWithProviders();
    
    const addButton = screen.getByTestId('add-item');
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      const stored = localStorage.getItem('carrinho_local');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored);
      expect(parsed.itens).toHaveLength(1);
    });
  });

  it('can clear cart', async () => {
    renderWithProviders();
    
    const addButton = screen.getByTestId('add-item');
    const clearButton = screen.getByTestId('clear-cart');
    
    await act(async () => {
      fireEvent.click(addButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('itens-count').textContent).toBe('1');
    });

    await act(async () => {
      fireEvent.click(clearButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('itens-count').textContent).toBe('0');
      expect(screen.getByTestId('total').textContent).toBe('0');
    });
  });
});
