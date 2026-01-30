import { Link } from 'react-router-dom';
import { FiPlus, FiMinus } from 'react-icons/fi';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import './ProdutoCard.css';

function ProdutoCard({ produto }) {
  const { user } = useAuth();
  const { adicionarItem, itens, atualizarQuantidade, loading } = useCarrinho();

  const itemNoCarrinho = itens.find((item) => item.produto_id === produto.id);
  const quantidade = itemNoCarrinho?.quantidade || 0;

  const precoFinal = produto.preco_promocional || produto.preco;
  const temPromocao = produto.preco_promocional && produto.preco_promocional < produto.preco;

  const handleAdicionar = async () => {
    if (!user) {
      toast.info('Faça login para adicionar ao carrinho');
      return;
    }

    try {
      await adicionarItem(produto.id, 1);
      toast.success('Produto adicionado ao carrinho');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar produto');
    }
  };

  const handleQuantidade = async (novaQuantidade) => {
    if (loading) return;

    try {
      await atualizarQuantidade(produto.id, novaQuantidade);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar quantidade');
    }
  };

  return (
    <div className="produto-card">
      <Link to={`/produtos/${produto.id}`} className="produto-imagem">
        {produto.imagem ? (
          <img src={produto.imagem} alt={produto.nome} />
        ) : (
          <div className="produto-placeholder">
            {produto.nome.charAt(0)}
          </div>
        )}
        {temPromocao && <span className="produto-promo-badge">Promoção</span>}
      </Link>

      <div className="produto-info">
        <span className="produto-categoria">{produto.categoria?.nome}</span>
        <Link to={`/produtos/${produto.id}`}>
          <h3 className="produto-nome">{produto.nome}</h3>
        </Link>

        <div className="produto-precos">
          {temPromocao && (
            <span className="preco-original">R$ {Number(produto.preco).toFixed(2)}</span>
          )}
          <span className="preco-atual">R$ {Number(precoFinal).toFixed(2)}</span>
          <span className="preco-unidade">/{produto.unidade}</span>
        </div>

        {produto.estoque_atual <= 0 ? (
          <span className="produto-indisponivel">Indisponível</span>
        ) : quantidade > 0 ? (
          <div className="produto-quantidade">
            <button
              onClick={() => handleQuantidade(quantidade - 1)}
              disabled={loading}
            >
              <FiMinus />
            </button>
            <span>{quantidade}</span>
            <button
              onClick={() => handleQuantidade(quantidade + 1)}
              disabled={loading || quantidade >= produto.estoque_atual}
            >
              <FiPlus />
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-block"
            onClick={handleAdicionar}
            disabled={loading}
          >
            Adicionar
          </button>
        )}
      </div>
    </div>
  );
}

export default ProdutoCard;
