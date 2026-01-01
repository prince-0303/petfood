import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { orderService } from '../../services/orderService';
import { addressService } from '../../services/addressService';
import './Account.css';

const Account = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'orders') {
          const data = await orderService.getOrders();
          setOrders(data);
        } else if (activeTab === 'addresses') {
          const data = await addressService.getAddresses();
          setAddresses(data);
        }
      } catch (err) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  return (
    <div className="account-page">
      <h2>My Account</h2>

      <div className="tabs">
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          Profile
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          Orders
        </button>
        <button className={activeTab === 'addresses' ? 'active' : ''} onClick={() => setActiveTab('addresses')}>
          Addresses
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h3>Personal Information</h3>
            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h3>Order History</h3>
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p>No orders yet. <Link to="/">Start shopping!</Link></p>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <p><strong>Order #{order.id}</strong></p>
                      <p><strong>Status:</strong> <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></p>
                      <p><strong>Date:</strong> {new Date(order.placed_at).toLocaleDateString()}</p>
                      <p><strong>Total:</strong> ₹{parseFloat(order.total).toFixed(2)}</p>
                    </div>

                    <div className="order-items">
                      {order.items.map(item => (
                        <div key={item.id} className="order-item">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} />
                          )}
                          <div>
                            <p>{item.product_name}</p>
                            <p>Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="addresses-section">
            <h3>Saved Addresses</h3>
            {loading ? (
              <p>Loading addresses...</p>
            ) : addresses.length === 0 ? (
              <p>No saved addresses yet.</p>
            ) : (
              <div className="addresses-list">
                {addresses.map(addr => (
                  <div key={addr.id} className="address-card">
                    <p><strong>{addr.full_name}</strong> ({addr.mobile})</p>
                    <p>{addr.street}</p>
                    <p>{addr.city}, {addr.state} - {addr.zip_code}</p>
                    <p>{addr.country}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;