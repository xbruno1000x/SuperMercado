import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaCashRegister, FaHistory, FaSignOutAlt, FaUser, FaCog, FaChartBar } from 'react-icons/fa';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.perfil === 'admin';

  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <FaCashRegister className="logo-icon" />
          <span className="logo-text">SuperMercado</span>
          <span className="badge">Caixa</span>
        </div>
        
        <nav className="nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
            <FaCashRegister /> PDV
          </NavLink>
          <NavLink to="/historico" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaHistory /> Histórico
          </NavLink>
          <NavLink to="/relatorios" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <FaChartBar /> Relatórios
          </NavLink>
          {isAdmin && (
            <NavLink to="/gestao" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <FaCog /> Gestão
            </NavLink>
          )}
        </nav>

        <div className="header-right">
          <div className="user-info">
            <FaUser />
            <span>{user?.nome}</span>
            {isAdmin && <span className="admin-badge">Admin</span>}
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Sair
          </button>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
