import React, { useEffect, useState } from "react";
import "./AdminPage.css";
import Pagination from "../../components/Pagination";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { authService } from "../../services/authService";


const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [openOrders, setOpenOrders] = useState({});
  const [dashboardStats, setDashboardStats] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    weight_value: '',
    weight_unit: 'kg',
    image_url: ''
  });

  const usersPerPage = 5;
  const productsPerPage = 5;
  const ordersPerPage = 5;
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate("/admin");
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const stats = await adminService.getDashboardStats();
      setDashboardStats(stats);

      // Fetch users
      const usersData = await adminService.getUsers();
      setUsers(usersData);

      // Fetch products
      const productsData = await adminService.getProducts();
      setProducts(productsData);

      // Fetch orders
      const ordersData = await adminService.getOrders();
      setOrders(ordersData);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert("You don't have admin permissions");
        navigate("/login");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUserDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminService.deleteUser(id);
        setUsers(prev => prev.filter(user => user.id !== id));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const handleUserRestrict = async (id, currentStatus) => {
    try {
      await adminService.restrictUser(id, !currentStatus);
      setUsers(prev =>
        prev.map(user =>
          user.id === id ? { ...user, restricted: !currentStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating user restriction:", error);
      alert("Failed to update user restriction");
    }
  };

  const toggleOrderView = (userId) => {
    setOpenOrders(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleProductEdit = async (id, field, value) => {
    try {
      const updatedData = { [field]: value };
      await adminService.updateProduct(id, updatedData);
      
      setProducts(prev =>
        prev.map(product =>
          product.id === id ? { ...product, [field]: value } : product
        )
      );
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  const handleProductDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await adminService.deleteProduct(id);
        setProducts(prev => prev.filter(product => product.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleAddProduct = async () => {
    const { name, category, description, price, weight_value, weight_unit, image_url } = newProduct;

    if (name && category && description && price && weight_value && image_url) {
      try {
        const productToAdd = {
          name,
          category: parseInt(category), // Assuming category is ID
          description,
          price: parseFloat(price),
          weight_value: parseFloat(weight_value),
          weight_unit,
          image_url
        };

        const response = await adminService.createProduct(productToAdd);
        setProducts(prev => [...prev, response.product]);

        // Reset form
        setNewProduct({
          name: '',
          category: '',
          description: '',
          price: '',
          weight_value: '',
          weight_unit: 'kg',
          image_url: ''
        });
        
        alert("Product added successfully!");
      } catch (error) {
        console.error("Error adding product:", error);
        alert("Failed to add product: " + (error.response?.data?.error || error.message));
      }
    } else {
      alert("Please fill out all fields");
    }
  };

  // Get user orders
  const getUserOrders = (userId) => {
    return orders.filter(order => order.user_email === users.find(u => u.id === userId)?.email);
  };

  // Handle order status update
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
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

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h4>Total Users</h4>
            <p>{dashboardStats.user_count}</p>
          </div>
          <div className="stat-card">
            <h4>Total Orders</h4>
            <p>{dashboardStats.order_count}</p>
          </div>
          <div className="stat-card">
            <h4>Total Revenue</h4>
            <p>₹{parseFloat(dashboardStats.total_revenue).toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Users Section */}
      <div>
        <h3 className="section-heading">Users</h3>
        <table className="table-wrapper">
          <thead className="table-header">
            <tr>
              <th className="table-cell">ID</th>
              <th className="table-cell">Name</th>
              <th className="table-cell">Email</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">Actions</th>
              <th className="table-cell">Orders</th>
            </tr>
          </thead>
          <tbody>
            {users
              .slice((userPage - 1) * usersPerPage, userPage * usersPerPage)
              .map(user => (
                <React.Fragment key={user.id}>
                  <tr>
                    <td className="table-cell">{user.id}</td>
                    <td className="table-cell">{user.first_name} {user.last_name}</td>
                    <td className="table-cell">{user.email}</td>
                    <td className="table-cell">
                      {user.is_active ? "Active" : "Inactive"}
                      {user.restricted && " (Restricted)"}
                    </td>
                    <td className="table-cell">
                      <button className="button-delete" onClick={() => handleUserDelete(user.id)}>
                        Delete
                      </button>
                      <button className="button-edit" onClick={() => handleUserRestrict(user.id, user.restricted)}>
                        {user.restricted ? "Unrestrict" : "Restrict"}
                      </button>
                    </td>
                    <td className="table-cell">
                      <button className="button-edit" onClick={() => toggleOrderView(user.id)}>
                        {openOrders[user.id] ? "Hide Orders" : `View Orders (${user.total_orders})`}
                      </button>
                    </td>
                  </tr>
                  {openOrders[user.id] && (
                    <tr>
                      <td colSpan="6" className="table-cell">
                        <div className="order-history">
                          {getUserOrders(user.id).length > 0 ? (
                            <ul>
                              {getUserOrders(user.id).map((order) => (
                                <li key={order.id}>
                                  <strong>Order #{order.id}</strong> - ₹{order.total} - {order.status}<br />
                                  <ul>
                                    {order.items.map((item) => (
                                      <li key={item.id}>
                                        {item.product_name} - ₹{item.price} × {item.quantity}
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
          totalItems={users.length}
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
              <th className="table-cell">Weight</th>
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
                  <td className="table-cell">{product.category_name}</td>
                  <td className="table-cell">
                    ₹
                    <input
                      type="number"
                      value={product.price}
                      onChange={(e) => handleProductEdit(product.id, "price", parseFloat(e.target.value))}
                      className="input-edit"
                    />
                  </td>
                  <td className="table-cell">{product.weight_value} {product.weight_unit}</td>
                  <td className="table-cell">
                    <button className="button-delete" onClick={() => handleProductDelete(product.id)}>
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

      {/* Add Product Section */}
      <div className="add-product-section">
        <h3>Add New Product</h3>
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Category ID"
          value={newProduct.category}
          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
        />
        <textarea
          placeholder="Description"
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
          type="number"
          placeholder="Weight Value"
          value={newProduct.weight_value}
          onChange={(e) => setNewProduct({ ...newProduct, weight_value: e.target.value })}
        />
        <select
          value={newProduct.weight_unit}
          onChange={(e) => setNewProduct({ ...newProduct, weight_unit: e.target.value })}
        >
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="lb">lb</option>
        </select>
        <input
          type="text"
          placeholder="Image URL"
          value={newProduct.image_url}
          onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
        />
        <button className="button-add" onClick={handleAddProduct}>Add Product</button>
      </div>

      {/* Orders Section */}
      <div>
        <h3 className="section-heading">Order Management</h3>
        <table className="table-wrapper">
          <thead className="table-header">
            <tr>
              <th className="table-cell">Order ID</th>
              <th className="table-cell">Customer</th>
              <th className="table-cell">Total</th>
              <th className="table-cell">Status</th>
              <th className="table-cell">Date</th>
              <th className="table-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders
              .slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage)
              .map(order => (
                <tr key={order.id}>
                  <td className="table-cell">#{order.id}</td>
                  <td className="table-cell">
                    {order.user_name}<br />
                    <small>{order.user_email}</small>
                  </td>
                  <td className="table-cell">₹{parseFloat(order.total).toFixed(2)}</td>
                  <td className="table-cell">
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="table-cell">
                    {new Date(order.placed_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <button 
                      className="button-edit" 
                      onClick={() => toggleOrderView(order.id)}
                    >
                      {openOrders[order.id] ? "Hide Details" : "View Details"}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        
        {/* Order Details */}
        {orders.map(order => (
          openOrders[order.id] && (
            <div key={order.id} className="order-details">
              <h4>Order #{order.id} Details</h4>
              <div className="order-info">
                <p><strong>Customer:</strong> {order.user_name} ({order.user_email})</p>
                <p><strong>Subtotal:</strong> ₹{parseFloat(order.subtotal).toFixed(2)}</p>
                <p><strong>Tax:</strong> ₹{parseFloat(order.tax).toFixed(2)}</p>
                <p><strong>Delivery:</strong> ₹{parseFloat(order.delivery).toFixed(2)}</p>
                <p><strong>Total:</strong> ₹{parseFloat(order.total).toFixed(2)}</p>
              </div>
              <h5>Items:</h5>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>₹{parseFloat(item.price).toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ))}
        
        <Pagination
          currentPage={orderPage}
          totalItems={orders.length}
          itemsPerPage={ordersPerPage}
          onPageChange={setOrderPage}
        />
      </div>
    </div>
  );
};

export default AdminPanel;