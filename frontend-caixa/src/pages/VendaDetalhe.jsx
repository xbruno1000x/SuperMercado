import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaReceipt, FaPrint } from 'react-icons/fa';
import './VendaDetalhe.css';

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
    minute: '2-digit',
    second: '2-digit'
  });
};

const formasPagamentoLabel = {
  dinheiro: 'Dinheiro',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito',
  pix: 'PIX'
};

export default function VendaDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venda, setVenda] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVenda();
  }, [id]);

  const fetchVenda = async () => {
    try {
      const response = await api.get(`/vendas/${id}`);
      setVenda(response.data);
    } catch {
      toast.error('Erro ao carregar venda');
      navigate('/historico');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!venda) {
    return null;
  }

  return (
    <div className="venda-detalhe-page">
      <div className="venda-detalhe-header">
        <button className="btn-voltar" onClick={() => navigate('/historico')}>
          <FaArrowLeft /> Voltar
        </button>
        <button className="btn-print" onClick={handlePrint}>
          <FaPrint /> Imprimir
        </button>
      </div>

      <div className="cupom">
        <div className="cupom-header">
          <FaReceipt className="cupom-icon" />
          <h1>SuperMercado</h1>
          <p>CNPJ: 00.000.000/0001-00</p>
          <p>Av. Principal, 1000 - Centro</p>
        </div>

        <div className="cupom-divider"></div>

        <div className="cupom-info">
          <div className="info-row">
            <span>Venda #</span>
            <span>{venda.id}</span>
          </div>
          <div className="info-row">
            <span>Data</span>
            <span>{formatDate(venda.created_at)}</span>
          </div>
          <div className="info-row">
            <span>Operador</span>
            <span>{venda.usuario?.nome || '-'}</span>
          </div>
          <div className="info-row">
            <span>Pagamento</span>
            <span>{formasPagamentoLabel[venda.forma_pagamento]}</span>
          </div>
        </div>

        <div className="cupom-divider"></div>

        <table className="cupom-itens">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qtd</th>
              <th>Unit.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {venda.itens?.map((item, index) => (
              <tr key={index}>
                <td>{item.produto?.nome || `Produto #${item.produto_id}`}</td>
                <td>{item.quantidade}</td>
                <td>{formatCurrency(item.preco_unitario)}</td>
                <td>{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cupom-divider"></div>

        <div className="cupom-totais">
          <div className="total-row">
            <span>Subtotal</span>
            <span>{formatCurrency(venda.subtotal)}</span>
          </div>
          {venda.desconto > 0 && (
            <div className="total-row desconto">
              <span>Desconto</span>
              <span>- {formatCurrency(venda.desconto)}</span>
            </div>
          )}
          <div className="total-row total-final">
            <span>TOTAL</span>
            <span>{formatCurrency(venda.total)}</span>
          </div>
        </div>

        <div className="cupom-divider"></div>

        <div className="cupom-footer">
          <p>Obrigado pela preferência!</p>
          <p>Volte sempre</p>
        </div>
      </div>
    </div>
  );
}
