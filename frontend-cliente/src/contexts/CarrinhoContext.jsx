import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CarrinhoContext = createContext({});

const CARRINHO_LOCAL_KEY = 'carrinho_local';

// Funções para gerenciar carrinho local
function getCarrinhoLocal() {
  try {
    const data = localStorage.getItem(CARRINHO_LOCAL_KEY);
    return data ? JSON.parse(data) : { itens: [] };
  } catch {
    return { itens: [] };
  }
}

function saveCarrinhoLocal(carrinho) {
  localStorage.setItem(CARRINHO_LOCAL_KEY, JSON.stringify(carrinho));
}

function clearCarrinhoLocal() {
  localStorage.removeItem(CARRINHO_LOCAL_KEY);
}

function calcularTotais(itens) {
  const quantidadeTotal = itens.reduce((acc, item) => acc + item.quantidade, 0);
  const total = itens.reduce((acc, item) => {
    const preco = item.produto?.preco_promocional || item.produto?.preco || item.preco || 0;
    return acc + (preco * item.quantidade);
  }, 0);
  return { quantidadeTotal, total };
}

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Carregar carrinho (do servidor se logado, ou localStorage)
  const carregarCarrinho = useCallback(async () => {
    if (user) {
      // Usuário logado - carregar do servidor
      setLoading(true);
      try {
        const response = await api.get('/carrinho');
        const serverItens = response.data?.carrinho?.itens || [];
        setItens(serverItens);
        
        // Sincronizar itens locais com o servidor
        const localCarrinho = getCarrinhoLocal();
        if (localCarrinho.itens.length > 0) {
          for (const item of localCarrinho.itens) {
            try {
              await api.post('/carrinho/adicionar', {
                produto_id: item.produto_id || item.produto?.id,
                quantidade: item.quantidade,
              });
            } catch (e) {
              console.error('Erro ao sincronizar item:', e);
            }
          }
          clearCarrinhoLocal();
          // Recarregar após sincronização
          const syncResponse = await api.get('/carrinho');
          setItens(syncResponse.data?.carrinho?.itens || []);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Não logado - usar localStorage
      const localCarrinho = getCarrinhoLocal();
      setItens(localCarrinho.itens);
    }
  }, [user]);

  useEffect(() => {
    carregarCarrinho();
  }, [carregarCarrinho]);

  // Adicionar item ao carrinho
  async function adicionarItem(produto, quantidade = 1) {
    if (user) {
      // Logado - usar API
      setLoading(true);
      try {
        const produtoId = typeof produto === 'object' ? produto.id : produto;
        const response = await api.post('/carrinho/adicionar', {
          produto_id: produtoId,
          quantidade,
        });
        setItens(response.data?.carrinho?.itens || []);
        return response.data;
      } finally {
        setLoading(false);
      }
    } else {
      // Não logado - usar localStorage
      const produtoData = typeof produto === 'object' ? produto : { id: produto };
      const localCarrinho = getCarrinhoLocal();
      
      const existingIndex = localCarrinho.itens.findIndex(
        item => (item.produto_id || item.produto?.id) === produtoData.id
      );
      
      if (existingIndex >= 0) {
        localCarrinho.itens[existingIndex].quantidade += quantidade;
      } else {
        localCarrinho.itens.push({
          produto_id: produtoData.id,
          produto: produtoData,
          quantidade,
          preco: produtoData.preco_promocional || produtoData.preco,
        });
      }
      
      saveCarrinhoLocal(localCarrinho);
      setItens([...localCarrinho.itens]);
    }
  }

  // Atualizar quantidade
  async function atualizarQuantidade(produtoId, quantidade) {
    if (user) {
      setLoading(true);
      try {
        // Se a quantidade for 0 ou menor, removemos o item ao invés de enviar 0 ao servidor
        if (quantidade <= 0) {
          const response = await api.delete(`/carrinho/remover/${produtoId}`);
          setItens(response.data?.carrinho?.itens || []);
          return response.data;
        }

        const response = await api.put('/carrinho/atualizar', {
          produto_id: produtoId,
          quantidade,
        });
        setItens(response.data?.carrinho?.itens || []);
        return response.data;
      } finally {
        setLoading(false);
      }
    } else {
      const localCarrinho = getCarrinhoLocal();
      const index = localCarrinho.itens.findIndex(
        item => (item.produto_id || item.produto?.id) === produtoId
      );
      
      if (index >= 0) {
        if (quantidade <= 0) {
          localCarrinho.itens.splice(index, 1);
        } else {
          localCarrinho.itens[index].quantidade = quantidade;
        }
        saveCarrinhoLocal(localCarrinho);
        setItens([...localCarrinho.itens]);
      }
    }
  }

  // Remover item
  async function removerItem(produtoId) {
    if (user) {
      setLoading(true);
      try {
        const response = await api.delete(`/carrinho/remover/${produtoId}`);
        setItens(response.data?.carrinho?.itens || []);
        return response.data;
      } finally {
        setLoading(false);
      }
    } else {
      const localCarrinho = getCarrinhoLocal();
      localCarrinho.itens = localCarrinho.itens.filter(
        item => (item.produto_id || item.produto?.id) !== produtoId
      );
      saveCarrinhoLocal(localCarrinho);
      setItens([...localCarrinho.itens]);
    }
  }

  // Atualizar opção de substituição
  async function atualizarSubstituicao(produtoId, permiteSubstituicao) {
    if (user) {
      setLoading(true);
      try {
        const response = await api.put('/carrinho/substituicao', {
          produto_id: produtoId,
          permite_substituicao: permiteSubstituicao,
        });
        setItens(response.data?.carrinho?.itens || []);
        return response.data;
      } finally {
        setLoading(false);
      }
    } else {
      const localCarrinho = getCarrinhoLocal();
      const index = localCarrinho.itens.findIndex(
        item => (item.produto_id || item.produto?.id) === produtoId
      );
      
      if (index >= 0) {
        localCarrinho.itens[index].permite_substituicao = permiteSubstituicao;
        saveCarrinhoLocal(localCarrinho);
        setItens([...localCarrinho.itens]);
      }
    }
  }

  // Limpar carrinho
  async function limparCarrinho() {
    if (user) {
      setLoading(true);
      try {
        const response = await api.delete('/carrinho/limpar');
        setItens([]);
        return response.data;
      } finally {
        setLoading(false);
      }
    } else {
      clearCarrinhoLocal();
      setItens([]);
    }
  }

  const { quantidadeTotal, total } = calcularTotais(itens);

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        quantidadeTotal,
        total,
        loading,
        adicionarItem,
        atualizarQuantidade,
        atualizarSubstituicao,
        removerItem,
        limparCarrinho,
        recarregar: carregarCarrinho,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
