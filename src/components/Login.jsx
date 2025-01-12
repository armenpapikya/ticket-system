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
      const response = await axios.post('http://localhost:5000/login', {
        username: username,
        password: password,
      });

      if (response && response.data) {
        const { data } = response;
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        onLogin(data.role);
      } else {
        setError('Login failed. No data returned.');
      }
    } catch (error) {
      setError('Invalid credentials or server error!');
      console.error(error);
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
        placeholder="Օգտատեր"
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
