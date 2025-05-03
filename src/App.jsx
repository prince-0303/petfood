import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignupLogin from './pages/SignupLogin';
import ProductPage from './pages/ProductsPage';
import SearchBar from './components/SearchBar';
import Footer from './components/Footer';
import Account from './pages/Account/Account';
import ViewCart from './pages/Cart/ViewCart';
import { AuthProvider } from './Context/AuthContext';
import { useContext } from 'react';
import { AuthContext } from './Context/AuthContext';
import Checkout from './pages/Checkout/Checkout';
import './App.css';
import ThankYou from './pages/Thankyou/ThankYou';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <div className='App' >
        <Navbar />
        <SearchBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:name" element={<ProductPage />} />
          <Route path="/login" element={<SignupLogin />} />

          {/* Protected Route for Account */}

          <Route
            path="/account"
            element={user ? <Account /> : <Navigate to="/login" replace />}
          />

          <Route path="/viewcart" element={<ViewCart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thankyou" element={<ThankYou />} />

        </Routes>
        <Footer />
      </div>
    </>
  );
}

export default App;
