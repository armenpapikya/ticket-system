/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import axios from 'axios';
import '../cssComponents/TicketFrom.css'
const TicketForm = ({ onCreate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/tickets', { title, description }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            onCreate(response.data);
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Error creating ticket', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ticket Title"
                required
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ticket Description"
                required
            />
            <button type="submit">Create Ticket</button>
        </form>
    );
};

export default TicketForm;
