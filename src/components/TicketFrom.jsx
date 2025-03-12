/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import "../cssComponents/TicketFrom.css";

const TicketForm = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    if (!title.trim() || !description.trim()) {
      return 'Բոլոր դաշտերը պարտադիր են։';
    }
    if (title.length < 3) {
      return 'Տվյալը պետք է ունենա առնվազն 3 սիմվոլ։';
    }
    if (description.length < 10) {
      return 'Նկարագրությունը պետք է ունենա առնվազն 10 սիմվոլ։';
    }
    return '';
  };

  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Ավտորիզացիայի սխալ։ Պատահական սխալ՝ Token չի գտնվել։');
    }
    return token;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const error = validateInput();
    if (error) {
      setErrorMessage(error);
      return;
    }

    try {
      const token = getToken();
      setLoading(true);

      const response = await axios.post(
        'http://localhost:5000/api/tickets',
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onCreate?.(response.data);

      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Տոմսի ստեղծման սխալ:', error);
      setErrorMessage(error.response?.data?.message || 'Տոմսը ստեղծելիս սխալ է տեղի ունեցել։ Փորձեք նորից։');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Տոմսի վերնագիր"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Տոմսի նկարագրություն"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Տոմսի ստեղծում...' : 'Ստեղծել Տոմս'}
      </button>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </form>
  );
};

export default TicketForm;
