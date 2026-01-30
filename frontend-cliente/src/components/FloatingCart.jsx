import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useCarrinho } from '../contexts/CarrinhoContext';
import { useAuth } from '../contexts/AuthContext';
import './FloatingCart.css';

function FloatingCart() {
  const { quantidadeTotal, total } = useCarrinho();
  const { user } = useAuth();

  // Don't show if cart is empty or user is not logged in
  if (!user || quantidadeTotal === 0) {
    return null;
  }

  return (
    <Link to="/carrinho" className="floating-cart">
      <div className="floating-cart-icon">
        <FiShoppingCart />
        <span className="floating-cart-badge">{quantidadeTotal}</span>
      </div>
      <div className="floating-cart-info">
        <span className="floating-cart-items">
          {quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'}
        </span>
        <span className="floating-cart-total">
          R$ {Number(total).toFixed(2)}
        </span>
      </div>
    </Link>
  );
}

export default FloatingCart;
