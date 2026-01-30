import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProdutoCard from '../components/ProdutoCard';
import { CarrinhoProvider } from '../contexts/CarrinhoContext';
import { AuthProvider } from '../contexts/AuthContext';

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProduto = {
  id: 1,
  nome: 'Banana Prata',
  preco: 5.99,
  preco_promocional: null,
  imagem: null,
  unidade: 'kg',
  estoque_atual: 50,
  categoria: {
    id: 1,
    nome: 'Hortifruti',
  },
};

const renderWithProviders = (produto) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CarrinhoProvider>
          <ProdutoCard produto={produto} />
        </CarrinhoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProdutoCard Component', () => {
  it('renders product name', () => {
    renderWithProviders(mockProduto);
    
    expect(screen.getByText('Banana Prata')).toBeInTheDocument();
  });

  it('renders product price', () => {
    renderWithProviders(mockProduto);
    
    expect(screen.getByText(/5\.99/)).toBeInTheDocument();
  });

  it('shows promotional price when available', () => {
    const produtoPromo = {
      ...mockProduto,
      preco_promocional: 4.99,
    };
    
    renderWithProviders(produtoPromo);
    
    expect(screen.getByText(/4\.99/)).toBeInTheDocument();
  });

  it('shows unit type', () => {
    renderWithProviders(mockProduto);
    
    expect(screen.getByText(/kg/)).toBeInTheDocument();
  });

  it('has add to cart button', () => {
    renderWithProviders(mockProduto);
    
    const addButton = screen.getByRole('button');
    expect(addButton).toBeInTheDocument();
  });

  it('shows out of stock when estoque is 0', () => {
    const produtoSemEstoque = {
      ...mockProduto,
      estoque_atual: 0,
    };
    
    renderWithProviders(produtoSemEstoque);
    
    expect(screen.getByText(/indisponível/i)).toBeInTheDocument();
  });
});
