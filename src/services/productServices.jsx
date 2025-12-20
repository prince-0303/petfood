export const getProducts = async (category = "All") => {
  let url = "http://127.0.0.1:8000/api/products";

  if (category !== "All") {
    url += `?category=${encodeURIComponent(category)}`;
  }

  const res = await fetch(url);
  return res.json();
};