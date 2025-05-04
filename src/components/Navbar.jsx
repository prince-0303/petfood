import React, { useContext } from 'react';
import logo from '../assets/logo.png';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { AuthContext } from '../Context/AuthContext';
import '../styles/Navbar.css';
import { Link, useLocation } from 'react-router';

const Navbar = () => {
  const { cartCount } = useContext(AuthContext);

  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <img src={logo} alt="PetShop Logo" className="logo-image" />
        </Link>
      </div>
      <div className="navbar-right">
        <Link to="/account" className="nav-icon">
          <AccountCircleIcon sx={{ fontSize: '2rem' }} />
        </Link>


        {!isLoginPage && (
          <div className="nav-icon cart-icon-wrapper">
            <Link to="/viewcart">
              <ShoppingCartIcon
                sx={{ fontSize: '2rem' }}
                style={{ textDecoration: 'none', color: '#555' }}
              />
            </Link>
            {cartCount > 0 && (
              <div className="cart-count">{cartCount}</div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
