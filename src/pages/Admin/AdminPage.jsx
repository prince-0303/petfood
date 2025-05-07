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
  const [newProduct, setNewProduct] = useState({ name: '',category:'',description:'', price: '', quantity: '', image_url: '' });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const navigate = useNavigate();
  const usersPerPage = 5;
  const productsPerPage = 5;

  const handleGoToDashboard = () => {
    navigate('/admin');
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
      const revenue = usersData.reduce((acc, user) => {
        return acc + (user.orders ? user.orders.reduce((orderAcc, order) => orderAcc + order.total, 0) : 0);
      }, 0);
      const roundedRevenue = Math.round(revenue * 100) / 100;
      setTotalRevenue(roundedRevenue);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUserDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await fetch(`http://localhost:3000/users/${id}`, { method: "DELETE" });
      fetchData();
    }
  };

  const handleProductEdit = async (id, key, value) => {
    await fetch(`http://localhost:3000/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value })
    });
    setProducts(prevProducts =>
      prevProducts.map(product => product.id === id ? { ...product, [key]: value } : product)
    )
  };

  const handleProductDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      await fetch(`http://localhost:3000/products/${id}`, { method: "DELETE" });
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
    }
  };

  const handleAddProduct = async () => {
    const { name, category, description, price, quantity, image_url } = newProduct;
  
    if (name && category && description && price && quantity && image_url) {
      try {
        // Calculate the new ID based on the current products in state
        const highestId = products.reduce((maxId, product) => {
          return Math.max(maxId, parseInt(product.id, 10));
        }, 0);
        const newProductId = highestId + 1;
  
        const productToAdd = {
          ...newProduct,
          id: newProductId.toString(),
        };
  
        // Send POST request to add the new product
        await fetch("http://localhost:3000/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productToAdd),
        });
  
        // Update UI immediately without re-fetching
        setProducts(prev => [...prev, productToAdd]);
  
        // Reset the form
        setNewProduct({
          name: '',
          category: '',
          description: '',
          price: '',
          quantity: '',
          image_url: ''
        });
  
      } catch (error) {
        console.error("Error adding product:", error);
      }
    } else {
      alert("Please fill out all fields");
    }
  };
  
  

  const toggleOrderView = (userId) => {
    setOpenOrders(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleLogout = () => {

    window.location.href = '/login';
  };

  if (loading) return <p className="p-4">Loading...</p>;


  return (
    <div className="admin-panel">
      <div className="navbar">
        <button className="navbar-head" onClick={handleGoToDashboard}>
          <h2>Admin Dashboard</h2>
        </button>
        <button className="navbar-button" onClick={handleLogout}>Logout</button>
      </div>

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
  .filter(user => user.role !== "admin")
  .slice((userPage - 1) * usersPerPage, userPage * usersPerPage)
  .map(user => (
    <React.Fragment key={user.id}>
      <tr>
        <td className="table-cell">{user.id}</td>
        <td className="table-cell">{user.fullName || user.username}</td>
        <td className="table-cell">{user.role}</td>
        <td className="table-cell">
          <button className="button-delete" onClick={() => handleUserDelete(user.id)}>
            Delete
          </button>
        </td>
        <td className="table-cell">
          <button className="button-edit" onClick={() => toggleOrderView(user.id)}>
            {openOrders[user.id] ? "Hide Orders" : "View Orders"}
          </button>
        </td>
      </tr>
      {openOrders[user.id] && (
        <tr>
          <td colSpan="6" className="table-cell">
            <div className="order-history">
              {user.orders && user.orders.length > 0 ? (
                <ul>
                  {user.orders.map((order, idx) => (
                    <li key={idx}>
                      <strong>Order #{idx + 1}</strong> - ₹{order.total} - {new Date(order.placedAt).toLocaleString()}
                      <ul>
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, i) => (
                            <li key={i}>
                              {item.quantity} x
                              <img src={item.image_url} alt={item.name} width="50" />
                              {item.name} - ₹{item.price}
                            </li>
                          ))
                        ) : (
                          <li>No items in this order</li>
                        )}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No orders found.</p>
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
          totalItems={users.filter(user => user.role !== "admin").length}
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
              <th className="table-cell">Image</th>
              <th className="table-cell">Name</th>
              <th className="table-cell">Price</th>
              <th className="table-cell">Quantity</th>
              <th className="table-cell">Edit</th>
              <th className="table-cell">Delete</th>
            </tr>
          </thead>
          <tbody>
            {products.slice((productPage - 1) * productsPerPage, productPage * productsPerPage).map(product => (
              <tr key={product.id}>
                <td className="table-cell">
                  <img src={product.image_url} alt={product.name} width="50" />
                </td>
                <td className="table-cell">{product.name}</td>
                <td className="table-cell">
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => handleProductEdit(product.id, 'price', parseInt(e.target.value))}
                    className="input-field"
                  />
                </td>
                <td className="table-cell">
                  <input
                    value={product.quantity}
                    onChange={(e) => handleProductEdit(product.id, 'quantity', e.target.value)}
                    className="input-field"
                  />
                </td>
                <td className="table-cell">
                  <button className="button-edit"
                    onClick={() => handleProductEdit(product.id, 'name', prompt("New name:", product.name))}>
                    Edit Name
                  </button>
                </td>
                <td className="table-cell">
                  <button className="button-delete"
                    onClick={() => handleProductDelete(product.id)}>
                    Delete
                  </button>
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

      {/* New Product Section */}
      <div>
        <h3 className="section-heading">Add New Product</h3>
        <div className="add-product-form">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Product Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          />
          <input
            type="text"
            placeholder="Product Description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            // type="number"
            placeholder="Quantity"
            value={newProduct.quantity}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
          />
          <input
            type="text"
            placeholder="Image URL"
            value={newProduct.image_url}
            onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
          />
          <button onClick={handleAddProduct}>Add Product</button>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="total-revenue">
        <h3>Total Revenue: ₹{totalRevenue}</h3>
      </div>
    </div>
  );
};

export default AdminPanel;
