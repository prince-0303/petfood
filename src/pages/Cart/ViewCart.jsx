import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../Context/AuthContext';
import './ViewCart.css';
import { Link } from 'react-router-dom';

const ViewCart = () => {

    

    const { user, setCartCount } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantityUpdates, setQuantityUpdates] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
            setLoading(false);
        }
    }, [user]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/users/${user.id}`);
            const data = await res.json();
            setCartItems(data.cart || []);
            const initialQuantities = {};
            data.cart?.forEach(item => {
                initialQuantities[item.productId] = item.quantity;
            });
            setQuantityUpdates(initialQuantities);


            const totalCount = data.cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            setCartCount(totalCount);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (productId, newQty) => {
        setQuantityUpdates(prev => ({
            ...prev,
            [productId]: Math.max(1, newQty),
        }));
    };

    const updateCartOnServer = async (updatedCartItems) => {
        if (!user || isUpdating) return;

        setIsUpdating(true);
        setUpdateError(null);

        try {
            await fetch(`http://localhost:3000/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart: updatedCartItems }),
            });

            setCartItems(updatedCartItems);

            const totalCount = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);
            setCartCount(totalCount);
        } catch (err) {
            console.error('Error updating cart:', err);
            setUpdateError('Could not update cart. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        if (user && cartItems.length > 0) {
            const updatedCart = cartItems.map(item => ({
                ...item,
                quantity: quantityUpdates[item.productId] || item.quantity,
            }));

            const hasChanged = cartItems.some(
                item => item.quantity !== (quantityUpdates[item.productId] || item.quantity)
            );

            if (hasChanged) {
                const timer = setTimeout(() => {
                    updateCartOnServer(updatedCart);
                }, 500);

                return () => clearTimeout(timer);
            }
        }
    }, [user, quantityUpdates, cartItems]);

    const removeFromCart = async (productId) => {
        if (!user) return;

        const updatedCart = cartItems.filter(item => item.productId !== productId);

        try {
            await updateCartOnServer(updatedCart);
        } catch (err) {
            console.error('Failed to remove from cart:', err);
            alert('Error removing item. Try again.');
        }
    };

    if (!user) return <div className="cart-page">Please login to view your cart.</div>;
    if (loading) return <div className="cart-page">Loading your cart...</div>;
    if (cartItems.length === 0) return <div className="cart-page">Your cart is empty.</div>;
    if (updateError) return <div className="cart-page error">{updateError}</div>;

    const total = cartItems.reduce(
        (sum, item) => sum + item.price * (quantityUpdates[item.productId] || item.quantity),
        0
    );

    return (
            <div className="cart-page">
                <h2>Your Cart</h2>
                <div className="cart-items">
                    {cartItems.map(item => (
                        <div className="cart-item" key={item.productId}>
                            <img src={item.image_url} alt={item.name} className="cart-item-img" />
                            <div className="cart-item-info">
                                <h3>{item.name}</h3>
                                <p>Price: ₹ {item.price}</p>
                                <div className="quantity-controls">
                                    <button onClick={() => handleQuantityChange(item.productId, (quantityUpdates[item.productId] || item.quantity) - 1)}>-</button>
                                    <span>{quantityUpdates[item.productId] || item.quantity}</span>
                                    <button onClick={() => handleQuantityChange(item.productId, (quantityUpdates[item.productId] || item.quantity) + 1)}>+</button>
                                </div>
                                <p>Total: ₹ {item.price * (quantityUpdates[item.productId] || item.quantity)}</p>
                                <button className="remove-btn" onClick={() => removeFromCart(item.productId)}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-total">
                    <h3>Total Amount: ₹ {total}</h3>
                    <Link to="/checkout" className="checkout-btn">Proceed to Checkout</Link>
                </div>
            </div>
    );
};

export default ViewCart;

