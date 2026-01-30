import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import {
  FaCog,
  FaCalendarAlt,
  FaEye,
  FaBan,
  FaReceipt,
  FaChartBar,
  FaExclamationTriangle
} from 'react-icons/fa';
import './Gestao.css';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formasPagamentoLabel = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  pix: 'PIX'
};

const statusLabel = {
  finalizada: { label: 'Finalizada', class: 'status-success' },
  cancelada: { label: 'Cancelada', class: 'status-danger' }
};

export default function Gestao() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState({ total: 0, quantidade: 0, canceladas: 0 });
  const [filtroData, setFiltroData] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const isAdmin = user?.perfil === 'admin';

  useEffect(() => {
    fetchVendas();
  }, [filtroData]);

  const fetchVendas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendas', {
        params: { data: filtroData }
      });
      
      const vendasData = response.data.data || response.data;
      setVendas(Array.isArray(vendasData) ? vendasData : []);
      
      // Calcular resumo
      const finalizadas = vendasData.filter(v => v.status !== 'cancelada');
      const canceladas = vendasData.filter(v => v.status === 'cancelada');
      const total = finalizadas.reduce((acc, v) => acc + parseFloat(v.total), 0);
      
      setResumo({ 
        total, 
        quantidade: finalizadas.length,
        canceladas: canceladas.length 
      });
    } catch (error) {
      toast.error('Erro ao carregar vendas');
      setVendas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarVenda = async () => {
    if (!vendaSelecionada) return;
    
    setCancelando(true);
    try {
      await api.post(`/vendas/${vendaSelecionada.id}/cancelar`);
      toast.success('Venda cancelada com sucesso!');
      setShowConfirmCancel(false);
      setVendaSelecionada(null);
      fetchVendas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao cancelar venda');
    } finally {
      setCancelando(false);
    }
  };

  const openCancelModal = (venda) => {
    setVendaSelecionada(venda);
    setShowConfirmCancel(true);
  };

  if (!isAdmin) {
    return (
      <div className="gestao-page">
        <div className="acesso-negado">
          <FaExclamationTriangle />
          <h2>Acesso Restrito</h2>
          <p>Apenas administradores podem acessar a gestão do PDV.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gestao-page">
      <div className="gestao-header">
        <h1><FaCog /> Gestão do PDV</h1>
        
        <div className="filtro-data">
          <FaCalendarAlt />
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </div>
      </div>

      <div className="resumo-gestao">
        <div className="resumo-card">
          <FaReceipt className="resumo-icon" />
          <div className="resumo-content">
            <span className="resumo-label">Vendas Realizadas</span>
            <span className="resumo-valor">{resumo.quantidade}</span>
          </div>
        </div>
        <div className="resumo-card destaque">
          <FaChartBar className="resumo-icon" />
          <div className="resumo-content">
            <span className="resumo-label">Total do Dia</span>
            <span className="resumo-valor">{formatCurrency(resumo.total)}</span>
          </div>
        </div>
        <div className="resumo-card canceladas">
          <FaBan className="resumo-icon" />
          <div className="resumo-content">
            <span className="resumo-label">Canceladas</span>
            <span className="resumo-valor">{resumo.canceladas}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando vendas...</p>
        </div>
      ) : vendas.length === 0 ? (
        <div className="empty-state">
          <FaReceipt />
          <p>Nenhuma venda encontrada para esta data</p>
        </div>
      ) : (
        <div className="vendas-table-container">
          <table className="vendas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data/Hora</th>
                <th>Operador</th>
                <th>Pagamento</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map(venda => {
                const status = statusLabel[venda.status] || statusLabel.finalizada;
                return (
                  <tr key={venda.id} className={venda.status === 'cancelada' ? 'row-cancelada' : ''}>
                    <td>#{venda.id}</td>
                    <td>{formatDate(venda.created_at)}</td>
                    <td>{venda.usuario?.nome || '-'}</td>
                    <td>{formasPagamentoLabel[venda.forma_pagamento]}</td>
                    <td className="total">{formatCurrency(venda.total)}</td>
                    <td>
                      <span className={`status-badge ${status.class}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <div className="acoes-cell">
                        <button
                          className="btn-acao btn-ver"
                          onClick={() => navigate(`/venda/${venda.id}`)}
                          title="Ver detalhes"
                        >
                          <FaEye />
                        </button>
                        {venda.status !== 'cancelada' && (
                          <button
                            className="btn-acao btn-cancelar"
                            onClick={() => openCancelModal(venda)}
                            title="Cancelar venda"
                          >
                            <FaBan />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmação de cancelamento */}
      {showConfirmCancel && vendaSelecionada && (
        <div className="modal-overlay" onClick={() => setShowConfirmCancel(false)}>
          <div className="modal-content modal-cancelar" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-danger">
              <FaExclamationTriangle />
            </div>
            <h2>Cancelar Venda</h2>
            <p>Tem certeza que deseja cancelar a venda <strong>#{vendaSelecionada.id}</strong>?</p>
            <p className="modal-venda-info">
              Valor: <strong>{formatCurrency(vendaSelecionada.total)}</strong>
            </p>
            <p className="modal-warning">
              Esta ação irá estornar o estoque dos produtos e não pode ser desfeita.
            </p>
            
            <div className="modal-acoes">
              <button 
                className="btn-secondary" 
                onClick={() => setShowConfirmCancel(false)}
                disabled={cancelando}
              >
                Não, manter venda
              </button>
              <button
                className="btn-danger"
                onClick={handleCancelarVenda}
                disabled={cancelando}
              >
                {cancelando ? 'Cancelando...' : 'Sim, cancelar venda'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
