import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ProductPage.css";
import { AuthContext } from "../Context/AuthContext";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchAndSetCartCount } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product details
  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/list/${id}/`)
      .then((res) => {
        setProduct(res.data);
        setQuantity(1);
      })
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const totalPrice = useMemo(() => {
    return product ? product.price * quantity : 0;
  }, [product, quantity]);

  // Add to Cart function
  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://127.0.0.1:8000/api/cart/add/",
        {
          product_id: product.id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update cart count in context
      fetchAndSetCartCount();
      alert("Added to cart!");
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add item to cart.");
    }
  };

  if (loading) return <div className="product-page">Loading...</div>;
  if (error) return <div className="product-page error">{error}</div>;

  return (
    <div className="product-page">
      <div className="product-left">
        <h1>{product.name}</h1>
        <img src={product.image_url} alt={product.name} />
      </div>

      <div className="product-right">
        <p>{product.description}</p>
        <h2>₹ {product.price}</h2>

        <div className="quantity-controls">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>

        <p>Total: ₹ {totalPrice}</p>

        <button onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductPage;