import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const CloudinaryTest = () => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await API.get('/cloudinary/test');
        setStatus(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data || err.message);
        setStatus(null);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Cloudinary Connection Status</h3>
      
      {status && (
        <div className="text-green-500">
          <p>✅ Connected to: {status.details.cloudName}</p>
        </div>
      )}

      {error && (
        <div className="text-red-500">
          <p>❌ Connection Error: {error.message}</p>
        </div>
      )}
    </div>
  );
};

export default CloudinaryTest; 