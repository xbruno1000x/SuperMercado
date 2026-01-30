import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const VendaContext = createContext(null);

export function VendaProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(false);

  const adicionarItem = useCallback(async (produto, quantidade = 1) => {
    setItens(prev => {
      const existente = prev.find(item => item.produto_id === produto.id);
      
      if (existente) {
        const novaQtd = existente.quantidade + quantidade;
        if (novaQtd > produto.estoque_atual) {
          toast.error('Estoque insuficiente');
          return prev;
        }
        return prev.map(item =>
          item.produto_id === produto.id
            ? { ...item, quantidade: novaQtd, subtotal: novaQtd * item.preco_unitario }
            : item
        );
      }
      
      if (quantidade > produto.estoque_atual) {
        toast.error('Estoque insuficiente');
        return prev;
      }
      
      return [...prev, {
        produto_id: produto.id,
        codigo_barras: produto.codigo_barras,
        nome: produto.nome,
        preco_unitario: parseFloat(produto.preco),
        quantidade,
        subtotal: quantidade * parseFloat(produto.preco)
      }];
    });
  }, []);

  const removerItem = useCallback((produtoId) => {
    setItens(prev => prev.filter(item => item.produto_id !== produtoId));
  }, []);

  const alterarQuantidade = useCallback((produtoId, quantidade, estoqueMax) => {
    if (quantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    
    if (quantidade > estoqueMax) {
      toast.error('Estoque insuficiente');
      return;
    }
    
    setItens(prev => prev.map(item =>
      item.produto_id === produtoId
        ? { ...item, quantidade, subtotal: quantidade * item.preco_unitario }
        : item
    ));
  }, [removerItem]);

  const limparVenda = useCallback(() => {
    setItens([]);
  }, []);

  const getTotal = useCallback(() => {
    return itens.reduce((acc, item) => acc + item.subtotal, 0);
  }, [itens]);

  const finalizarVenda = useCallback(async (formaPagamento) => {
    if (itens.length === 0) {
      throw new Error('Adicione itens à venda');
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/vendas', {
        forma_pagamento: formaPagamento,
        itens: itens.map(item => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        }))
      });
      
      setItens([]);
      return response.data;
    } finally {
      setLoading(false);
    }
  }, [itens]);

  const buscarProduto = useCallback(async (termo) => {
    const response = await api.get('/produtos/busca', {
      params: { termo }
    });
    return response.data;
  }, []);

  return (
    <VendaContext.Provider value={{
      itens,
      loading,
      adicionarItem,
      removerItem,
      alterarQuantidade,
      limparVenda,
      getTotal,
      finalizarVenda,
      buscarProduto
    }}>
      {children}
    </VendaContext.Provider>
  );
}

export function useVenda() {
  const context = useContext(VendaContext);
  if (!context) {
    throw new Error('useVenda deve ser usado dentro de VendaProvider');
  }
  return context;
}
