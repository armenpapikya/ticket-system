/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import axios from 'axios';
import '../cssComponents/Register.css';

const Register = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        email,
        password,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response && response.data) {
        setMessage(response.data.message);
        onRegister && onRegister();
      } else {
        setError('Գրանցումը ձախողվեց, ստուգեք տվյալները։');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Սերվերի խնդիր');
    }
  };

  return (
    <div className="register">
      <h1>Գրանցում</h1>
      {error && <div className="error">{error}</div>}
      {message && <div className="message">{message}</div>}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Օգտագործողի անուն"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Էլ․ հասցե"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Գաղտնաբառ"
      />
      <button onClick={handleRegister}>Գրանցվել</button>
    </div>
  );
};

export default Register;
