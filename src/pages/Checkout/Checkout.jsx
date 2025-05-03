import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

const Checkout = () => {
    const { user, setCartCount, setUser } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [address, setAddress] = useState({
        fullName: '',
        mobile: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        fetch(`http://localhost:3000/users/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setCartItems(data.cart || []);
                setLoading(false);
                // Optional: preload last used address if saved
                if (data.address) setAddress(data.address);
            });
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const validateAddress = () => {
        return Object.values(address).every(field => field.trim() !== '');
    };

    const calculateTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const delivery = subtotal > 1000 ? 0 : 50;
        const tax = subtotal * 0.1;
        const total = subtotal + delivery + tax;
        return { subtotal, delivery, tax, total };
    };

    const handlePlaceOrder = async () => {
        if (!validateAddress()) {
            alert('Please fill in all address fields.');
            return;
        }

        setPlacingOrder(true);
        const { subtotal, delivery, tax, total } = calculateTotals();

        const newOrder = {
            id: Date.now(),
            items: cartItems,
            address,
            subtotal,
            delivery,
            tax,
            total,
            status: 'Placed',
            placedAt: new Date().toISOString(),
        };

        try {
            const res = await fetch(`http://localhost:3000/users/${user.id}`);
            const userData = await res.json();
            const updatedOrders = [...(userData.orders || []), newOrder];

            await fetch(`http://localhost:3000/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders: updatedOrders, cart: [], address }),
            });

            // ✅ Fetch updated user and update context + localStorage

            const updatedRes = await fetch(`http://localhost:3000/users/${user.id}`);
            const updatedUser = await updatedRes.json();
            localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setCartCount(0);
            // alert('Order placed successfully!');
            navigate('/thankyou', { state: { order: newOrder } });
        } catch (err) {
            console.error('Failed to place order:', err);
            alert('Order could not be placed. Try again.');
        } finally {
            setPlacingOrder(false);
        }
    };


    if (!user) return <div className="checkout-page">Please login to checkout.</div>;
    if (loading) return <div className="checkout-page">Loading checkout...</div>;
    if (cartItems.length === 0) return <div className="checkout-page">Your cart is empty.</div>;

    const { subtotal, delivery, tax, total } = calculateTotals();

    return (
        <div className="checkout-page">
            <h2>Checkout</h2>
            <div className="checkout-container">
                <div className="address-form">
                    <h3>Shipping Address</h3>
                    {['fullName', 'mobile', 'street', 'city', 'state', 'zipCode', 'country'].map(field => (
                        <input
                            key={field}
                            type="text"
                            name={field}
                            value={address[field]}
                            onChange={handleInputChange}
                            placeholder={field.replace(/([A-Z])/g, ' ₹1')}
                            required
                        />
                    ))}
                </div>



                <div className="order-summary">
                    <h3>Order Summary</h3>
                    {cartItems.map(item => (
                        <div key={item.productId} className="summary-item">
                            <p>{item.name} × {item.quantity}</p>
                            <p>₹ {item.price * item.quantity}</p>
                        </div>
                    ))}
                    <hr />
                    <div className="summary-details">
                        <p>Subtotal: ₹ {subtotal.toFixed(2)}</p>
                        <p>Tax (10%): ₹ {tax.toFixed(2)}</p>
                        <p>Delivery: ₹ {delivery.toFixed(2)}</p>
                        <h4>Total: ₹ {total.toFixed(2)}</h4>
                    </div>

                    <button className="pay-btn" onClick={handlePlaceOrder} disabled={placingOrder}>
                        {placingOrder ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
