/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../cssComponents/TicketList.css";

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("user");
  const [statusFilter, setStatusFilter] = useState("All");
  const [userFilter, setUserFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication error: No token found.");
        setLoading(false);
        return;
      }

      try {
        const userResponse = await axios.get("http://localhost:5000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRole(userResponse.data.role);

        const ticketsResponse = await axios.get("http://localhost:5000/api/tickets", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let fetchedTickets = Array.isArray(ticketsResponse.data) ? ticketsResponse.data : [ticketsResponse.data];

        if (userResponse.data.role !== "admin") {
          fetchedTickets = fetchedTickets.filter(ticket => ticket.status === "Բաց");
        }

        setTickets(fetchedTickets);
        setFilteredTickets(fetchedTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error.response || error.message);
        setError(error.response?.data?.message || "Error fetching tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (statusFilter !== "All") {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (userFilter) {
      filtered = filtered.filter(ticket => ticket.user === userFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(ticket => new Date(ticket.date)
      .toISOString()
      .startsWith(dateFilter));
    }

    setFilteredTickets(filtered);
  }, [statusFilter, userFilter, dateFilter, tickets]);

  const closeTicket = async (ticketId) => {
    if (userRole !== "admin") return;
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/tickets/${ticketId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(prev => prev.map(ticket => ticket.id === ticketId ? { ...ticket, status: "Փակ" } : ticket));
    } catch (error) {
      console.error("Error closing ticket:", error.response || error.message);
    }
  };

  return (
    <div className="ticket-list">
      <h2>Իմ տոմսերը</h2>

      <div className="filters">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">Բոլոր</option>
          <option value="open">Բաց</option>
          <option value="closed">Փակ</option>
        </select>

        {userRole === "admin" && (
          <input
            type="text"
            placeholder="Որպես օգտատեր"
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
          />
        )}

        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="loading-message">Տոմսերը բեռնում են...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : filteredTickets.length === 0 ? (
        <p className="no-tickets">Տոմսեր չկան։</p>
      ) : (
        <ul className="ticket-items">
          {filteredTickets.map((ticket) => (
            <li key={ticket.id} className="ticket-item">
              <h3 className="ticket-title">{ticket.title}</h3>
              <p className="ticket-description">{ticket.description}</p>
              {userRole === "admin" && ticket.status === "Բաց" && (
                <button onClick={() => closeTicket(ticket.id)}>Փակել</button>
              )}
              <span className="ticket-status">Կարգավիճակ: {ticket.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TicketList;
