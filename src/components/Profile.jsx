/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TicketFrom from './TicketFrom';
import '../cssComponents/Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Նախքան պրոֆիլի բեռնումը խնդրում ենք մուտք գործել');
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setUser(response.data);
      }
    } catch (err) {
      if (err.response && err.response.status === 429) {
        setError('Երրորդ կողմի պրոֆիլը հաճախակի հարցումների պատճառով չի կարող բեռնել։ Խնդրում ենք մի փոքր սպասել։');
      } else {
        setError('Պրոֆիլը բեռնելիս սխալ է տեղի ունեցել: ' + err.message);
      }
      console.error(err);
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
          <TicketFrom />
          <p>{user.username}</p>
        </div>
      ) : (
        <p>Պրոֆիլը չի գտնվել:</p>
      )}
    </div>
  );
};

export default Profile;
