/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../cssComponents/TicketList.css";

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTickets, setSelectedTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Unauthorized: No token found.");

      const response = await axios.get("http://localhost:5173/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Tickets fetched:", response.data);

      const fetchedTickets = Array.isArray(response.data)
        ? response.data
        : [response.data];

      setTickets(fetchedTickets);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tickets:", err.message);
      setError("Error fetching tickets: " + err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No token found. Please log in again.");
        setLoading(false);
        return;
      }
      await fetchTickets();
    };

    fetchData();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter === "All") return true;
    const statusMapping = { "Բաց": "open", "Փակ": "closed" };
    return ticket.status === statusMapping[statusFilter];
  });

  const handleSelectTicket = (id) => {
    setSelectedTickets((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((ticketId) => ticketId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Unauthorized: No token found.");

      await axios.delete("http://localhost:5173/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
        data: { ticketIds: selectedTickets },
      });

      console.log("Deleted tickets with IDs:", selectedTickets);

      setTickets(tickets.filter(ticket => !selectedTickets.includes(ticket.id)));
      setSelectedTickets([]);
    } catch (err) {
      console.error("Error deleting tickets:", err.message);
      setError("Error deleting tickets: " + err.message);
    }
  };

  return (
    <div className="ticket-list">
      <h2>Բոլոր տոմսերը</h2>

      <div className="filters">
        <label htmlFor="statusFilter">Տոմսի կարգավիճակ</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">Բոլոր</option>
          <option value="Բաց">Բաց</option>
          <option value="Փակ">Փակ</option>
        </select>
      </div>

      {loading ? (
        <p className="loading-message">Տոմսերը բեռնում են...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : filteredTickets.length > 0 ? (
        <ul className="ticket-items">
          {filteredTickets.map(ticket => (
            <li key={ticket.id} className="ticket-item">
              <input
                type="checkbox"
                checked={selectedTickets.includes(ticket.id)}
                onChange={() => handleSelectTicket(ticket.id)}
              />
              <h3 className="ticket-title">{ticket.title}</h3>
              <p className="ticket-description">{ticket.description}</p>
              <p className="ticket-createdBy">Ստեղծող: {ticket.createdBy}</p>
              <p className="ticket-createdAt">
                Ստեղծվել է: {new Date(ticket.created_at).toLocaleString()}
              </p>
              <span className="ticket-status">
                Կարգավիճակ: {ticket.status === "open" ? "Բաց" : "Փակ"}
              </span>
            </li>
          ))}

          <button onClick={handleDeleteSelected}>Ջնջել ընտրված</button>
        </ul>
      ) : (
        <p className="no-tickets">Տոմսեր չկան։</p>
      )}
    </div>
  );
};

export default TicketList;
