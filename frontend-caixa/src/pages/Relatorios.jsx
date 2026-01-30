import { useState, useEffect } from 'react';
import { FiCalendar, FiDollarSign, FiTrendingUp, FiPackage, FiCreditCard, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import api from '../services/api';
import './Relatorios.css';

function Relatorios() {
  const [resumoCaixa, setResumoCaixa] = useState(null);
  const [comparativo, setComparativo] = useState(null);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    carregarDados();
  }, [dataFiltro]);

  async function carregarDados() {
    setLoading(true);
    try {
      const [resumoRes, comparativoRes, produtosRes] = await Promise.all([
        api.get('/relatorios/resumo-caixa'),
        api.get('/relatorios/comparativo'),
        api.get('/relatorios/produtos-mais-vendidos', { params: { limite: 5 } }),
      ]);

      setResumoCaixa(resumoRes.data);
      setComparativo(comparativoRes.data);
      setProdutosMaisVendidos(produtosRes.data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  }

  function calcularVariacao(atual, anterior) {
    if (!anterior || anterior === 0) return null;
    return ((atual - anterior) / anterior * 100).toFixed(1);
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  const variacaoOntem = comparativo ? calcularVariacao(comparativo.hoje.total, comparativo.ontem.total) : null;
  const variacaoSemana = comparativo ? calcularVariacao(comparativo.hoje.total, comparativo.semana_passada.total) : null;

  return (
    <div className="relatorios-page">
      <div className="page-header">
        <h1>Relatórios</h1>
        <div className="filtro-data">
          <FiCalendar />
          <input
            type="date"
            value={dataFiltro}
            onChange={(e) => setDataFiltro(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="cards-grid">
        <div className="card card-destaque">
          <div className="card-icon">
            <FiDollarSign />
          </div>
          <div className="card-content">
            <span className="card-label">Total do Dia</span>
            <span className="card-value">
              R$ {resumoCaixa?.total_liquido?.toFixed(2) || '0.00'}
            </span>
            {variacaoOntem !== null && (
              <span className={`card-variacao ${Number(variacaoOntem) >= 0 ? 'positiva' : 'negativa'}`}>
                {Number(variacaoOntem) >= 0 ? <FiArrowUp /> : <FiArrowDown />}
                {Math.abs(variacaoOntem)}% vs ontem
              </span>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiPackage />
          </div>
          <div className="card-content">
            <span className="card-label">Vendas Realizadas</span>
            <span className="card-value">{resumoCaixa?.vendas_realizadas || 0}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiTrendingUp />
          </div>
          <div className="card-content">
            <span className="card-label">Ticket Médio</span>
            <span className="card-value">
              R$ {resumoCaixa?.vendas_realizadas > 0 
                ? (resumoCaixa.total_liquido / resumoCaixa.vendas_realizadas).toFixed(2) 
                : '0.00'}
            </span>
          </div>
        </div>

        <div className="card">
          <div className="card-icon cancelado">
            <FiCreditCard />
          </div>
          <div className="card-content">
            <span className="card-label">Canceladas</span>
            <span className="card-value cancelado">{resumoCaixa?.vendas_canceladas || 0}</span>
          </div>
        </div>
      </div>

      {/* Seção de Formas de Pagamento */}
      <div className="section">
        <h2>Formas de Pagamento</h2>
        <div className="pagamentos-grid">
          <div className="pagamento-card">
            <span className="pagamento-label">Dinheiro</span>
            <span className="pagamento-qtd">{resumoCaixa?.formas_pagamento?.dinheiro?.quantidade || 0} vendas</span>
            <span className="pagamento-valor">R$ {resumoCaixa?.formas_pagamento?.dinheiro?.valor?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="pagamento-card">
            <span className="pagamento-label">Cartão</span>
            <span className="pagamento-qtd">{resumoCaixa?.formas_pagamento?.cartao?.quantidade || 0} vendas</span>
            <span className="pagamento-valor">R$ {resumoCaixa?.formas_pagamento?.cartao?.valor?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="pagamento-card">
            <span className="pagamento-label">PIX</span>
            <span className="pagamento-qtd">{resumoCaixa?.formas_pagamento?.pix?.quantidade || 0} vendas</span>
            <span className="pagamento-valor">R$ {resumoCaixa?.formas_pagamento?.pix?.valor?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      {/* Comparativo */}
      {comparativo && (
        <div className="section">
          <h2>Comparativo</h2>
          <div className="comparativo-grid">
            <div className="comparativo-card">
              <span className="comparativo-label">Hoje</span>
              <span className="comparativo-valor">R$ {comparativo.hoje.total.toFixed(2)}</span>
              <span className="comparativo-qtd">{comparativo.hoje.quantidade} vendas</span>
            </div>
            <div className="comparativo-card">
              <span className="comparativo-label">Ontem</span>
              <span className="comparativo-valor">R$ {comparativo.ontem.total.toFixed(2)}</span>
              <span className="comparativo-qtd">{comparativo.ontem.quantidade} vendas</span>
            </div>
            <div className="comparativo-card">
              <span className="comparativo-label">Semana Passada</span>
              <span className="comparativo-valor">R$ {comparativo.semana_passada.total.toFixed(2)}</span>
              <span className="comparativo-qtd">{comparativo.semana_passada.quantidade} vendas</span>
            </div>
          </div>
        </div>
      )}

      {/* Produtos Mais Vendidos */}
      <div className="section">
        <h2>Produtos Mais Vendidos</h2>
        {produtosMaisVendidos.length > 0 ? (
          <table className="tabela-produtos">
            <thead>
              <tr>
                <th>#</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {produtosMaisVendidos.map((produto, index) => (
                <tr key={produto.produto_id}>
                  <td>{index + 1}</td>
                  <td>{produto.produto_nome}</td>
                  <td>{produto.quantidade}</td>
                  <td>R$ {produto.valor_total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="sem-dados">Nenhum produto vendido ainda</p>
        )}
      </div>
    </div>
  );
}

export default Relatorios;
