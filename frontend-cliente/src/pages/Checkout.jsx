import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiCheck, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useCarrinho } from '../contexts/CarrinhoContext';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { itens, total, recarregar } = useCarrinho();
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [trocoPara, setTrocoPara] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEnderecos, setLoadingEnderecos] = useState(true);

  const taxaEntrega = 5.00;
  const totalFinal = Number(total) + taxaEntrega;

  useEffect(() => {
    if (itens.length === 0) {
      navigate('/carrinho');
      return;
    }
    loadEnderecos();
  }, [itens, navigate]);

  async function loadEnderecos() {
    try {
      const response = await api.get('/enderecos');
      setEnderecos(response.data);
      const principal = response.data.find((e) => e.principal);
      if (principal) {
        setEnderecoSelecionado(principal.id);
      } else if (response.data.length > 0) {
        setEnderecoSelecionado(response.data[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    } finally {
      setLoadingEnderecos(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!enderecoSelecionado) {
      toast.error('Selecione um endereço de entrega');
      return;
    }

    if (!formaPagamento) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/pedidos', {
        endereco_id: enderecoSelecionado,
        forma_pagamento: formaPagamento,
        troco_para: formaPagamento === 'dinheiro' ? parseFloat(trocoPara) || null : null,
        observacoes: observacoes || null,
        taxa_entrega: taxaEntrega,
      });

      await recarregar();
      toast.success('Pedido realizado com sucesso!');
      navigate(`/pedidos/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao finalizar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loadingEnderecos) {
    return <div className="loading-screen">Carregando...</div>;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="page-title">Finalizar Pedido</h1>

        <form onSubmit={handleSubmit} className="checkout-content">
          <div className="checkout-main">
            <section className="checkout-section">
              <h2>
                <FiMapPin /> Endereço de Entrega
              </h2>

              {enderecos.length === 0 ? (
                <div className="sem-endereco">
                  <p>Você ainda não tem endereços cadastrados</p>
                  <Link 
                    to="/enderecos/novo" 
                    state={{ returnTo: '/checkout' }}
                    className="btn btn-outline"
                  >
                    <FiPlus /> Adicionar Endereço
                  </Link>
                </div>
              ) : (
                <div className="enderecos-lista">
                  {enderecos.map((endereco) => (
                    <label
                      key={endereco.id}
                      className={`endereco-option ${enderecoSelecionado === endereco.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="endereco"
                        value={endereco.id}
                        checked={enderecoSelecionado === endereco.id}
                        onChange={() => setEnderecoSelecionado(endereco.id)}
                      />
                      <div className="endereco-info">
                        <p className="endereco-linha">
                          {endereco.logradouro}, {endereco.numero}
                          {endereco.complemento && ` - ${endereco.complemento}`}
                        </p>
                        <p className="endereco-linha-2">
                          {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                        </p>
                        <p className="endereco-cep">CEP: {endereco.cep}</p>
                      </div>
                      <span className="check-icon">
                        <FiCheck />
                      </span>
                    </label>
                  ))}
                  <Link 
                    to="/enderecos/novo" 
                    state={{ returnTo: '/checkout' }}
                    className="adicionar-endereco"
                  >
                    <FiPlus /> Adicionar novo endereço
                  </Link>
                </div>
              )}
            </section>

            <section className="checkout-section">
              <h2>
                <FiCreditCard /> Forma de Pagamento
              </h2>

              <div className="pagamento-options">
                <label className={`pagamento-option ${formaPagamento === 'pix' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="pagamento"
                    value="pix"
                    checked={formaPagamento === 'pix'}
                    onChange={() => setFormaPagamento('pix')}
                  />
                  <span className="pagamento-label">PIX</span>
                  <span className="check-icon">
                    <FiCheck />
                  </span>
                </label>

                <label className={`pagamento-option ${formaPagamento === 'cartao' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="pagamento"
                    value="cartao"
                    checked={formaPagamento === 'cartao'}
                    onChange={() => setFormaPagamento('cartao')}
                  />
                  <span className="pagamento-label">Cartão na Entrega</span>
                  <span className="check-icon">
                    <FiCheck />
                  </span>
                </label>

                <label className={`pagamento-option ${formaPagamento === 'dinheiro' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="pagamento"
                    value="dinheiro"
                    checked={formaPagamento === 'dinheiro'}
                    onChange={() => setFormaPagamento('dinheiro')}
                  />
                  <span className="pagamento-label">Dinheiro</span>
                  <span className="check-icon">
                    <FiCheck />
                  </span>
                </label>
              </div>

              {formaPagamento === 'dinheiro' && (
                <div className="troco-input">
                  <label>Troco para quanto?</label>
                  <input
                    type="number"
                    value={trocoPara}
                    onChange={(e) => setTrocoPara(e.target.value)}
                    placeholder="Deixe em branco se não precisar de troco"
                    min={totalFinal}
                    step="0.01"
                  />
                </div>
              )}
            </section>

            <section className="checkout-section">
              <h2>Observações</h2>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Alguma observação sobre o pedido? (opcional)"
                rows={3}
              />
            </section>
          </div>

          <div className="checkout-sidebar">
            <div className="resumo-pedido">
              <h3>Resumo do Pedido</h3>

              <div className="resumo-itens">
                {itens.map((item) => (
                  <div key={item.id} className="resumo-item">
                    <span className="item-qtd">{item.quantidade}x</span>
                    <span className="item-nome">{item.produto?.nome}</span>
                    <span className="item-valor">
                      R$ {(item.quantidade * (item.produto?.preco_promocional || item.produto?.preco)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="resumo-totais">
                <div className="resumo-linha">
                  <span>Subtotal</span>
                  <span>R$ {Number(total).toFixed(2)}</span>
                </div>
                <div className="resumo-linha">
                  <span>Taxa de Entrega</span>
                  <span>R$ {taxaEntrega.toFixed(2)}</span>
                </div>
                <div className="resumo-total">
                  <span>Total</span>
                  <span>R$ {totalFinal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={loading || !enderecoSelecionado || !formaPagamento}
              >
                {loading ? 'Finalizando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;
