import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import './Login.css';
import '../shared/Login_Register.css';
import '../shared/branding.css';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setModalTitle('Missing Fields');
      setModalMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/users/login', { email, password });

      const token = response.data.token;
      localStorage.setItem('token', token);

      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = userResponse.data;
      const formattedUser = {
        ...userData,
        lastName: userData.last_name || '',
        profilePicture:
          userData.profile_picture || '/assets/default-profile.svg',
      };

      setUser(formattedUser);
      setModalTitle('Success');
      setModalMessage('Logged in successfully!');
      setTimeout(() => {
        setModalMessage(null);
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setModalTitle('Error');
      setModalMessage(
        error.response?.data?.message || 'Login failed. Check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="branding-container">
        <h1 className="branding-title">Hirea</h1>
        <p className="branding-subtitle">Simplify Hiring, Amplify Talent</p>
      </div>
      <div className="box">
        <h1 className="login-title">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <button
          onClick={handleLogin}
          className="button"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="footer">
          Don't have an account? <Link to="/register">Sign up here</Link>
        </p>
      </div>
      {modalMessage && modalTitle && (
        <Modal
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalMessage(null)}
        />
      )}
    </div>
  );
};

export default Login;
