/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../cssComponents/Home.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem("token");
   
      if (!token) {
        setError("No authentication token found. Please log in.");
        navigate("/login");
        return;
      }
   
      try {
        const response = await axios.get("http://localhost:5000/api/tickets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log(response.data);  // Log the response to inspect it
   
        if (Array.isArray(response.data)) {
          setTickets(response.data);
        } else {
          setError("Expected an array of tickets, but got something else.");
        }
      } catch (err) {
        console.error("Error fetching tickets:", err.response?.data || err.message);
        setError("Error fetching tickets");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [navigate]);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="home">
      <h1 className="title">Բարի Գալուստ Տոմսերի Կառավարման Ծառայություն</h1>
      {tickets.length === 0 ? (
        <p>No tickets available.</p>
      ) : (
        <div className="tickets-container">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket">
              <h3 className="ticket-title">{ticket.title}</h3>
              <p className="ticket-description">{ticket.description}</p>
              <p className="ticket-status">Status: {ticket.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
