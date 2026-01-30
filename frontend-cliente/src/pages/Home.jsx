import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiCreditCard, FiClock } from 'react-icons/fi';
import api from '../services/api';
import ProdutoCard from '../components/ProdutoCard';
import './Home.css';

function Home() {
  const [categorias, setCategorias] = useState([]);
  const [produtosDestaque, setProdutosDestaque] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categorias'),
        api.get('/produtos', { params: { per_page: 6 } }),
      ]);

      setCategorias(catRes.data);
      setProdutosDestaque(prodRes.data.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Seu mercado completo na palma da mão</h1>
            <p>
              Compre sem sair de casa e receba em minutos. Produtos frescos,
              preços justos e entrega rápida.
            </p>
            <Link to="/produtos" className="btn btn-primary btn-lg">
              Ver Produtos <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature">
              <div className="feature-icon">
                <FiTruck />
              </div>
              <h3>Entrega Rápida</h3>
              <p>Receba seus produtos em até 2 horas</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FiCreditCard />
              </div>
              <h3>Pagamento Fácil</h3>
              <p>Pix, cartão ou dinheiro na entrega</p>
            </div>
            <div className="feature">
              <div className="feature-icon">
                <FiClock />
              </div>
              <h3>Sempre Aberto</h3>
              <p>Faça pedidos 24 horas por dia</p>
            </div>
          </div>
        </div>
      </section>

      <section className="categorias-section">
        <div className="container">
          <div className="section-header">
            <h2>Categorias</h2>
            <Link to="/produtos" className="ver-todos">
              Ver todas <FiArrowRight />
            </Link>
          </div>
          <div className="categorias-grid">
            {categorias.slice(0, 8).map((categoria) => (
              <Link
                key={categoria.id}
                to={`/produtos?categoria=${categoria.id}`}
                className="categoria-card"
              >
                <div className="categoria-icon">
                  {categoria.nome.charAt(0)}
                </div>
                <span>{categoria.nome}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="produtos-section">
        <div className="container">
          <div className="section-header">
            <h2>Produtos em Destaque</h2>
            <Link to="/produtos" className="ver-todos">
              Ver todos <FiArrowRight />
            </Link>
          </div>
          <div className="produtos-grid">
            {produtosDestaque.map((produto) => (
              <ProdutoCard key={produto.id} produto={produto} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
