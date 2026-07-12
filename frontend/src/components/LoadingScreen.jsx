import React from 'react';

const LoadingScreen = ({ message = 'Loading...', fullPage = false }) => {
  const containerClasses = fullPage
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/85 backdrop-blur-md transition-all duration-300'
    : 'w-full min-h-[300px] flex flex-col items-center justify-center p-6 transition-all duration-300';

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center">
        {/* Outer animated spinner ring */}
        <div className="w-20 h-20 border-4 border-hospital-100 border-t-hospital-600 rounded-full animate-spin"></div>
        
        {/* Inner pulsing medical cross icon */}
        <div className="absolute animate-pulse text-hospital-600">
          <svg
            className="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9 21h6v-6h6V9h-6V3H9v6H3v6h6v6z" />
          </svg>
        </div>
      </div>
      
      {/* Loading message */}
      <p className="mt-6 text-sm font-semibold text-slate-500 tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default LoadingScreen;
