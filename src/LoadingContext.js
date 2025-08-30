import React, { createContext, useState } from 'react';


// isLoading: boolean (normal) or number (percentage)
export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  // isLoading: false | true | number (0-100)
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
