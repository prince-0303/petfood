import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/SignupLogin.css';

const SignupLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const { login, register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Login
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields.');
        return;
      }

      try {
        await login(formData.email, formData.password);
        
        // Get the user from localStorage after login completes
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        console.log('User after login:', user);
        console.log('Is staff?', user?.is_staff);
        
        toast.success('Login successful! Welcome back!');
        
        // Small delay to ensure state updates
        setTimeout(() => {
          if (user?.is_staff === true) {
            console.log('Navigating to /admin');
            navigate('/admin');
          } else {
            console.log('Navigating to /');
            navigate('/');
          }
        }, 100);
      } catch (err) {
        console.error('Full login error:', err);
        console.error('Backend response:', err.response?.data);
        const backendMsg = err.response?.data?.error || err.response?.data?.detail || 'Unknown error';
        setError(`Login failed: ${backendMsg}`);
      }
    } else {
      // Register
      if (!formData.first_name || !formData.email || !formData.password || !formData.password2) {
        setError('Please fill in all fields.');
        return;
      }

      if (formData.password !== formData.password2) {
        setError('Passwords do not match.');
        return;
      }

      try {
        await register({
          first_name: formData.first_name,
          last_name: formData.last_name || '',
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
        });
        toast.success('Account created successfully! Welcome!');
        navigate('/');
      } catch (err) {
        const msg = err.response?.data?.password?.[0] || 
          err.response?.data?.email?.[0] || 
          'Registration failed. Please try again.';
        setError(msg);
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password2: '',
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name (optional)"
                value={formData.last_name}
                onChange={handleChange}
              />
            </>
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          {!isLogin && (
            <input
              type="password"
              name="password2"
              placeholder="Confirm Password"
              value={formData.password2}
              onChange={handleChange}
              required
            />
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        
        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span onClick={toggleForm}>
            {isLogin ? 'Sign up' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupLogin;