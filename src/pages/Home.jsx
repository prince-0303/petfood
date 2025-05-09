import axios from 'axios'
import React, { useEffect, useState } from 'react'
import '../styles/HomePage.css'
import ProductList from '../components/ProductList'

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
    <ProductList
      filteredProducts={filteredProducts}
      filterByCategory={filterByCategory}
      selectedCategory={selectedCategory}
    />
  )
}

export default Home
