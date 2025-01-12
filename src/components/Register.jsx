/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import '../cssComponents/Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', {
        username,
        password,
        email,
        role,
      });

      alert('Գրանցումն ավարտվեց հաջողությամբ');
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Something went wrong');
      } else if (error.request) {
        setError('Server not reachable or no response');
      } else {
        setError('Unexpected error occurred');
      }
    }
  };  

  return (
    <div className="register">
      <h1>Գրանցվել</h1>
      {error && <div className="error">{error}</div>}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Օգտատեր"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Էլ. փոստ"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Գաղտնաբառ"
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">Օգտատեր</option>
        <option value="admin">Ադմին</option>
      </select>
      <button onClick={handleRegister}>Գրանցվել</button>
    </div>
  );
};

export default Register;
