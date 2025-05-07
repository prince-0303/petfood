import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import '../styles/SignupLogin.css';

const SignupLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !fullName)) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/users');
      const users = await response.json();

      if (isLogin) {
        const matchedUser = users.find(
          (user) => user.email === email && user.password === password
        );

        if (matchedUser) {
          login(matchedUser);
          alert('Login successful!');

          if (matchedUser.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
        else {
          alert('Invalid credentials or user does not exist.');
        }
      } else {
        const userExists = users.some((user) => user.email === email);
        if (userExists) {
          alert('User already exists with this email.');
        } else {
          const newUser = { fullName, email, password, role: 'user' };
          await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
          });

          alert('Signup successful! You can now log in.');
          setIsLogin(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again later.');
    }
  };

  // Toggle between login and signup forms
  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
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
