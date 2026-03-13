import axios from "axios";
import React, { useEffect, useState } from "react";
import "../styles/HomePage.css";
import ProductList from "../components/ProductList";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    let url = `${import.meta.env.VITE_API_URL}/list/`;

    if (selectedCategory !== "All") {
      url += `?category=${encodeURIComponent(selectedCategory)}`;
    }

    axios
      .get(url)
      .then((res) => setProducts(res.data.results))
      .catch((err) => console.log(err));
  }, [selectedCategory]);

  return (
    <ProductList
      filteredProducts={products}
      filterByCategory={setSelectedCategory}
      selectedCategory={selectedCategory}
    />
  );
};

export default Home;