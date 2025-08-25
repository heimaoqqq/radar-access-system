import React from 'react';

const ResponsiveWrapper = ({ children }) => {
  return (
    <div className="responsive-wrapper">
      <style jsx>{`
        @media (max-width: 768px) {
          .responsive-wrapper {
            padding: 0.5rem;
          }
          
          /* Mobile navigation adjustments */
          nav {
            position: fixed;
            bottom: 0;
            top: auto !important;
            width: 100%;
            z-index: 1000;
          }
          
          /* Card layouts on mobile */
          .grid {
            grid-template-columns: 1fr !important;
          }
          
          /* Dashboard adjustments */
          .dashboard-grid {
            display: flex;
            flex-direction: column;
          }
          
          /* Radar display mobile size */
          .radar-container {
            height: 300px !important;
          }
          
          /* Text size adjustments */
          h1 {
            font-size: 1.5rem !important;
          }
          
          h2 {
            font-size: 1.25rem !important;
          }
          
          h3 {
            font-size: 1.1rem !important;
          }
          
          /* Button adjustments */
          button {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }
          
          /* Modal and overlay adjustments */
          .fixed {
            max-width: 95vw;
            margin: 0 auto;
          }
        }
        
        @media (max-width: 480px) {
          /* Extra small devices */
          .responsive-wrapper {
            padding: 0.25rem;
          }
          
          /* Hide less important elements */
          .desktop-only {
            display: none !important;
          }
          
          /* Compact cards */
          .card {
            padding: 0.75rem !important;
          }
          
          /* Smaller charts */
          .chart-container {
            height: 200px !important;
          }
        }
        
        /* Tablet specific */
        @media (min-width: 769px) and (max-width: 1024px) {
          .grid-cols-3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .lg\\:col-span-2 {
            grid-column: span 1 !important;
          }
        }
        
        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
          
          .hover\\:scale-105:hover {
            transform: none !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
};

export default ResponsiveWrapper;
