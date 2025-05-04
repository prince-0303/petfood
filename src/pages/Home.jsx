import axios from 'axios'
import React, { useEffect, useState } from 'react'
import '../styles/HomePage.css'
import { Link } from 'react-router'

const Home = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')

  // FETCHING PRODUCTS AND DISPLAYING

  useEffect(() => {
    axios.get('http://localhost:3000/products')
      .then(res => res.data)
      .then(data => {
        setProducts(data)
        setFilteredProducts(data)
      })
      .catch(err => console.log(err))
  }, [])

  // FILTERING PRODUCT BY CATEGORY 
  
  const filterByCategory = (category) => {
    setSelectedCategory(category)
    if (category === 'All') {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product => product.category === category)
      setFilteredProducts(filtered)
    }
  }

  return (
    <div className="home-container">


      <div className="category-buttons">
        <button onClick={() => filterByCategory('All')} className={selectedCategory === 'All' ? 'active' : ''}>All</button>
        <button onClick={() => filterByCategory('Dog Food')} className={selectedCategory === 'Dog Food' ? 'active' : ''}>Dog Food</button>
        <button onClick={() => filterByCategory('Cat Food')} className={selectedCategory === 'Cat Food' ? 'active' : ''}>Cat Food</button>
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <div className="product-card" key={product.name}>
            <Link to={`/product/${encodeURIComponent(product.name)}`} className="product-card" key={product.name}>
              <img src={product.image_url} alt={product.name} />
              <h3>{product.name}</h3>
              <p>₹ {product.price}</p>
              <button>View item</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
