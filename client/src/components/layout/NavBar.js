import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const NavBar = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <nav className="flex items-center justify-between p-4">
      {/* Rest of the component code */}
      {currentUser && currentUser.role === 'admin' && (
        <li>
          <Link 
            to="/admin" 
            className="text-secondary hover:text-secondary-dark transition-colors"
          >
            <FaTachometerAlt className="mr-2" />
            Admin Dashboard
          </Link>
        </li>
      )}
    </nav>
  );
};

export default NavBar; 