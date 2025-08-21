import React from 'react';

const Cell = ({ title, dataValue }) => {
  return (
    <div className="bg-gray-700 p-3 rounded-md mb-2 shadow-sm">
      <h3 className="text-gray-300 text-sm font-semibold mb-1">{title}</h3>
      <p className="text-white text-lg font-bold">{dataValue}</p>
    </div>
  );
};

export default Cell;
