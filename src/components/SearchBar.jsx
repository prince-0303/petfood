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
    axios
      .get('http://127.0.0.1:8000/api/list/')
      .then(res => {
        setProducts(res.data.results); // ✅ correct
      })
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const filtered = query.trim()
    ? products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  // ✅ ENTER KEY → navigate using ID
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filtered[0]) {
      navigate(`/product/${filtered[0].id}`);
      setQuery('');
    }
  };

  // ✅ CLICK → navigate using ID
  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
    setQuery('');
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
              key={product.id} 
              className="product-card"
              onClick={() => handleProductClick(product.id)}
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