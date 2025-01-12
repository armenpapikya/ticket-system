/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import '../cssComponents/Header.css';

// eslint-disable-next-line react/prop-types
const Header = ({ role }) => {
  return (
    <div className="header">
      <h1>Տիկետների Ծառայություն</h1>
      {role ? (
        <nav>
          <Link to="/">Գլխավոր</Link>
          <Link to="/profile">Պրոֆիլ</Link>
        </nav>
      ) : (
        <nav>
          <Link to="/login">Մուտք Գործել</Link>
          <Link to="/register">Գրանցվել</Link>
        </nav>
      )}
    </div>
  );
};

export default Header;
