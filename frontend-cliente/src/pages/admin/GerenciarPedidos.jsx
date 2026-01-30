import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight, FiFilter, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './GerenciarPedidos.css';

const statusLabels = {
  criado: { label: 'Pedido Criado', class: 'badge-warning' },
  em_separacao: { label: 'Em Separação', class: 'badge-info' },
  pronto: { label: 'Pronto para Entrega', class: 'badge-success' },
  entregue: { label: 'Entregue', class: 'badge-success' },
  cancelado: { label: 'Cancelado', class: 'badge-danger' },
  cancelamento_solicitado: { label: 'Cancelamento Solicitado', class: 'badge-warning' },
};

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'criado', label: 'Pedidos Criados' },
  { value: 'cancelamento_solicitado', label: 'Cancelamento Solicitado' },
  { value: 'em_separacao', label: 'Em Separação' },
  { value: 'pronto', label: 'Prontos para Entrega' },
  { value: 'entregue', label: 'Entregues' },
  { value: 'cancelado', label: 'Cancelados' },
];

function GerenciarPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadPedidos();
  }, [filtroStatus]);

  async function loadPedidos(page = 1) {
    setLoading(true);
    try {
      const params = { page };
      if (filtroStatus) {
        params.status = filtroStatus;
      }
      const response = await api.get('/pedidos/todos', { params });
      setPedidos(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
      });
    } catch (error) {
      toast.error('Erro ao carregar pedidos');
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(pedidoId, novoStatus) {
    try {
      await api.patch(`/pedidos/${pedidoId}/status`, { status: novoStatus });
      toast.success('Status atualizado com sucesso!');
      loadPedidos(pagination.currentPage);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status');
    }
  }

  const getProximoStatus = (statusAtual) => {
    const fluxo = {
      criado: 'em_separacao',
      cancelamento_solicitado: null, // Admin must decide: cancel or continue
      em_separacao: 'pronto',
      pronto: 'entregue',
    };
    return fluxo[statusAtual] || null;
  };

  if (loading && pedidos.length === 0) {
    return <div className="loading-screen">Carregando...</div>;
  }

  return (
    <div className="gerenciar-pedidos-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">
            <FiPackage /> Gerenciar Pedidos
          </h1>
          <button className="btn btn-outline" onClick={() => loadPedidos()}>
            <FiRefreshCw /> Atualizar
          </button>
        </div>

        <div className="filtros">
          <div className="filtro-grupo">
            <FiFilter />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pedidos.length === 0 ? (
          <div className="empty-state">
            <FiPackage />
            <h2>Nenhum pedido encontrado</h2>
            <p>Não há pedidos com o filtro selecionado</p>
          </div>
        ) : (
          <>
            <div className="pedidos-admin-lista">
              {pedidos.map((pedido) => {
                const status = statusLabels[pedido.status];
                const proximoStatus = getProximoStatus(pedido.status);

                return (
                  <div key={pedido.id} className="pedido-admin-card">
                    <div className="pedido-admin-header">
                      <div className="pedido-info-principal">
                        <span className="pedido-codigo">#{pedido.codigo}</span>
                        <span className={`badge ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                      <span className="pedido-data">
                        {new Date(pedido.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="pedido-admin-body">
                      <div className="pedido-cliente">
                        <strong>Cliente:</strong> {pedido.user?.nome || 'N/A'}
                        <br />
                        <small>{pedido.user?.email}</small>
                      </div>
                      <div className="pedido-resumo">
                        <span>{pedido.itens?.length || 0} itens</span>
                        <span className="pedido-total">
                          R$ {Number(pedido.total).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="pedido-admin-actions">
                      <Link
                        to={`/admin/pedidos/${pedido.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        Ver Detalhes <FiChevronRight />
                      </Link>

                      {proximoStatus && pedido.status !== 'cancelado' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => atualizarStatus(pedido.id, proximoStatus)}
                        >
                          {proximoStatus === 'em_separacao' && 'Iniciar Separação'}
                          {proximoStatus === 'pronto' && 'Marcar como Pronto'}
                          {proximoStatus === 'entregue' && 'Confirmar Entrega'}
                        </button>
                      )}

                      {pedido.status === 'cancelamento_solicitado' && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => atualizarStatus(pedido.id, 'em_separacao')}
                          >
                            Continuar Pedido
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => atualizarStatus(pedido.id, 'cancelado')}
                          >
                            Confirmar Cancelamento
                          </button>
                        </>
                      )}

                      {pedido.status === 'criado' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => atualizarStatus(pedido.id, 'cancelado')}
                        >
                          Cancelar Pedido
                        </button>
                      )}
                    </div>
                  </div>
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

export default GerenciarPedidos;
