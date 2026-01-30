import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useCarrinho } from '../contexts/CarrinhoContext';
import './Carrinho.css';

function Carrinho() {
  const navigate = useNavigate();
  const { itens, total, atualizarQuantidade, atualizarSubstituicao, removerItem, limparCarrinho, loading } = useCarrinho();

  const handleQuantidade = async (produtoId, quantidade) => {
    try {
      await atualizarQuantidade(produtoId, quantidade);
      // Se quantidade foi para 0, o item foi removido automaticamente
      if (quantidade <= 0) {
        toast.info('Item removido do carrinho');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar quantidade');
    }
  };

  const handleRemover = async (produtoId) => {
    try {
      await removerItem(produtoId);
      toast.success('Item removido do carrinho');
    } catch (error) {
      toast.error('Erro ao remover item');
    }
  };

  const handleLimpar = async () => {
    if (window.confirm('Deseja limpar todo o carrinho?')) {
      try {
        await limparCarrinho();
        toast.success('Carrinho limpo');
      } catch (error) {
        toast.error('Erro ao limpar carrinho');
      }
    }
  };

  if (itens.length === 0) {
    return (
      <div className="container">
        <div className="carrinho-vazio">
          <FiShoppingBag />
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione produtos para continuar</p>
          <Link to="/produtos" className="btn btn-primary">
            Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="carrinho-page">
      <div className="container">
        <div className="carrinho-header">
          <h1 className="page-title">Meu Carrinho</h1>
          <button onClick={handleLimpar} className="limpar-btn">
            <FiTrash2 /> Limpar Carrinho
          </button>
        </div>

        <div className="carrinho-content">
          <div className="carrinho-itens">
            {itens.map((item) => (
              <div key={item.id} className="carrinho-item">
                <div className="item-imagem">
                  {item.produto?.imagem ? (
                    <img src={item.produto.imagem} alt={item.produto.nome} />
                  ) : (
                    <div className="item-placeholder">
                      {item.produto?.nome?.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="item-info">
                  <h3>{item.produto?.nome}</h3>
                  <p className="item-preco">
                    R$ {Number(item.produto?.preco_promocional || item.produto?.preco).toFixed(2)}
                    /{item.produto?.unidade}
                  </p>
                </div>

                <div className="item-quantidade">
                  <button
                    onClick={() => handleQuantidade(item.produto_id, item.quantidade - 1)}
                    disabled={loading}
                  >
                    <FiMinus />
                  </button>
                  <span>{item.quantidade}</span>
                  <button
                    onClick={() => handleQuantidade(item.produto_id, item.quantidade + 1)}
                    disabled={loading || item.quantidade >= item.produto?.estoque_atual}
                  >
                    <FiPlus />
                  </button>
                </div>

                <div className="item-subtotal">
                  <p>R$ {(item.quantidade * (item.produto?.preco_promocional || item.produto?.preco)).toFixed(2)}</p>
                </div>

                <div className="item-substituicao">
                  <label className="substituicao-toggle">
                    <input
                      type="checkbox"
                      checked={item.permite_substituicao !== false}
                      onChange={(e) => atualizarSubstituicao(item.produto_id, e.target.checked)}
                      disabled={loading}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">
                      <FiRefreshCw size={12} />
                      Permitir substituição
                    </span>
                  </label>
                </div>

                <button
                  className="item-remover"
                  onClick={() => handleRemover(item.produto_id)}
                  disabled={loading}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          <div className="carrinho-resumo">
            <div className="resumo-card">
              <h3>Resumo do Pedido</h3>

              <div className="resumo-linha">
                <span>Subtotal</span>
                <span>R$ {Number(total).toFixed(2)}</span>
              </div>

              <div className="resumo-linha">
                <span>Entrega</span>
                <span className="frete-info">Calculado no checkout</span>
              </div>

              <div className="resumo-total">
                <span>Total</span>
                <span>R$ {Number(total).toFixed(2)}</span>
              </div>

              <button
                className="btn btn-primary btn-block"
                onClick={() => navigate('/checkout')}
              >
                Finalizar Pedido <FiArrowRight />
              </button>

              <Link to="/produtos" className="continuar-comprando">
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Carrinho;
