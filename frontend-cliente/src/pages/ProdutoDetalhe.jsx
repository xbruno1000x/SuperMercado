import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { useAuth } from '../contexts/AuthContext';
import './ProdutoDetalhe.css';

// Unidades que são vendidas por peso (permite decimais)
const UNIDADES_PESO = ['kg', 'g', 'l', 'ml'];

function ProdutoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { adicionarItem, itens, atualizarQuantidade, loading: carrinhoLoading } = useCarrinho();

  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [quantidadeInput, setQuantidadeInput] = useState('1');
  const [loading, setLoading] = useState(true);

  const itemNoCarrinho = itens.find((item) => item.produto_id === Number(id));
  const quantidadeNoCarrinho = itemNoCarrinho?.quantidade || 0;

  // Verificar se o produto é vendido por peso
  const isProdutoPeso = produto && UNIDADES_PESO.includes(produto.unidade?.toLowerCase());
  const incremento = isProdutoPeso ? 0.1 : 1;
  const minQuantidade = isProdutoPeso ? 0.1 : 1;

  useEffect(() => {
    loadProduto();
  }, [id]);

  useEffect(() => {
    // Formata a quantidade para exibição
    if (isProdutoPeso) {
      setQuantidadeInput(quantidade.toFixed(2).replace('.', ','));
    } else {
      setQuantidadeInput(String(Math.floor(quantidade)));
    }
  }, [quantidade, isProdutoPeso]);

  async function loadProduto() {
    try {
      const response = await api.get(`/produtos/${id}`);
      setProduto(response.data);
      // Define quantidade inicial baseado no tipo de produto
      const unidade = response.data.unidade?.toLowerCase();
      if (UNIDADES_PESO.includes(unidade)) {
        setQuantidade(0.5); // 500g inicial para produtos por peso
      }
    } catch (error) {
      toast.error('Produto não encontrado');
      navigate('/produtos');
    } finally {
      setLoading(false);
    }
  }

  const handleQuantidadeChange = (e) => {
    const valor = e.target.value.replace(',', '.');
    setQuantidadeInput(e.target.value);
    
    const numero = parseFloat(valor);
    if (!isNaN(numero) && numero > 0) {
      const maxQtd = produto.estoque_atual;
      const qtdFinal = Math.min(numero, maxQtd);
      setQuantidade(isProdutoPeso ? qtdFinal : Math.floor(qtdFinal));
    }
  };

  const handleQuantidadeBlur = () => {
    // Corrige o valor ao sair do campo
    if (quantidade < minQuantidade) {
      setQuantidade(minQuantidade);
    }
    if (isProdutoPeso) {
      setQuantidadeInput(quantidade.toFixed(2).replace('.', ','));
    } else {
      setQuantidadeInput(String(Math.floor(quantidade)));
    }
  };

  const ajustarQuantidade = (delta) => {
    const novaQtd = quantidade + delta;
    if (novaQtd >= minQuantidade && novaQtd <= produto.estoque_atual) {
      setQuantidade(isProdutoPeso ? Math.round(novaQtd * 100) / 100 : Math.floor(novaQtd));
    }
  };

  const handleAdicionar = async () => {
    if (!user) {
      toast.info('Faça login para adicionar ao carrinho');
      navigate('/login');
      return;
    }

    try {
      await adicionarItem(produto.id, quantidade);
      toast.success('Produto adicionado ao carrinho');
      setQuantidade(1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar produto');
    }
  };

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  if (!produto) return null;

  const precoFinal = produto.preco_promocional || produto.preco;
  const temPromocao = produto.preco_promocional && produto.preco_promocional < produto.preco;

  return (
    <div className="produto-detalhe">
      <div className="container">
        <button onClick={() => navigate(-1)} className="voltar-btn">
          <FiArrowLeft /> Voltar
        </button>

        <div className="produto-detalhe-content">
          <div className="produto-detalhe-imagem">
            {produto.imagem ? (
              <img src={produto.imagem} alt={produto.nome} />
            ) : (
              <div className="produto-placeholder-lg">
                {produto.nome.charAt(0)}
              </div>
            )}
            {temPromocao && <span className="promo-badge-lg">Promoção</span>}
          </div>

          <div className="produto-detalhe-info">
            <span className="produto-detalhe-categoria">
              {produto.categoria?.nome}
            </span>
            <h1>{produto.nome}</h1>

            {produto.codigo_barras && (
              <p className="codigo-barras">Cód: {produto.codigo_barras}</p>
            )}

            <div className="produto-detalhe-precos">
              {temPromocao && (
                <span className="preco-original-lg">
                  R$ {Number(produto.preco).toFixed(2)}
                </span>
              )}
              <span className="preco-atual-lg">
                R$ {Number(precoFinal).toFixed(2)}
              </span>
              <span className="preco-unidade-lg">/{produto.unidade}</span>
            </div>

            {produto.descricao && (
              <div className="produto-descricao">
                <h3>Descrição</h3>
                <p>{produto.descricao}</p>
              </div>
            )}

            <div className="produto-estoque">
              {produto.estoque_atual > 0 ? (
                <span className="em-estoque">
                  {isProdutoPeso 
                    ? `${produto.estoque_atual.toFixed(2).replace('.', ',')} ${produto.unidade} em estoque`
                    : `${produto.estoque_atual} unidades em estoque`
                  }
                </span>
              ) : (
                <span className="sem-estoque">Produto indisponível</span>
              )}
            </div>

            {produto.estoque_atual > 0 && (
              <div className="produto-detalhe-acoes">
                {quantidadeNoCarrinho > 0 ? (
                  <div className="ja-no-carrinho">
                    <p>Este produto já está no seu carrinho</p>
                    <div className="quantidade-carrinho">
                      <button
                        onClick={() => atualizarQuantidade(produto.id, Math.max(0, quantidadeNoCarrinho - incremento))}
                        disabled={carrinhoLoading}
                      >
                        <FiMinus />
                      </button>
                      <span>
                        {isProdutoPeso 
                          ? `${quantidadeNoCarrinho.toFixed(2).replace('.', ',')} ${produto.unidade}`
                          : quantidadeNoCarrinho
                        }
                      </span>
                      <button
                        onClick={() => atualizarQuantidade(produto.id, quantidadeNoCarrinho + incremento)}
                        disabled={carrinhoLoading || quantidadeNoCarrinho >= produto.estoque_atual}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`quantidade-selector ${isProdutoPeso ? 'quantidade-peso' : ''}`}>
                      <button
                        onClick={() => ajustarQuantidade(-incremento)}
                        disabled={quantidade <= minQuantidade}
                      >
                        <FiMinus />
                      </button>
                      {isProdutoPeso ? (
                        <div className="quantidade-input-wrapper">
                          <input
                            type="text"
                            value={quantidadeInput}
                            onChange={handleQuantidadeChange}
                            onBlur={handleQuantidadeBlur}
                            className="quantidade-input"
                          />
                          <span className="quantidade-unidade">{produto.unidade}</span>
                        </div>
                      ) : (
                        <span>{quantidade}</span>
                      )}
                      <button
                        onClick={() => ajustarQuantidade(incremento)}
                        disabled={quantidade >= produto.estoque_atual}
                      >
                        <FiPlus />
                      </button>
                    </div>
                    {isProdutoPeso && (
                      <div className="peso-presets">
                        {[0.25, 0.5, 1, 2].map((preset) => (
                          <button
                            key={preset}
                            className={`peso-preset-btn ${quantidade === preset ? 'active' : ''}`}
                            onClick={() => setQuantidade(Math.min(preset, produto.estoque_atual))}
                            disabled={preset > produto.estoque_atual}
                          >
                            {preset < 1 ? `${preset * 1000}g` : `${preset}kg`}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={handleAdicionar}
                      disabled={carrinhoLoading}
                    >
                      <FiShoppingCart />
                      Adicionar ao Carrinho
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProdutoDetalhe;
