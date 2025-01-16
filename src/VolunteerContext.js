import React, { createContext, useState } from 'react';

export const VolunteerContext = createContext();

export const VolunteerProvider = ({ children }) => {
  const [volunteers, setVolunteers] = useState([]);

  return (
    <VolunteerContext.Provider value={{ volunteers, setVolunteers }}>
      {children}
    </VolunteerContext.Provider>
  );
};
