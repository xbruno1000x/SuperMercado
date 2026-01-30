import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Produtos from './pages/Produtos';
import ProdutoDetalhe from './pages/ProdutoDetalhe';
import Carrinho from './pages/Carrinho';
import Checkout from './pages/Checkout';
import Pedidos from './pages/Pedidos';
import PedidoDetalhe from './pages/PedidoDetalhe';
import Enderecos from './pages/Enderecos';
import Perfil from './pages/Perfil';
import AdicionarItensPedido from './pages/AdicionarItensPedido';
import GerenciarPedidos from './pages/admin/GerenciarPedidos';
import GerenciarPedidoDetalhe from './pages/admin/GerenciarPedidoDetalhe';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.perfil !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="produtos/:id" element={<ProdutoDetalhe />} />
        <Route
          path="carrinho"
          element={
            <ProtectedRoute>
              <Carrinho />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="pedidos"
          element={
            <ProtectedRoute>
              <Pedidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="pedidos/:id"
          element={
            <ProtectedRoute>
              <PedidoDetalhe />
            </ProtectedRoute>
          }
        />
        <Route
          path="pedidos/:pedidoId/adicionar-itens"
          element={
            <ProtectedRoute>
              <AdicionarItensPedido />
            </ProtectedRoute>
          }
        />
        <Route
          path="enderecos"
          element={
            <ProtectedRoute>
              <Enderecos />
            </ProtectedRoute>
          }
        />
        <Route
          path="enderecos/novo"
          element={
            <ProtectedRoute>
              <Enderecos />
            </ProtectedRoute>
          }
        />
        <Route
          path="perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="admin/pedidos"
          element={
            <AdminRoute>
              <GerenciarPedidos />
            </AdminRoute>
          }
        />
        <Route
          path="admin/pedidos/:id"
          element={
            <AdminRoute>
              <GerenciarPedidoDetalhe />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
