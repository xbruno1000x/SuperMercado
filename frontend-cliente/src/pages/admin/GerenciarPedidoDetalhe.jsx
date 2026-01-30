import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMapPin,
  FiCreditCard,
  FiClock,
  FiUser,
  FiPhone,
  FiMail,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './GerenciarPedidoDetalhe.css';

const statusLabels = {
  criado: { label: 'Pedido Criado', class: 'badge-warning' },
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

function GerenciarPedidoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    loadPedido();
  }, [id]);

  async function loadPedido() {
    try {
      const response = await api.get('/pedidos/todos', { params: { per_page: 1000 } });
      const pedidoEncontrado = response.data.data.find((p) => p.id === parseInt(id));
      if (pedidoEncontrado) {
        // Carregar detalhes completos
        const detailResponse = await api.get(`/pedidos/${id}`);
        setPedido({ ...pedidoEncontrado, ...detailResponse.data });
      } else {
        navigate('/admin/pedidos');
      }
    } catch (error) {
      toast.error('Erro ao carregar pedido');
      navigate('/admin/pedidos');
    } finally {
      setLoading(false);
    }
  }

  async function atualizarStatus(novoStatus) {
    setAtualizando(true);
    try {
      await api.patch(`/pedidos/${id}/status`, { status: novoStatus });
      toast.success('Status atualizado com sucesso!');
      loadPedido();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setAtualizando(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  if (!pedido) return null;

  const status = statusLabels[pedido.status];
  const statusIndex = statusOrder.indexOf(pedido.status);

  return (
    <div className="gerenciar-pedido-detalhe">
      <div className="container">
        <button onClick={() => navigate('/admin/pedidos')} className="voltar-btn">
          <FiArrowLeft /> Voltar para Pedidos
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

        {/* Ações de Status */}
        {pedido.status !== 'cancelado' && pedido.status !== 'entregue' && (
          <div className="acoes-status">
            <h3>Ações</h3>
            <div className="acoes-buttons">
              {pedido.status === 'criado' && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={() => atualizarStatus('em_separacao')}
                    disabled={atualizando}
                  >
                    Iniciar Separação
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => atualizarStatus('cancelado')}
                    disabled={atualizando}
                  >
                    Cancelar Pedido
                  </button>
                </>
              )}
              {pedido.status === 'cancelamento_solicitado' && (
                <>
                  <div className="aviso-cancelamento">
                    <p>⚠️ O cliente solicitou o cancelamento deste pedido.</p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => atualizarStatus('em_separacao')}
                    disabled={atualizando}
                  >
                    Continuar com o Pedido
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => atualizarStatus('cancelado')}
                    disabled={atualizando}
                  >
                    Confirmar Cancelamento
                  </button>
                </>
              )}
              {pedido.status === 'em_separacao' && (
                <button
                  className="btn btn-primary"
                  onClick={() => atualizarStatus('pronto')}
                  disabled={atualizando}
                >
                  Marcar como Pronto
                </button>
              )}
              {pedido.status === 'pronto' && (
                <button
                  className="btn btn-success"
                  onClick={() => atualizarStatus('entregue')}
                  disabled={atualizando}
                >
                  Confirmar Entrega
                </button>
              )}
            </div>
          </div>
        )}

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

        <div className="pedido-detalhe-content">
          <div className="pedido-detalhe-main">
            {/* Informações do Cliente */}
            {pedido.user && (
              <section className="detalhe-section">
                <h2>
                  <FiUser /> Cliente
                </h2>
                <div className="cliente-info">
                  <p>
                    <strong>{pedido.user.nome}</strong>
                  </p>
                  <p>
                    <FiMail /> {pedido.user.email}
                  </p>
                  {pedido.user.telefone && (
                    <p>
                      <FiPhone /> {pedido.user.telefone}
                    </p>
                  )}
                </div>
              </section>
            )}

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

export default GerenciarPedidoDetalhe;
