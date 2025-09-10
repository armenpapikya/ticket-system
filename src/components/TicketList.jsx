/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../cssComponents/TicketList.css";
import PropTypes from 'prop-types';

const TicketList = ({ refresh }) => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  const API_URL = "http://localhost:5000/api";

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const { data } = await axios.get(`/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRole(data.role);
      return data;
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data");
      return null;
    }
  };

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const { data } = await axios.get(`/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter !== "all" ? statusFilter : undefined },
      });

      setTickets(data.tickets);

      if (data.users && Array.isArray(data.users)) {
        const usersMap = {};
        data.users.forEach(user => {
          usersMap[user.id] = user;
        });
        setUsers(usersMap);
      } else {
        console.error("Users data is not available or not an array");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError(err.response?.data?.message || "Error fetching tickets");
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchUserData();
      await fetchTickets();
    };

    initialize();
  }, [statusFilter, refresh]);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `/api/tickets/${ticketId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Status update response:', response.data);

      setTickets(tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ));
    } catch (err) {
      console.error("Error updating ticket status:", err);
      setError(err.response?.data?.message || "Error updating ticket");
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm("Are you sure you want to delete selected tickets?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ticketIds: selectedTickets },
      });

      setTickets(tickets.filter(t => !selectedTickets.includes(t.id)));
      setSelectedTickets([]);
    } catch (err) {
      console.error("Error deleting tickets:", err);
      setError(err.response?.data?.message || "Error deleting tickets");
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  if (loading) return <div className="loading">Loading tickets...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="ticket-list-container">
      <div className="ticket-header">
        <h2>Ticket Management System</h2>

        <div className="controls">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {userRole === "admin" && selectedTickets.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="delete-btn"
            >
              Delete Selected ({selectedTickets.length})
            </button>
          )}
        </div>
      </div>

      {currentTickets.length === 0 ? (
        <div className="no-tickets">No tickets found</div>
      ) : (
        <>
          <div className="ticket-grid">
            {currentTickets.map(ticket => (
              <div 
                key={ticket.id} 
                className={`ticket-card ${ticket.status}`}
              >
                <div className="ticket-header">
                  <h3>{ticket.title}</h3>
                  {userRole === "admin" && (
                    <input
                      type="checkbox"
                      checked={selectedTickets.includes(ticket.id)}
                      onChange={() => 
                        setSelectedTickets(prev => 
                          prev.includes(ticket.id)
                            ? prev.filter(id => id !== ticket.id)
                            : [...prev, ticket.id]
                        )
                      }
                    />
                  )}
                </div>

                <p className="ticket-description">{ticket.description}</p>

                <div className="ticket-meta">
                  <span className="creator">
                    Created by: {users[ticket.user_id]?.username || "Unknown"}
                  </span>
                  <span className="date">
                    {new Date(ticket.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="ticket-actions">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span>Page {currentPage} of {totalPages}</span>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

TicketList.propTypes = {
  refresh: PropTypes.bool
};

export default TicketList;
