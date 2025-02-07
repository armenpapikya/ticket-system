/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import axios from 'axios';
import '../cssComponents/Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Login attempt with', { email: username, password });
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: username,
        password: password,
      });

      if (response && response.data) {
        const { token, username, role } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        onLogin(role);
      } else {
        setError('Մուտք գործումը ձախողվեց, տվյալներ վերադարձված չեն:');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Սխալ մուտքագրված տվյալներ կամ սերվերի խնդիր!');
    }
  };

  return (
    <div className="login">
      <h1>Մուտք Գործել</h1>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Էլ․ հասցե"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Գաղտնաբառ"
      />
      <button onClick={handleLogin}>Մուտք Գործել</button>
    </div>
  );
};

export default Login;
