import { useLocation, Link } from 'react-router-dom';
import './ThankYou.css';

const ThankYou = () => {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="thank-you-page">
        <h2>No Order Found</h2>
        <p>You may have navigated here directly.</p>
        <Link to="/" className="home-btn">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="thank-you-page">
      <h1>🎉 Thank You for Your Order!</h1>
      <p>Your order has been successfully placed.</p>

      <div className="order-details">
        <h3>Order Confirmation</h3>
        <p><strong>Order ID:</strong> #{order.id}</p>
        <p><strong>Status:</strong> <span className="status-confirmed">{order.status}</span></p>
        <p><strong>Placed on:</strong> {new Date(order.placed_at).toLocaleString()}</p>
        <p><strong>Total Amount:</strong> ₹{parseFloat(order.total).toFixed(2)}</p>

        <h4>Delivery Address</h4>
        {order.address_details && (
          <div className="address">
            <p><strong>{order.address_details.full_name}</strong> ({order.address_details.mobile})</p>
            <p>{order.address_details.street}</p>
            <p>{order.address_details.city}, {order.address_details.state} - {order.address_details.zip_code}</p>
            <p>{order.address_details.country}</p>
          </div>
        )}

        <h4>Items Ordered ({order.items.length})</h4>
        <div className="items-list">
          {order.items.map(item => (
            <div key={item.id} className="thankyou-item">
              {item.product_image && (
                <img src={item.product_image} alt={item.product_name} width="60" />
              )}
              <div>
                <p><strong>{item.product_name}</strong></p>
                <p>Quantity: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="actions">
        <Link to="/account" className="home-btn">View Order History</Link>
        <Link to="/" className="home-btn secondary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default ThankYou;