import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios.get('http://localhost:3000/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const filtered = query.trim()
    ? products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filtered[0]) {
      navigate(`/product/${encodeURIComponent(filtered[0].name)}`);
    }
  };

  const handleProductClick = (name) => {
    navigate(`/product/${encodeURIComponent(name)}`);
  };

  if (location.pathname !== '/') {
    return null;
  }

  return (
    <div className="search-wrapper">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for a product..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="search-results">
        {filtered.length > 0 ? (
          filtered.map(product => (
            <div
              key={product.name}
              className="product-card"
              onClick={() => handleProductClick(product.name)}
            >
              <img src={product.image_url} alt={product.name} />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>₹ {product.price}</p>
            </div>
          ))
        ) : query && (
          <p className="no-match">No products found for "{query}"</p>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
