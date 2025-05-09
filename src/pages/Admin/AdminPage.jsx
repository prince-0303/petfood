import React, { useEffect, useState } from "react";
import "./AdminPage.css";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [openOrders, setOpenOrders] = useState({});
  const filteredUsers = users.filter(user => user.role !== "admin");
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    quantity: '',
    image_url: ''
  });

  const usersPerPage = 5;
  const productsPerPage = 5;
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate("/admin");
  };

  const handleLogout = () => {
    window.location.href = "/login";
  };

  const fetchData = async () => {
    try {
      const userRes = await fetch("http://localhost:3000/users");
      const productRes = await fetch("http://localhost:3000/products");
      const usersData = await userRes.json();
      const productsData = await productRes.json();

      setUsers(usersData);
      setProducts(productsData);

      // Calculate total revenue
      const revenue = usersData.reduce((acc, users) => {
        return acc + (users.orders ? users.orders.reduce((sum, order) => sum + order.total, 0) : 0);
      }, 0);

      setTotalRevenue(Math.round(revenue * 100) / 100);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUserDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this users?")) {
      await fetch(`http://localhost:3000/users/${id}`, { method: "DELETE" });
      setUsers(prev => prev.filter(users => users.id !== id));
    }
  };

  const handleUserRestrict = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;
    try {
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restricted: updatedStatus })
      });

      if (response.ok) {
        setUsers(prev =>
          prev.map(users =>
            users.id === id ? { ...users, restricted: updatedStatus } : users
          )
        );
      } else {
        console.error("Failed to update users restriction status");
      }
    } catch (error) {
      console.error("Error updating users restriction:", error);
    }
  };

  const toggleOrderView = (userId) => {
    setOpenOrders(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleProductEdit = async (id, key, value) => {
    await fetch(`http://localhost:3000/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value })
    });

    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, [key]: value } : product
      )
    );
  };

  const handleProductDelete = async (id) => {
    console.log("Deleting product with ID:", id); 

    const url = `http://localhost:3000/products/${id}`;
    console.log("Requesting URL:", url); // Log the request URL

    if (window.confirm("Delete this product?")) {
      try {
        const response = await fetch(url, { method: "DELETE" });
        console.log("DELETE Response:", response); 
        if (response.ok) {
          setProducts(prev => prev.filter(product => product.id !== id)); 
        } else {
          console.error("Failed to delete product with ID", id);
          alert("Failed to delete product. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };



  const handleAddProduct = async () => {
    const { name, category, description, price, quantity, image_url } = newProduct;


    if (name && category && description && price && quantity && image_url) {
      try {

        const parsedQuantity = parseFloat(quantity.replace(/[^\d.-]/g, ''));

        if (isNaN(parsedQuantity)) {
          alert("Invalid quantity format. Please enter a valid number.");
          return;
        }

        const productToAdd = {
          ...newProduct,
          price: parseFloat(price),
          quantity: parsedQuantity,
          id: products.length + 1 
        };

        const response = await fetch("http://localhost:3000/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productToAdd)
        });

        if (response.ok) {
          const addedProduct = await response.json();
          setProducts(prev => [...prev, addedProduct]);


          setNewProduct({
            name: '',
            category: '',
            description: '',
            price: '',
            quantity: '', 
            image_url: ''
          });
        } else {
          console.error("Failed to add product.");
        }
      } catch (error) {
        console.error("Error adding product:", error);
      }
    } else {
      alert("Please fill out all fields");
    }
  };



  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="admin-panel">
      <div className="admin-navbar">
        <button className="admin-navbar-head" onClick={handleGoToDashboard}>
          <h2>Admin Dashboard</h2>
        </button>
        <button className="admin-navbar-button" onClick={handleLogout}>Logout</button>
      </div>

      {/* Users Section */}
      <div>
        <h3 className="section-heading">Users</h3>
        <table className="table-wrapper">
          <thead className="table-header">
            <tr>
              <th className="table-cell">ID</th>
              <th className="table-cell">Name</th>
              <th className="table-cell">Role</th>
              <th className="table-cell">Actions</th>
              <th className="table-cell">Orders</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(users => users.role !== "admin")
              .slice((userPage - 1) * usersPerPage, userPage * usersPerPage)
              .map(users => (
                <React.Fragment key={users.id}>
                  <tr>
                    <td className="table-cell">{users.id}</td>
                    <td className="table-cell">{users.fullName || users.username}</td>
                    <td className="table-cell">{users.role}</td>
                    <td className="table-cell">
                      <button className="button-delete" onClick={() => handleUserDelete(users.id)}>Delete</button>
                      <button className="button-edit" onClick={() => handleUserRestrict(users.id, users.restricted)}>
                        {users.restricted ? "Unrestrict" : "Restrict"}
                      </button>
                    </td>
                    <td className="table-cell">
                      <button className="button-edit" onClick={() => toggleOrderView(users.id)}>
                        {openOrders[users.id] ? "Hide Orders" : "View Orders"}
                      </button>
                    </td>
                  </tr>
                  {openOrders[users.id] && (
                    <tr>
                      <td colSpan="6" className="table-cell">
                        <div className="order-history">
                          {users.orders && users.orders.length > 0 ? (
                            <ul>
                              {users.orders.map((order, idx) => (
                                <li key={idx}>
                                  <strong>Order #{idx + 1}</strong> - ₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}<br />
                                  <ul>
                                    {order.items.map((item, index) => (
                                      <li key={index}>
                                        {item.name} - ₹{item.price} × {item.quantity}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>No orders available</p>
                          )}

                        </div>
                      </td>
                    </tr>
                  )}

                </React.Fragment>
              ))}
          </tbody>
        </table>
        <Pagination
          currentPage={userPage}
          totalItems={filteredUsers.length}
          itemsPerPage={usersPerPage}
          onPageChange={setUserPage}
        />
      </div>

      {/* Products Section */}
      <div>
        <h3 className="section-heading">Products</h3>
        <table className="table-wrapper">
          <thead className="table-header">
            <tr>
              <th className="table-cell">ID</th>
              <th className="table-cell">Name</th>
              <th className="table-cell">Category</th>
              <th className="table-cell">Price</th>
              <th className="table-cell">Quantity</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products
              .slice((productPage - 1) * productsPerPage, productPage * productsPerPage)
              .map(product => (
                <tr key={product.id}>
                  <td className="table-cell">{product.id}</td>
                  <td className="table-cell">{product.name}</td>
                  <td className="table-cell">{product.category}</td>
                  <td className="table-cell">
                    ₹
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => handleProductEdit(product.id, "price", parseFloat(e.target.value))}
                      className="input-edit"
                    />
                  </td>
                  <td className="table-cell">{product.quantity}</td>
                  <td className="table-cell">
                    <button className="button-delete" onClick={() => handleProductDelete(product.id)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Pagination
          currentPage={productPage}
          totalItems={products.length}
          itemsPerPage={productsPerPage}
          onPageChange={setProductPage}
        />

      </div>

      {/* Add Product Section */}
      <div className="add-product-section">
        <h3>Add New Product</h3>
        {["name", "category", "description", "price", "quantity", "image_url"].map((field) => (
          <input
            key={field}
            type={field === "price" ? "number" : "text"}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
            value={newProduct[field]}
            onChange={(e) => setNewProduct({ ...newProduct, [field]: e.target.value })}
          />
        ))}
        <button className="button-add" onClick={handleAddProduct}>Add Product</button>
      </div>

      {/* Revenue Section */}
      <div className="revenue">
        <h3>Total Revenue: ₹{totalRevenue}</h3>
      </div>
    </div>
  );
};

export default AdminPanel;
