import React from "react";
import { Link } from "react-router-dom";

const ProductList = ({ filteredProducts, filterByCategory, selectedCategory }) => {
  return (
    <div className="home-container">

      {/* CATEGORY FILTER */}
      <div className="category-buttons">
        <button
          className={selectedCategory === "All" ? "active" : ""}
          onClick={() => filterByCategory("All")}
        >
          All
        </button>

        <button
          className={selectedCategory === "Dog Food" ? "active" : ""}
          onClick={() => filterByCategory("Dog Food")}
        >
          Dog Food
        </button>

        <button
          className={selectedCategory === "Cat Food" ? "active" : ""}
          onClick={() => filterByCategory("Cat Food")}
        >
          Cat Food
        </button>
      </div>

      {/* PRODUCT GRID */}
      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div className="product-card" key={product.id}>
            <Link to={`/product/${product.id}`}>
              <img src={product.image_url} alt={product.name} />
              <h3>{product.name}</h3>
              <p>₹ {product.price}</p>
              <p className="category">{product.category.name}</p>
              <button>View item</button>
            </Link>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ProductList;