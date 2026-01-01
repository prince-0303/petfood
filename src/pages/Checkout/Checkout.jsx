import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import { addressService } from '../../services/addressService';
import { orderService } from '../../services/orderService';
import './Checkout.css';

const Checkout = () => {
    const { user, fetchAndSetCartCount } = useContext(AuthContext);
    const [cart, setCart] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        full_name: '',
        mobile: '',
        street: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'India',
    });
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [cartRes, addrRes] = await Promise.all([
                    cartService.getCart(),
                    addressService.getAddresses(),
                ]);
                setCart(cartRes);
                setAddresses(addrRes);

                // Auto-select first address if available
                if (addrRes.length > 0) {
                    setSelectedAddressId(addrRes[0].id);
                } else {
                    setShowNewAddressForm(true);
                }
            } catch (err) {
                console.error('Error loading checkout data:', err);
                alert('Failed to load cart or addresses');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleCreateAddress = async () => {
        try {
            const created = await addressService.createAddress(newAddress);
            setAddresses([...addresses, created]);
            setSelectedAddressId(created.id);
            setShowNewAddressForm(false);
            setNewAddress({
                full_name: '', mobile: '', street: '', city: '', state: '', zip_code: '', country: 'India'
            });
        } catch (err) {
            alert('Failed to save address');
        }
    };

    const calculateTotals = () => {
        if (!cart || !cart.items) return { subtotal: 0, tax: 0, delivery: 0, total: 0 };
        const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const delivery = subtotal > 1000 ? 0 : 50;
        const tax = subtotal * 0.1;
        const total = subtotal + delivery + tax;
        return { subtotal, delivery, tax, total };
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert('Please select or add a delivery address');
            return;
        }

        setPlacingOrder(true);
        try {
            const { subtotal, delivery, tax, total } = calculateTotals();

            const orderData = {
                address: selectedAddressId,
                subtotal,
                tax,
                delivery,
                total,
                items: cart.items.map(item => ({
                    product: item.product.id,
                    price: item.product.price,
                    quantity: item.quantity,
                })),
            };

            const result = await orderService.placeOrder(orderData);

            // Update cart count (should be 0 now)
            await fetchAndSetCartCount();

            navigate('/thankyou', { state: { order: result.order } });
        } catch (err) {
            console.error('Order placement failed:', err);
            alert('Order failed. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
    };

    if (!user) return <div>Please login to checkout</div>;
    if (loading) return <div>Loading checkout...</div>;
    if (!cart || cart.items.length === 0) return <div>Your cart is empty</div>;

    const { subtotal, delivery, tax, total } = calculateTotals();

    return (
        <div className="checkout-page">
            <h2>Checkout</h2>
            <div className="checkout-container">

                {/* Address Section */}
                <div className="address-section">
                    <h3>Delivery Address</h3>

                    {addresses.length > 0 && (
                        <div className="address-list">
                            {addresses.map(addr => (
                                <label key={addr.id} className="address-option">
                                    <input
                                        type="radio"
                                        name="address"
                                        value={addr.id}
                                        checked={selectedAddressId === addr.id}
                                        onChange={(e) => setSelectedAddressId(e.target.value)}
                                    />
                                    <div>
                                        <strong>{addr.full_name}</strong> ({addr.mobile})<br />
                                        {addr.street}, {addr.city}, {addr.state} - {addr.zip_code}<br />
                                        {addr.country}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    <button onClick={() => setShowNewAddressForm(!showNewAddressForm)}>
                        {showNewAddressForm ? 'Cancel' : '+ Add New Address'}
                    </button>

                    {showNewAddressForm && (
                        <div className="new-address-form">
                            <input placeholder="Full Name" value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} />
                            <input placeholder="Mobile" value={newAddress.mobile} onChange={e => setNewAddress({ ...newAddress, mobile: e.target.value })} />
                            <input placeholder="Street Address" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} />
                            <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                            <input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                            <input placeholder="ZIP Code" value={newAddress.zip_code} onChange={e => setNewAddress({ ...newAddress, zip_code: e.target.value })} />
                            <button onClick={handleCreateAddress}>Save Address</button>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="order-summary">
                    <h3>Order Summary</h3>
                    {cart.items.map(item => (
                        <div key={item.id} className="summary-item">
                            <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="summary-img"
                            />

                            <div>
                                <p>{item.product.name} × {item.quantity}</p>
                                <p>₹{(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                    <hr />
                    <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                    <p>Tax (10%): ₹{tax.toFixed(2)}</p>
                    <p>Delivery: ₹{delivery.toFixed(2)}</p>
                    <h3>Total: ₹{total.toFixed(2)}</h3>

                    <button
                        className="pay-btn"
                        onClick={handlePlaceOrder}
                        disabled={placingOrder || !selectedAddressId}
                    >
                        {placingOrder ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;