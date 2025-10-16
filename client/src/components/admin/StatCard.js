import React from 'react';

const StatCard = ({ title, value, icon, bgColor }) => {
  return (
    <div className={`p-6 rounded-lg ${bgColor || 'bg-gray-800'} border border-gray-700`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg text-gray-300 mb-2">{title}</h3>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard; 