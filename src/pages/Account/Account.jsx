import React, { useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Account.css';

const Account = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/login');
};


  if (!user) {
    return (
      <div>
        <p>Please log in to view your account.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="account">
      <h2>Account Details</h2>
      <p><strong>Name:</strong> {user.fullName}</p>
      <p><strong>Email:</strong> {user.email}</p>

      <h3 className="order-title">Order History</h3>
      {user.orders && user.orders.length > 0 ? (
        <div className="order-history">
          {user.orders.map(order => (
            <div className="order-card" key={order.id}>
              <p><strong>Order ID:</strong> #{order.id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Date:</strong> {new Date(order.placedAt).toLocaleString()}</p>

              <div className="order-items">

                {order.items.map((item, idx) => (
                  <div className="order-item" key={idx}>
                    <img src={item.image_url} alt={item.name} />
                    <div className="order-info">
                      <span><strong>Name:</strong> {item.name}</span>
                      <span><strong>Quantity:</strong> {item.quantity}</span>
                      <span><strong>Price:</strong> ${item.price}</span>
                      <span><strong>Ordered:</strong> {new Date(order.placedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

              </div>

              <p><strong>Total:</strong> ₹{order.total}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No orders found.</p>
      )}

      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Account;
