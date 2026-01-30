import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Caixa Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form', () => {
    renderWithProviders(<Login />);
    
    // Email input uses "seu@email.com" placeholder
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    // Password input uses "••••••••" placeholder
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('shows cashier-specific text', () => {
    renderWithProviders(<Login />);
    
    // Use getAllByText since "caixa" appears multiple times
    const caixaElements = screen.getAllByText(/caixa/i);
    expect(caixaElements.length).toBeGreaterThan(0);
  });

  it('allows typing credentials', () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    
    fireEvent.change(emailInput, { target: { value: 'caixa@teste.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    
    expect(emailInput.value).toBe('caixa@teste.com');
    expect(passwordInput.value).toBe('senha123');
  });

  it('has required fields', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByPlaceholderText('seu@email.com')).toBeRequired();
    expect(screen.getByPlaceholderText('••••••••')).toBeRequired();
  });
});
