import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [cartCount, setCartCount] = useState(0);


    // Fetch cart from server and calculate total quantity
    const fetchAndSetCartCount = async (userId) => {
        try {
            const res = await fetch(`http://localhost:3000/users/${userId}`);
            const data = await res.json();
            const cart = data.cart || [];
            const total = cart.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(total);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCartCount(0);
        }
    };

    // Update cart count on login or user change
    useEffect(() => {
        if (user) {
            fetchAndSetCartCount(user.id);
        } else {
            setCartCount(0);
        }
    }, [user]);

    const login = async (userData) => {
        try {
            const res = await fetch(`http://localhost:3000/users/${userData.id}`);
            const freshUser = await res.json();
            localStorage.setItem('loggedInUser', JSON.stringify(freshUser));
            setUser(freshUser);
            fetchAndSetCartCount(freshUser.id);
        } catch (error) {
            console.error('Login fetch error:', error);
        }
    };

    const logout = async () => {
        try {
            localStorage.removeItem('loggedInUser');
            setUser(null);
            setCartCount(0);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                login,
                logout,
                cartCount,
                setCartCount,
                fetchAndSetCartCount,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
