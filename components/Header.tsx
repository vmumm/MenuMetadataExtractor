
import React from 'react';

interface HeaderProps {
    onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="flex justify-between items-center border-b-2 border-gray-700 pb-4">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Menu Item <span className="text-red-500">Metadata</span> Extractor
        </h1>
        <p className="mt-1 text-gray-400">Powered by Gemini for DoorDash Cataloging</p>
      </div>
      <button 
        onClick={onReset}
        className="px-4 py-2 bg-gray-700 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
      >
        Reset
      </button>
    </header>
  );
};
