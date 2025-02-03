import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import './Register.css';
import '../shared/Login_Register.css';
import '../shared/branding.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('recruiter'); 
  const [passwordValid, setPasswordValid] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const navigate = useNavigate();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validatePassword = (password: string) => {
    setPassword(password);
    setPasswordValid(passwordRegex.test(password));
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      setModalTitle('Error');
      setModalMessage('Please fill in all fields.');
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setModalTitle('Invalid Email');
      setModalMessage('Please provide a valid email address.');
      return;
    }

    if (!passwordValid) {
      setModalTitle('Invalid Password');
      setModalMessage(
        'Password must meet the requirements: at least 8 characters, include an uppercase letter, a lowercase letter, a number, and a special character.'
      );
      return;
    }

    try {
      await api.post('/users/register', { name, email: email.trim(), password, role });
      setModalTitle('Success');
      setModalMessage('User registered successfully! Redirecting...');
      setTimeout(() => {
        setModalMessage(null);
        navigate('/');
      }, 3000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setModalTitle('User Exists');
        setModalMessage('A user with this email already exists.');
      } else {
        setModalTitle('Error');
        setModalMessage('An error occurred. Please try again later.');
      }
    }
  };

  return (
    <div className="container">
      <div className="branding-container">
        <h1 className="branding-title">Hirea</h1>
        <p className="branding-subtitle">Simplify Hiring, Amplify Talent</p>
      </div>
      <div className="box">
        <h1 className="register-title">Sign Up</h1>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
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
          onChange={(e) => validatePassword(e.target.value)}
          className="input"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="select">
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <div className="password-requirements">
          <small>Password must include:</small>
          <ul>
            <li style={{ color: password.length >= 8 ? 'green' : 'red' }}>
              At least 8 characters
            </li>
            <li style={{ color: /[A-Z]/.test(password) ? 'green' : 'red' }}>
              At least one uppercase letter
            </li>
            <li style={{ color: /[a-z]/.test(password) ? 'green' : 'red' }}>
              At least one lowercase letter
            </li>
            <li style={{ color: /\d/.test(password) ? 'green' : 'red' }}>
              At least one number
            </li>
            <li style={{ color: /[@$!%*?&]/.test(password) ? 'green' : 'red' }}>
              At least one special character (@$!%*?&)
            </li>
          </ul>
        </div>
        <button onClick={handleRegister} className="button">
          Sign Up
        </button>
        <p className="footer">
          Already have an account? <Link to="/">Login here</Link>
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

export default Register;
