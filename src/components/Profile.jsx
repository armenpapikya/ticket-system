/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../cssComponents/Profile.css';
import TicketForm from "./TicketForm";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Retrieved token:", token);

      if (!token) {
        setError('Նախքան պրոֆիլի բեռնումը խնդրում ենք մուտք գործել');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      console.log("Decoded Token:", decodedToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        setError('Ձեր մուտքի token-ը ժամկետանց է: Խնդրում ենք մուտք գործել նորից');
        setLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await axios.get("/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Profile response:", response);

      if (response.status === 200) {
        setUser(response.data);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      if (err.response) {
        console.error("Error response:", err.response);
      }
      setError('Պրոֆիլը բեռնելիս սխալ է տեղի ունեցել: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <p>Բեռնում...</p>;

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile">
      {user ? (
        <div className="profile-info">
          <h1>Պրոֆիլ</h1>
          <TicketForm />
          <p>{user.username}</p>
        </div>
      ) : (
        <p>Պրոֆիլը չի գտնվել:</p>
      )}
    </div>
  );
};

export default Profile;
