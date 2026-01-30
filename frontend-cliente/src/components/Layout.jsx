import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiHome, FiPackage, FiLogOut, FiSettings } from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCarrinho } from '../contexts/CarrinhoContext';
import FloatingCart from './FloatingCart';
import './Layout.css';

function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { quantidadeTotal } = useCarrinho();
  const navigate = useNavigate();

  const isAdmin = user?.perfil === 'admin';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container header-content">
          <Link to="/" className="logo">
            SuperMercado
          </Link>

          <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <FiHome /> Início
            </Link>
            <Link to="/produtos" onClick={() => setMenuOpen(false)}>
              Produtos
            </Link>
            {user && (
              <Link to="/pedidos" onClick={() => setMenuOpen(false)}>
                <FiPackage /> Meus Pedidos
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin/pedidos" onClick={() => setMenuOpen(false)} className="admin-link">
                <FiSettings /> Gerenciar Pedidos
              </Link>
            )}
          </nav>

          <div className="header-actions">
            {user ? (
              <>
                <Link to="/carrinho" className="cart-button">
                  <FiShoppingCart />
                  {quantidadeTotal > 0 && (
                    <span className="cart-badge">{quantidadeTotal}</span>
                  )}
                </Link>
                <div className="user-menu">
                  <button className="user-button">
                    <FiUser /> {user.nome.split(' ')[0]}
                    {isAdmin && <span className="admin-badge">Admin</span>}
                  </button>
                  <div className="user-dropdown">
                    <Link to="/perfil">Meu Perfil</Link>
                    <Link to="/enderecos">Meus Endereços</Link>
                    <Link to="/pedidos">Meus Pedidos</Link>
                    {isAdmin && (
                      <>
                        <div className="dropdown-divider"></div>
                        <Link to="/admin/pedidos" className="admin-link">
                          <FiSettings /> Gerenciar Pedidos
                        </Link>
                      </>
                    )}
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout}>
                      <FiLogOut /> Sair
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Entrar
              </Link>
            )}
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <FloatingCart />

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 SuperMercado. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
