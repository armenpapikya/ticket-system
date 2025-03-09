/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import '../cssComponents/AdminPanel.css';

const AdminPanel = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tickets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTickets(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Տոմսերը բեռնելու սխալ');
        console.error('Սխալ տոմսերը բեռնելիս:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const handleCloseTicket = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/tickets/${id}/close`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTickets(tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, status: 'closed' } : ticket
      ));
    } catch (err) {
      setError('Տոմսը փակելու սխալ');
      console.error('Սխալ տոմսը փակելիս:', err);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const isUserValid = !filterUser || ticket.user_id === parseInt(filterUser);
      const isStatusValid = !filterStatus || ticket.status === filterStatus;
      const isDateValid = !filterDate || new Date(ticket.created_at).toISOString().split('T')[0] === filterDate;
      
      return isStatusValid && isUserValid && isDateValid;
    });
  }, [tickets, filterStatus, filterUser, filterDate]);

  if (loading) return <p>Բեռնում...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-panel">
      <h1>Ադմինիստրատորի Վահանակ</h1>

      <div className="filters">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Բոլոր Կարգավիճակները</option>
          <option value="open">Բաց</option>
          <option value="closed">Փակված</option>
        </select>
        <input
          type="text"
          placeholder="Օգտատիրոջ ID"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {filteredTickets.length === 0 ? (
        <p>Չկան համապատասխան տոմսեր ըստ ֆիլտրերի</p>
      ) : (
        <ul>
          {filteredTickets.map((ticket) => (
            <li key={ticket.id} className="ticket-item">
              <div className="ticket-info">
                <h3>{ticket.title}</h3>
                <p>{ticket.description}</p>
                <p>Կարգավիճակ: {ticket.status}</p>
                <p>Ստեղծել է՝ Օգտատեր #{ticket.user_id}</p>
                <p>Ստեղծվել է՝ {new Date(ticket.created_at).toLocaleString()}</p>
              </div>
              {ticket.status === 'open' && (
                <button onClick={() => handleCloseTicket(ticket.id)}>Փակել Տոմսը</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPanel;
