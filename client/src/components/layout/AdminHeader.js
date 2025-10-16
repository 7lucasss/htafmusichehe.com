import React from 'react';

const AdminHeader = ({ title }) => {
  return (
    <header className="bg-primary bg-opacity-20 shadow-md py-4 px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
    </header>
  );
};

export default AdminHeader; 