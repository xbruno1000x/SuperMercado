import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import PDV from './pages/PDV';
import Historico from './pages/Historico';
import VendaDetalhe from './pages/VendaDetalhe';
import Gestao from './pages/Gestao';
import Relatorios from './pages/Relatorios';

function ProtectedRoute({ children, allowedProfiles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedProfiles.length > 0 && !allowedProfiles.includes(user.perfil)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      
      <Route
        path="/"
        element={
          <ProtectedRoute allowedProfiles={['admin', 'caixa']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PDV />} />
        <Route path="historico" element={<Historico />} />
        <Route path="gestao" element={<Gestao />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="venda/:id" element={<VendaDetalhe />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
