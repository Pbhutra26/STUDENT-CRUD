import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className="relative bg-gray-800 p-4 z-50">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-white text-lg font-bold">NARKELDANGA PAG</Link>
        <div className="block lg:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
        <div className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button onClick={toggleMenu} className="p-4">
            &times;
          </button>
          <ul className="space-y-4 p-4">
            <li onClick={handleMenuItemClick}>
              <Link 
                to="/" 
                className={`block p-2 text-center rounded ${location.pathname === '/' ? 'bg-gray-700' : ''}`}
              >
                Home
              </Link>
            </li>
            <li onClick={handleMenuItemClick}>
              <Link 
                to="/add-student" 
                className={`block p-2 text-center rounded ${location.pathname === '/add-student' ? 'bg-gray-700' : ''}`}
              >
                Add Student
              </Link>
            </li>
            <li onClick={handleMenuItemClick}>
              <Link 
                to="/attendance" 
                className={`block p-2 text-center rounded ${location.pathname === '/attendance' ? 'bg-gray-700' : ''}`}
              >
                Attendance
              </Link>
            </li>
            <li onClick={handleMenuItemClick}>
              <Link 
                to="/volunteers" 
                className={`block p-2 text-center rounded ${location.pathname === '/volunteers' ? 'bg-gray-700' : ''}`}
              >
                Volunteers
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
