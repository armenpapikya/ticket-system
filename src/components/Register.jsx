/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import '../cssComponents/Register.css';

const Register = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordValidation = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
  
    if (!passwordValidation(password)) {
      setPasswordError('Գաղտնաբառը պետք է պարունակի առնվազն մեկ փոքրատառ, մեկ մեծատառ, մեկ թիվ և մեկ հատուկ սիմվոլ (8 և ավելի նշան)');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        { email, password, username }
      );
  
      if (response.status === 201) { 
        alert("Գրանցումը հաջողվեց!");
        setEmail("");
        setPassword("");
        setUsername("");
        onRegister(response.data);
      } else {
        setError("Գրանցումը ձախողվեց: Խնդրում ենք փորձել կրկին.");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Գրանցումը ձախողվեց: Խնդրում ենք փորձել կրկին.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <h1>Գրանցվել</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleRegister}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Էլ. փոստ"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Գաղտնաբառ"
          required
        />
        {passwordError && <div className="error">{passwordError}</div>}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Օգտագործողի անուն"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Բեռնում...' : 'Գրանցվել'}
        </button>
      </form>
    </div>
  );
};

export default Register;
