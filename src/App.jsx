import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignupLogin from './pages/SignupLogin';
import ProductPage from './pages/ProductsPage';
import SearchBar from "./components/SearchBar";
import Footer from './components/Footer';
import Account from './pages/Account/Account';
import ViewCart from './pages/Cart/ViewCart';
import { AuthProvider, AuthContext } from './Context/AuthContext';
import { useContext } from 'react';
import Checkout from './pages/Checkout/Checkout';
import './App.css';
import ThankYou from './pages/Thankyou/ThankYou';
import AdminPanel from './pages/Admin/AdminPage';
import { ToastContainer } from 'react-toastify';

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
  const { user, loading } = useContext(AuthContext);

  // Protected Admin Route Component
  const ProtectedAdminRoute = ({ children }) => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px' }}>
          Loading...
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (!user.is_staff) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <div className="App">
      <Navbar />
      <SearchBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />

        {/* Public */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <SignupLogin />} 
        />

        {/* Protected Admin Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminPanel />
            </ProtectedAdminRoute>
          } 
        />

        {/* Protected User Routes */}
        <Route
          path="/account"
          element={
            loading ? (
              <div style={{ textAlign: 'center', padding: '100px', fontSize: '18px' }}>
                Loading your account...
              </div>
            ) : user ? (
              <Account />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/viewcart" element={<ViewCart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thankyou" element={<ThankYou />} />
      </Routes>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default App;