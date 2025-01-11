import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="text-white text-2xl">Loading...</div>
    </div>
  );
};

export default LoadingScreen;
