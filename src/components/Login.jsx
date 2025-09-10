/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from "react";
import axios from "axios";
import "../cssComponents/Login.css";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!username || !password) {
      setError("Խնդրում ենք լրացնել բոլոր դաշտերը");
      return;
    }

    setLoading(true);

    try {
      console.log("Login attempt with", { email: username, password });

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email: username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Server Response:", response);
      console.log("🔍 Response Data:", response.data);

      if (response.status !== 200 || !response.data.accessToken) {
        setError("Մուտք գործումը ձախողվեց, տվյալներ վերադարձված չեն:");
        return;
      }

      const { accessToken, user } = response.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("username", user.username);
      localStorage.setItem("role", user.role);
      onLogin(user.role);
      console.log("Login successful:", response);
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Սխալ մուտքագրված տվյալներ կամ սերվերի խնդիր!");
      } else {
        setError("Սխալ մուտքագրված տվյալներ կամ սերվերի խնդիր!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <h1>Մուտք Գործել</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Օգտանուն կամ Էլ․ հասցե"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Գաղտնաբառ"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Բեռնում..." : "Մուտք Գործել"}
        </button>
      </form>
    </div>
  );
};

export default Login;
