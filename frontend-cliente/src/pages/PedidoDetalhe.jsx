import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiCreditCard, FiClock, FiXCircle, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import './PedidoDetalhe.css';

const statusLabels = {
  criado: { label: 'Pedido Recebido', class: 'badge-warning' },
  em_separacao: { label: 'Em Separação', class: 'badge-info' },
  pronto: { label: 'Pronto para Entrega', class: 'badge-success' },
  entregue: { label: 'Entregue', class: 'badge-success' },
  cancelado: { label: 'Cancelado', class: 'badge-danger' },
  cancelamento_solicitado: { label: 'Cancelamento Solicitado', class: 'badge-warning' },
};

const statusOrder = ['criado', 'em_separacao', 'pronto', 'entregue'];

const pagamentoLabels = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'PIX',
};

function PedidoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solicitandoCancelamento, setSolicitandoCancelamento] = useState(false);

  useEffect(() => {
    loadPedido();
  }, [id]);

  async function loadPedido() {
    try {
      const response = await api.get(`/pedidos/${id}`);
      setPedido(response.data);
    } catch (error) {
      navigate('/pedidos');
    } finally {
      setLoading(false);
    }
  }

  async function solicitarCancelamento() {
    if (!window.confirm('Tem certeza que deseja solicitar o cancelamento deste pedido?')) {
      return;
    }

    setSolicitandoCancelamento(true);
    try {
      await api.post(`/pedidos/${id}/solicitar-cancelamento`);
      toast.success('Solicitação de cancelamento enviada com sucesso');
      loadPedido();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao solicitar cancelamento');
    } finally {
      setSolicitandoCancelamento(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  if (!pedido) return null;

  const status = statusLabels[pedido.status];
  const statusIndex = statusOrder.indexOf(pedido.status);
  const podeModificar = pedido.status === 'criado';

  return (
    <div className="pedido-detalhe">
      <div className="container">
        <button onClick={() => navigate('/pedidos')} className="voltar-btn">
          <FiArrowLeft /> Voltar
        </button>

        <div className="pedido-detalhe-header">
          <div>
            <h1>Pedido #{pedido.codigo}</h1>
            <p className="pedido-data">
              <FiClock />
              {new Date(pedido.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span className={`badge badge-lg ${status.class}`}>{status.label}</span>
        </div>

        {pedido.status !== 'cancelado' && (
          <div className="status-timeline">
            {statusOrder.map((s, index) => (
              <div
                key={s}
                className={`timeline-step ${index <= statusIndex ? 'completed' : ''}`}
              >
                <div className="timeline-dot"></div>
                <span className="timeline-label">{statusLabels[s].label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ações do Cliente */}
        {podeModificar && (
          <div className="pedido-acoes-cliente">
            <Link to={`/pedidos/${id}/adicionar-itens`} className="btn btn-outline">
              <FiPlus /> Adicionar mais itens
            </Link>
            <button 
              className="btn btn-danger" 
              onClick={solicitarCancelamento}
              disabled={solicitandoCancelamento}
            >
              <FiXCircle /> {solicitandoCancelamento ? 'Solicitando...' : 'Solicitar Cancelamento'}
            </button>
          </div>
        )}

        {pedido.status === 'cancelamento_solicitado' && (
          <div className="aviso-cancelamento">
            <FiXCircle />
            <p>Você solicitou o cancelamento deste pedido. Aguarde a confirmação da loja.</p>
          </div>
        )}

        <div className="pedido-detalhe-content">
          <div className="pedido-detalhe-main">
            <section className="detalhe-section">
              <h2>Itens do Pedido</h2>
              <div className="itens-lista">
                {pedido.itens?.map((item) => (
                  <div key={item.id} className="item-row">
                    <span className="item-qtd">{item.quantidade}x</span>
                    <span className="item-nome">{item.produto_nome}</span>
                    <span className="item-preco">
                      R$ {Number(item.preco_unitario).toFixed(2)}
                    </span>
                    <span className="item-subtotal">
                      R$ {Number(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {pedido.endereco && (
              <section className="detalhe-section">
                <h2>
                  <FiMapPin /> Endereço de Entrega
                </h2>
                <div className="endereco-box">
                  <p>
                    {pedido.endereco.logradouro}, {pedido.endereco.numero}
                    {pedido.endereco.complemento && ` - ${pedido.endereco.complemento}`}
                  </p>
                  <p>
                    {pedido.endereco.bairro} - {pedido.endereco.cidade}/
                    {pedido.endereco.estado}
                  </p>
                  <p>CEP: {pedido.endereco.cep}</p>
                </div>
              </section>
            )}

            {pedido.observacoes && (
              <section className="detalhe-section">
                <h2>Observações</h2>
                <p className="observacoes-text">{pedido.observacoes}</p>
              </section>
            )}
          </div>

          <div className="pedido-detalhe-sidebar">
            <div className="resumo-box">
              <h3>Resumo</h3>

              <div className="resumo-linha">
                <span>Subtotal</span>
                <span>R$ {Number(pedido.subtotal).toFixed(2)}</span>
              </div>

              <div className="resumo-linha">
                <span>Taxa de Entrega</span>
                <span>R$ {Number(pedido.taxa_entrega).toFixed(2)}</span>
              </div>

              {pedido.desconto > 0 && (
                <div className="resumo-linha desconto">
                  <span>Desconto</span>
                  <span>- R$ {Number(pedido.desconto).toFixed(2)}</span>
                </div>
              )}

              <div className="resumo-total">
                <span>Total</span>
                <span>R$ {Number(pedido.total).toFixed(2)}</span>
              </div>

              <div className="pagamento-info">
                <FiCreditCard />
                <span>{pagamentoLabels[pedido.forma_pagamento]}</span>
                {pedido.troco_para && (
                  <span className="troco">
                    (Troco para R$ {Number(pedido.troco_para).toFixed(2)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PedidoDetalhe;
