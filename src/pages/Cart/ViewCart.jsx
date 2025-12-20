import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { cartService } from '../../services/cartService';
import './ViewCart.css';
import { Link } from 'react-router-dom';

const ViewCart = () => {
  const { user, fetchAndSetCartCount } = useContext(AuthContext);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const data = await cartService.updateCartItem(itemId, newQuantity);
      setCart(data.cart);
      fetchAndSetCartCount();
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const data = await cartService.removeFromCart(itemId);
      setCart(data.cart);
      fetchAndSetCartCount();
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        const data = await cartService.clearCart();
        setCart(data.cart);
        fetchAndSetCartCount();
      } catch (err) {
        console.error('Error clearing cart:', err);
        alert('Failed to clear cart');
      }
    }
  };

  if (!user) {
    return <div className="cart-page">Please login to view your cart.</div>;
  }

  if (loading) {
    return <div className="cart-page">Loading your cart...</div>;
  }

  if (error) {
    return <div className="cart-page error">{error}</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <h2>Your cart is empty</h2>
        <Link to="/" className="continue-shopping">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>Your Cart ({cart.total_items} items)</h2>
        <button className="clear-cart-btn" onClick={handleClearCart}>
          Clear Cart
        </button>
      </div>

      <div className="cart-items">
        {cart.items.map((item) => (
          <div className="cart-item" key={item.id}>
            <img 
              src={item.product.image_url} 
              alt={item.product.name} 
              className="cart-item-img" 
            />
            <div className="cart-item-info">
              <h3>{item.product.name}</h3>
              <p className="category">{item.product.category_name}</p>
              <p className="price">Price: ₹ {item.product.price}</p>
              
              <div className="quantity-controls">
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              
              <p className="subtotal">Subtotal: ₹ {item.subtotal}</p>
              
              <button 
                className="remove-btn" 
                onClick={() => handleRemoveItem(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Total Items:</span>
          <span>{cart.total_items}</span>
        </div>
        <div className="summary-row total">
          <span>Total Amount:</span>
          <span>₹ {cart.total_price}</span>
        </div>
        <Link to="/checkout" className="checkout-btn">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
};

export default ViewCart;