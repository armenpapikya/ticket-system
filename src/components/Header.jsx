import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../cssComponents/Header.css';

const Header = ({ role, logout }) => {
  const handleLogout = () => {
    try {
      logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>Տիկետների Ծառայություն</h1>
      </div>
      <nav>
        {role ? (
          <div className="nav-links">
            <Link to="/" className="nav-link">Գլխավոր</Link>
            <Link to="/profile" className="nav-link">Պրոֆիլ</Link>
            <button onClick={handleLogout} className="nav-button">Դուրս Գալ</button>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/login" className="nav-link">Մուտք Գործել</Link>
            <Link to="/register" className="nav-link">Գրանցվել</Link>
          </div>
        )}
      </nav>
    </header>
  );
};

Header.propTypes = {
  role: PropTypes.string,
  logout: PropTypes.func.isRequired,
};

export default Header;
