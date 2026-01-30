import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiMinus, FiSearch, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import './AdicionarItensPedido.css';

function AdicionarItensPedido() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pedido, setPedido] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    loadDados();
  }, [pedidoId]);

  async function loadDados() {
    try {
      const [pedidoRes, produtosRes] = await Promise.all([
        api.get(`/pedidos/${pedidoId}`),
        api.get('/produtos', { params: { per_page: 100 } }),
      ]);

      setPedido(pedidoRes.data);
      setProdutos(produtosRes.data.data);

      // Verificar se o pedido pode ser modificado
      if (pedidoRes.data.status !== 'criado') {
        toast.error('Este pedido não pode mais ser modificado');
        navigate(`/pedidos/${pedidoId}`);
      }
    } catch (error) {
      toast.error('Erro ao carregar dados');
      navigate('/pedidos');
    } finally {
      setLoading(false);
    }
  }

  const handleQuantidade = (produtoId, delta) => {
    setItensSelecionados((prev) => {
      const atual = prev[produtoId] || 0;
      const nova = Math.max(0, atual + delta);
      if (nova === 0) {
        const { [produtoId]: _, ...resto } = prev;
        return resto;
      }
      return { ...prev, [produtoId]: nova };
    });
  };

  const handleSubmit = async () => {
    const itens = Object.entries(itensSelecionados)
      .filter(([_, qtd]) => qtd > 0)
      .map(([produtoId, quantidade]) => ({
        produto_id: parseInt(produtoId),
        quantidade,
      }));

    if (itens.length === 0) {
      toast.warning('Selecione pelo menos um produto');
      return;
    }

    setEnviando(true);
    try {
      await api.post(`/pedidos/${pedidoId}/adicionar-itens`, { itens });
      toast.success('Itens adicionados com sucesso!');
      navigate(`/pedidos/${pedidoId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar itens');
    } finally {
      setEnviando(false);
    }
  };

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totalItens = Object.values(itensSelecionados).reduce((a, b) => a + b, 0);
  const totalValor = Object.entries(itensSelecionados).reduce((total, [produtoId, qtd]) => {
    const produto = produtos.find((p) => p.id === parseInt(produtoId));
    if (produto) {
      const preco = produto.preco_promocional || produto.preco;
      return total + preco * qtd;
    }
    return total;
  }, 0);

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  return (
    <div className="adicionar-itens-page">
      <div className="container">
        <button onClick={() => navigate(`/pedidos/${pedidoId}`)} className="voltar-btn">
          <FiArrowLeft /> Voltar ao Pedido
        </button>

        <h1 className="page-title">Adicionar Itens ao Pedido #{pedido?.codigo}</h1>

        <div className="busca-produtos">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="produtos-grid">
          {produtosFiltrados.map((produto) => {
            const quantidade = itensSelecionados[produto.id] || 0;
            const precoFinal = produto.preco_promocional || produto.preco;

            return (
              <div key={produto.id} className={`produto-item ${quantidade > 0 ? 'selecionado' : ''}`}>
                <div className="produto-item-info">
                  <h3>{produto.nome}</h3>
                  <p className="produto-item-preco">
                    R$ {Number(precoFinal).toFixed(2)}
                    <span>/{produto.unidade}</span>
                  </p>
                </div>

                <div className="produto-item-actions">
                  {quantidade === 0 ? (
                    <button
                      className="btn-adicionar"
                      onClick={() => handleQuantidade(produto.id, 1)}
                      disabled={produto.estoque_atual <= 0}
                    >
                      <FiPlus /> Adicionar
                    </button>
                  ) : (
                    <div className="quantidade-controls">
                      <button onClick={() => handleQuantidade(produto.id, -1)}>
                        <FiMinus />
                      </button>
                      <span>{quantidade}</span>
                      <button onClick={() => handleQuantidade(produto.id, 1)}>
                        <FiPlus />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalItens > 0 && (
          <div className="resumo-adicao">
            <div className="resumo-info">
              <span>{totalItens} {totalItens === 1 ? 'item' : 'itens'}</span>
              <span className="resumo-valor">+ R$ {totalValor.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={enviando}
            >
              <FiShoppingBag />
              {enviando ? 'Adicionando...' : 'Adicionar ao Pedido'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdicionarItensPedido;
