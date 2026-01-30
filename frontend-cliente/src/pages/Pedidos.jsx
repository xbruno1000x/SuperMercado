import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import api from '../services/api';
import './Pedidos.css';

const statusLabels = {
  criado: { label: 'Pedido Recebido', class: 'badge-warning' },
  em_separacao: { label: 'Em Separação', class: 'badge-info' },
  pronto: { label: 'Pronto para Entrega', class: 'badge-success' },
  entregue: { label: 'Entregue', class: 'badge-success' },
  cancelado: { label: 'Cancelado', class: 'badge-danger' },
  cancelamento_solicitado: { label: 'Cancelamento Solicitado', class: 'badge-warning' },
};

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadPedidos();
  }, []);

  async function loadPedidos(page = 1) {
    try {
      const response = await api.get('/pedidos', { params: { page } });
      setPedidos(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
      });
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  return (
    <div className="pedidos-page">
      <div className="container">
        <h1 className="page-title">Meus Pedidos</h1>

        {pedidos.length === 0 ? (
          <div className="empty-state">
            <FiPackage />
            <h2>Você ainda não fez nenhum pedido</h2>
            <p>Que tal começar a comprar?</p>
            <Link to="/produtos" className="btn btn-primary">
              Ver Produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="pedidos-lista">
              {pedidos.map((pedido) => {
                const status = statusLabels[pedido.status];
                return (
                  <Link
                    key={pedido.id}
                    to={`/pedidos/${pedido.id}`}
                    className="pedido-card"
                  >
                    <div className="pedido-header">
                      <div className="pedido-codigo">
                        <span className="label">Pedido</span>
                        <span className="codigo">#{pedido.codigo}</span>
                      </div>
                      <span className={`badge ${status.class}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="pedido-info">
                      <p className="pedido-data">
                        {new Date(pedido.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="pedido-itens">
                        {pedido.itens?.length || 0} {pedido.itens?.length === 1 ? 'item' : 'itens'}
                      </p>
                    </div>

                    <div className="pedido-footer">
                      <span className="pedido-total">
                        R$ {Number(pedido.total).toFixed(2)}
                      </span>
                      <FiChevronRight />
                    </div>
                  </Link>
                );
              })}
            </div>

            {pagination.lastPage > 1 && (
              <div className="paginacao">
                {Array.from({ length: pagination.lastPage }, (_, i) => (
                  <button
                    key={i + 1}
                    className={pagination.currentPage === i + 1 ? 'active' : ''}
                    onClick={() => loadPedidos(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Pedidos;
