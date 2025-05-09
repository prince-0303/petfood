import React from "react"
import { Link } from "react-router-dom"

const ProductList = ({ filteredProducts, filterByCategory, selectedCategory }) => {


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
export default ProductList;