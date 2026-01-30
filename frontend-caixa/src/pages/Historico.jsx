import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaReceipt, FaCalendarAlt, FaEye } from 'react-icons/fa';
import './Historico.css';

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

export default function Historico() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumoDia, setResumoDia] = useState({ total: 0, quantidade: 0 });
  const [filtroData, setFiltroData] = useState(
    new Date().toISOString().split('T')[0]
  );

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
      
      const total = vendasData.reduce((acc, v) => acc + parseFloat(v.total), 0);
      setResumoDia({ total, quantidade: vendasData.length });
    } catch (error) {
      toast.error('Erro ao carregar histórico');
      setVendas([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="historico-page">
      <div className="historico-header">
        <h1><FaReceipt /> Histórico de Vendas</h1>
        
        <div className="filtro-data">
          <FaCalendarAlt />
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
          />
        </div>
      </div>

      <div className="resumo-dia">
        <div className="resumo-card">
          <span className="resumo-label">Vendas do Dia</span>
          <span className="resumo-valor">{resumoDia.quantidade}</span>
        </div>
        <div className="resumo-card destaque">
          <span className="resumo-label">Total do Dia</span>
          <span className="resumo-valor">{formatCurrency(resumoDia.total)}</span>
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
        <div className="vendas-lista">
          <table className="vendas-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Data/Hora</th>
                <th>Itens</th>
                <th>Pagamento</th>
                <th>Total</th>
                <th>Operador</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vendas.map(venda => (
                <tr key={venda.id}>
                  <td className="venda-id">#{venda.id}</td>
                  <td>{formatDate(venda.created_at)}</td>
                  <td>{venda.itens?.length || venda.itens_count || '-'}</td>
                  <td>
                    <span className={`badge badge-${venda.forma_pagamento}`}>
                      {formasPagamentoLabel[venda.forma_pagamento]}
                    </span>
                  </td>
                  <td className="venda-total">{formatCurrency(venda.total)}</td>
                  <td>{venda.usuario?.nome || '-'}</td>
                  <td>
                    <Link to={`/venda/${venda.id}`} className="btn-ver">
                      <FaEye /> Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
