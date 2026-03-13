export const getProducts = async (category = "All") => {
  let url = `${import.meta.env.VITE_API_URL}/products`;

  if (category !== "All") {
    url += `?category=${encodeURIComponent(category)}`;
  }

  const res = await fetch(url);
  return res.json();
};