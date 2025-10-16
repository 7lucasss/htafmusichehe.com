import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="text-red-500 text-center py-8">
      <p>{message || 'An unexpected error occurred.'}</p>
    </div>
  );
};

export default ErrorMessage; 