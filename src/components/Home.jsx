// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TicketForm from './TicketFrom';
import '../cssComponents/Home.css'

const Home = () => {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/tickets', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setTickets(response.data);
            } catch (error) {
                console.error('Error fetching tickets', error);
            }
        };

        fetchTickets();
    }, []);

    const handleCreateTicket = (ticket) => {
        setTickets((prevTickets) => [...prevTickets, ticket]);
    };

    return (
        <div>
            <h1>Բարի Գալուստ</h1>
            <TicketForm onCreate={handleCreateTicket} />
            <div>
                {tickets.map((ticket) => (
                    <div key={ticket.id}>
                        <h3>{ticket.title}</h3>
                        <p>{ticket.description}</p>
                        <p>Status: {ticket.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
