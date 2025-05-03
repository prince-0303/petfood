import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProductPage.css';
import { AuthContext } from '../Context/AuthContext';

const ProductPage = () => {
  const { user, setCartCount } = useContext(AuthContext);
  const navigate = useNavigate();
  const { name } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get('http://localhost:3000/products');
        const match = data.find(item => item.name === decodeURIComponent(name));
        if (!match) {
          setError('Product not found.');
        } else {
          setProduct(match);
          setQuantity(1);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [name]);

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => Math.max(1, q - 1));

  const totalPrice = useMemo(() => {
    return product ? (product.price * quantity) : 0;
  }, [product, quantity]);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please log in to add items to cart.');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/users/${user.id}`);
      const userData = await res.json();
      const currentCart = userData.cart || [];

      const existingIndex = currentCart.findIndex(item => item.productId === product.id);
      let updatedCart;

      if (existingIndex !== -1) {
        updatedCart = [...currentCart];
        updatedCart[existingIndex].quantity += quantity;
      } else {
        updatedCart = [
          ...currentCart,
          {
            productId: product.id,
            name: product.name,
            image_url: product.image_url,
            price: product.price,
            quantity
          }
        ];
      }

      await fetch(`http://localhost:3000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: updatedCart }),
      });

      // ✅ Update cartCount in context
      const newTotalCount = updatedCart.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(newTotalCount);

      alert('Item added to cart!');
    } catch (err) {
      console.error('Add to cart failed:', err);
      alert('Failed to add item to cart.');
    }
  };

  if (loading) return <div className="product-page">Loading product...</div>;
  if (error) return <div className="product-page error">{error}</div>;
  if (!product) return null;

  return (
    <div className="product-page">
      <div className="product-left">
        <h1 className="product-title">{product.name}</h1>
        <p className="brand">by {product.brand || 'Brand'}</p>
        <img src={product.image_url} alt={product.name} className="product-img" />
      </div>

      <div className="product-right">
        <div className="price-block">
          <p className="description">{product.description}</p>
          <p className="quantity">Stock: {product.quantity}</p>
          <p className="price-label">Price</p>
          <h2 className="price">₹ {product.price}</h2>
          <p className="per-kg">₹ {(product.price / parseInt(product.quantity)).toFixed(2)}/kg</p>
        </div>

        <div className="quantity-section">
          <p>Quantity</p>
          <div className="quantity-controls">
            <button onClick={decreaseQuantity}>-</button>
            <span>{quantity}</span>
            <button onClick={increaseQuantity}>+</button>
          </div>
        </div>

        <p className="total">Total: ₹ {totalPrice}</p>

        <button className="add-to-cart" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductPage;

