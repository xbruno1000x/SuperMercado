import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import api from '../services/api';
import ProdutoCard from '../components/ProdutoCard';
import './Produtos.css';

function Produtos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState(searchParams.get('busca') || '');
  const [categoriaAtiva, setCategoriaAtiva] = useState(
    searchParams.get('categoria') || ''
  );
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    loadProdutos();
  }, [searchParams]);

  async function loadCategorias() {
    try {
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }

  async function loadProdutos(page = 1) {
    setLoading(true);
    try {
      const params = {
        per_page: 20,
        page,
      };

      const categoria = searchParams.get('categoria');
      const buscaParam = searchParams.get('busca');

      if (categoria) params.categoria_id = categoria;
      if (buscaParam) params.busca = buscaParam;

      const response = await api.get('/produtos', { params });
      setProdutos(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleBusca = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (busca) {
      params.set('busca', busca);
    } else {
      params.delete('busca');
    }
    setSearchParams(params);
  };

  const handleCategoria = (categoriaId) => {
    const params = new URLSearchParams(searchParams);
    if (categoriaId) {
      params.set('categoria', categoriaId);
    } else {
      params.delete('categoria');
    }
    setCategoriaAtiva(categoriaId);
    setSearchParams(params);
  };

  return (
    <div className="produtos-page">
      <div className="container">
        <div className="produtos-header">
          <h1 className="page-title">Produtos</h1>
          <form onSubmit={handleBusca} className="busca-form">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <button type="submit">
              <FiSearch />
            </button>
          </form>
        </div>

        <div className="produtos-content">
          <aside className="filtros">
            <h3>Categorias</h3>
            <ul className="categorias-list">
              <li>
                <button
                  className={!categoriaAtiva ? 'active' : ''}
                  onClick={() => handleCategoria('')}
                >
                  Todas
                </button>
              </li>
              {categorias.map((cat) => (
                <li key={cat.id}>
                  <button
                    className={categoriaAtiva === String(cat.id) ? 'active' : ''}
                    onClick={() => handleCategoria(String(cat.id))}
                  >
                    {cat.nome}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="produtos-main">
            {loading ? (
              <div className="loading-screen">Carregando...</div>
            ) : produtos.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum produto encontrado</p>
              </div>
            ) : (
              <>
                <div className="produtos-grid">
                  {produtos.map((produto) => (
                    <ProdutoCard key={produto.id} produto={produto} />
                  ))}
                </div>

                {pagination.lastPage > 1 && (
                  <div className="paginacao">
                    {Array.from({ length: pagination.lastPage }, (_, i) => (
                      <button
                        key={i + 1}
                        className={pagination.currentPage === i + 1 ? 'active' : ''}
                        onClick={() => {
                          const params = new URLSearchParams(searchParams);
                          params.set('page', String(i + 1));
                          setSearchParams(params);
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Produtos;
