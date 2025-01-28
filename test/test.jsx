/* eslint-disable no-undef */
import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app'; // Correct the path to your Express app
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render } from '@testing-library/react';
import Home from '../src/components/Home'; // Ensure path is correct
import TicketForm from '../src/components/TicketFrom'; // Ensure path is correct
import '@babel/register';


require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['transform-require-ignore'],
});
require('ignore-styles');
describe('Simple Test', function () {
  it('should work', function () {
    expect(true).to.equal(true);
  });
});

describe('GET /api/tickets', function () {
  it('should return a list of tickets', async function () {
    const response = await request(app).get('/api/tickets');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    expect(response.body.length).to.be.greaterThan(0);
  });
});

describe('POST /api/tickets', function () {
  it('should create a new ticket', async function () {
    const newTicket = { title: 'New Ticket', description: 'Test Description' };
    const response = await request(app).post('/api/tickets').send(newTicket);
    expect(response.status).to.equal(201);
    expect(response.body.title).to.equal(newTicket.title);
  });
});

describe('<Home />', function () {
  it('should render the page title', function () {
    const { getByText } = render(<Home />);
    expect(getByText('Welcome to the Ticket System')).to.not.be.null;
  });
});

describe('<TicketForm />', function () {
  it('should show a list of tickets in the component', function () {
    const tickets = [
      { id: 1, title: 'Ticket 1', description: 'First ticket' },
      { id: 2, title: 'Ticket 2', description: 'Second ticket' },
    ];
    const { getByText } = render(<TicketForm tickets={tickets} />);
    tickets.forEach(ticket => {
      expect(getByText(ticket.title)).to.not.be.null;
    });
  });
});

console.log('Starting test...');
