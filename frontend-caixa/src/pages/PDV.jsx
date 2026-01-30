import { useState, useRef, useEffect, useCallback } from 'react';
import { useVenda } from '../contexts/VendaContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import {
  FaBarcode,
  FaSearch,
  FaTrash,
  FaPlus,
  FaMinus,
  FaTimes,
  FaCheck,
  FaMoneyBillWave,
  FaCreditCard,
  FaQrcode,
  FaPrint,
  FaReceipt
} from 'react-icons/fa';
import './PDV.css';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default function PDV() {
  const {
    itens,
    adicionarItem,
    removerItem,
    alterarQuantidade,
    limparVenda,
    getTotal,
    finalizarVenda,
    loading
  } = useVenda();

  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [produtosEstoque, setProdutosEstoque] = useState({});
  const [vendaFinalizada, setVendaFinalizada] = useState(null);
  const [showRecibo, setShowRecibo] = useState(false);
  
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F4 - Cancelar venda
      if (e.key === 'F4') {
        e.preventDefault();
        if (!showModal && !showRecibo) {
          handleCancelarVenda();
        }
      }
      // F12 - Finalizar venda
      if (e.key === 'F12') {
        e.preventDefault();
        if (!showModal && !showRecibo && itens.length > 0) {
          handleAbrirFinalizacao();
        }
      }
      // ESC - Fechar modais
      if (e.key === 'Escape') {
        if (showModal) {
          setShowModal(false);
        }
        if (showRecibo) {
          setShowRecibo(false);
          setVendaFinalizada(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itens, showModal, showRecibo]);

  const buscarProduto = useCallback(async (termo) => {
    if (!termo.trim()) {
      setResultados([]);
      return;
    }

    setBuscando(true);
    try {
      const response = await api.get('/produtos/busca', { params: { termo } });
      const produtos = response.data;
      setResultados(produtos);
      
      const estoqueMap = {};
      produtos.forEach(p => {
        estoqueMap[p.id] = p.estoque_atual;
      });
      setProdutosEstoque(prev => ({ ...prev, ...estoqueMap }));
      
      if (produtos.length === 1 && produtos[0].codigo_barras === termo) {
        handleAdicionarProduto(produtos[0]);
        setBusca('');
        setResultados([]);
      }
    } catch {
      toast.error('Erro ao buscar produto');
    } finally {
      setBuscando(false);
    }
  }, []);

  const handleBuscaChange = (e) => {
    const valor = e.target.value;
    setBusca(valor);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      buscarProduto(valor);
    }, 300);
  };

  const handleBuscaKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      buscarProduto(busca);
    }
  };

  const handleAdicionarProduto = (produto) => {
    adicionarItem(produto, 1);
    setBusca('');
    setResultados([]);
    inputRef.current?.focus();
  };

  const handleQuantidadeChange = (produtoId, novaQtd) => {
    const estoque = produtosEstoque[produtoId] || 999;
    alterarQuantidade(produtoId, novaQtd, estoque);
  };

  const handleCancelarVenda = () => {
    if (itens.length === 0) return;
    
    if (confirm('Deseja cancelar a venda atual?')) {
      limparVenda();
      toast.info('Venda cancelada');
      inputRef.current?.focus();
    }
  };

  const handleAbrirFinalizacao = () => {
    if (itens.length === 0) {
      toast.warning('Adicione itens à venda');
      return;
    }
    setShowModal(true);
  };

  const handleFinalizarVenda = async () => {
    try {
      const venda = await finalizarVenda(formaPagamento);
      toast.success(`Venda #${venda.id} finalizada com sucesso!`);
      setShowModal(false);
      setFormaPagamento('dinheiro');
      
      // Carregar dados completos da venda para o recibo
      const response = await api.get(`/vendas/${venda.id}`);
      setVendaFinalizada(response.data);
      setShowRecibo(true);
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Erro ao finalizar venda');
      }
    }
  };

  const handleFecharRecibo = () => {
    setShowRecibo(false);
    setVendaFinalizada(null);
    inputRef.current?.focus();
  };

  const handleImprimirRecibo = () => {
    window.print();
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

  const total = getTotal();

  return (
    <div className="pdv-page">
      <div className="pdv-main">
        <div className="busca-container">
          <div className="busca-input-wrapper">
            <FaBarcode className="busca-icon" />
            <input
              ref={inputRef}
              type="text"
              value={busca}
              onChange={handleBuscaChange}
              onKeyDown={handleBuscaKeyDown}
              placeholder="Digite o código de barras ou nome do produto..."
              className="busca-input"
            />
            {buscando && <div className="spinner-small"></div>}
          </div>

          {resultados.length > 0 && (
            <div className="resultados-lista">
              {resultados.map(produto => (
                <button
                  key={produto.id}
                  className="resultado-item"
                  onClick={() => handleAdicionarProduto(produto)}
                >
                  <div className="resultado-info">
                    <span className="resultado-nome">{produto.nome}</span>
                    <span className="resultado-codigo">{produto.codigo_barras}</span>
                  </div>
                  <div className="resultado-preco">
                    {formatCurrency(produto.preco)}
                  </div>
                  <div className="resultado-estoque">
                    Estoque: {produto.estoque_atual}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="itens-lista">
          {itens.length === 0 ? (
            <div className="empty-state">
              <FaSearch />
              <p>Busque produtos para adicionar à venda</p>
            </div>
          ) : (
            <table className="itens-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço Unit.</th>
                  <th>Qtd</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {itens.map(item => (
                  <tr key={item.produto_id}>
                    <td>
                      <div className="item-nome">{item.nome}</div>
                      <div className="item-codigo">{item.codigo_barras}</div>
                    </td>
                    <td>{formatCurrency(item.preco_unitario)}</td>
                    <td>
                      <div className="qtd-controls">
                        <button
                          onClick={() => handleQuantidadeChange(item.produto_id, item.quantidade - 1)}
                        >
                          <FaMinus />
                        </button>
                        <span>{item.quantidade}</span>
                        <button
                          onClick={() => handleQuantidadeChange(item.produto_id, item.quantidade + 1)}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </td>
                    <td className="subtotal">{formatCurrency(item.subtotal)}</td>
                    <td>
                      <button
                        className="btn-remover"
                        onClick={() => removerItem(item.produto_id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="pdv-sidebar">
        <div className="total-display">
          <span className="total-label">Total</span>
          <span className="total-valor">{formatCurrency(total)}</span>
        </div>

        <div className="acoes">
          <button
            className="btn-cancelar"
            onClick={handleCancelarVenda}
            disabled={itens.length === 0}
          >
            <FaTimes /> Cancelar (F4)
          </button>
          <button
            className="btn-finalizar"
            onClick={handleAbrirFinalizacao}
            disabled={itens.length === 0 || loading}
          >
            <FaCheck /> Finalizar (F12)
          </button>
        </div>

        <div className="atalhos">
          <h4>Atalhos</h4>
          <ul>
            <li><kbd>Enter</kbd> Buscar produto</li>
            <li><kbd>F4</kbd> Cancelar venda</li>
            <li><kbd>F12</kbd> Finalizar venda</li>
          </ul>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Finalizar Venda</h2>
            
            <div className="modal-total">
              <span>Total a Pagar</span>
              <span className="modal-total-valor">{formatCurrency(total)}</span>
            </div>

            <div className="forma-pagamento">
              <label>Forma de Pagamento</label>
              <div className="pagamento-opcoes">
                <button
                  className={formaPagamento === 'dinheiro' ? 'active' : ''}
                  onClick={() => setFormaPagamento('dinheiro')}
                >
                  <FaMoneyBillWave /> Dinheiro
                </button>
                <button
                  className={formaPagamento === 'cartao_credito' ? 'active' : ''}
                  onClick={() => setFormaPagamento('cartao_credito')}
                >
                  <FaCreditCard /> Crédito
                </button>
                <button
                  className={formaPagamento === 'cartao_debito' ? 'active' : ''}
                  onClick={() => setFormaPagamento('cartao_debito')}
                >
                  <FaCreditCard /> Débito
                </button>
                <button
                  className={formaPagamento === 'pix' ? 'active' : ''}
                  onClick={() => setFormaPagamento('pix')}
                >
                  <FaQrcode /> PIX
                </button>
              </div>
            </div>

            <div className="modal-acoes">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button
                className="btn-success"
                onClick={handleFinalizarVenda}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recibo */}
      {showRecibo && vendaFinalizada && (
        <div className="modal-overlay recibo-overlay">
          <div className="modal-content recibo-modal" onClick={e => e.stopPropagation()}>
            <div className="recibo-header-actions no-print">
              <button className="btn-print" onClick={handleImprimirRecibo}>
                <FaPrint /> Imprimir
              </button>
              <button className="btn-fechar" onClick={handleFecharRecibo}>
                <FaTimes /> Fechar (ESC)
              </button>
            </div>
            
            <div className="cupom-print">
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
                  <span>{vendaFinalizada.id}</span>
                </div>
                <div className="info-row">
                  <span>Data</span>
                  <span>{formatDate(vendaFinalizada.created_at)}</span>
                </div>
                <div className="info-row">
                  <span>Operador</span>
                  <span>{vendaFinalizada.usuario?.nome || '-'}</span>
                </div>
                <div className="info-row">
                  <span>Pagamento</span>
                  <span>{formasPagamentoLabel[vendaFinalizada.forma_pagamento]}</span>
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
                  {vendaFinalizada.itens?.map((item, index) => (
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
                  <span>{formatCurrency(vendaFinalizada.subtotal)}</span>
                </div>
                {vendaFinalizada.desconto > 0 && (
                  <div className="total-row desconto">
                    <span>Desconto</span>
                    <span>- {formatCurrency(vendaFinalizada.desconto)}</span>
                  </div>
                )}
                <div className="total-row total-final">
                  <span>TOTAL</span>
                  <span>{formatCurrency(vendaFinalizada.total)}</span>
                </div>
              </div>

              <div className="cupom-divider"></div>

              <div className="cupom-footer">
                <p>Obrigado pela preferência!</p>
                <p>Volte sempre</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
