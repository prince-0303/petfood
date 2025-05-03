// src/pages/ThankYou.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './ThankYou.css';

const ThankYou = () => {
    const location = useLocation();
    const order = location.state?.order;

    if (!order) {
        return (
            <div className="thank-you-page">
                <h2>Order Not Found</h2>
                <p>It seems you navigated here directly.</p>
                <Link to="/">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="thank-you-page">
            <h1>🎉 Thank You!</h1>
            <p>Your order has been placed successfully.</p>
            <div className="order-details">
                <h3>Order Summary</h3>
                <p><strong>Order ID:</strong> #{order.id}</p>
                <p><strong>Items:</strong> {order.items.length}</p>
                <p><strong>Total:</strong> ₹ {order.total.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Placed At:</strong> {new Date(order.placedAt).toLocaleString()}</p>
            </div>
            <Link className="home-btn" to="/">Go back to Home</Link>
        </div>
    );
};

export default ThankYou;
