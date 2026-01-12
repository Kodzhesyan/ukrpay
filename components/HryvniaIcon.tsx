
import React from 'react';

export const HryvniaIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <clipPath id="circleClip">
        <circle cx="12" cy="12" r="11" />
      </clipPath>
    </defs>
    
    {/* Background Circle with Flag */}
    <g clipPath="url(#circleClip)">
      <rect width="24" height="12" fill="#0057B7" /> {/* UA Blue */}
      <rect y="12" width="24" height="12" fill="#FFD700" /> {/* UA Yellow */}
    </g>
    
    {/* Border */}
    <circle cx="12" cy="12" r="11" stroke="#ffffff" strokeWidth="1.5" />
    
    {/* Official Hryvnia Symbol (₴) */}
    <path 
      d="M16 8.5C14.5 5.5 8 5.5 8 12s6.5 6.5 8 3.5 M6.5 10.5h11 M6.5 13.5h11" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: 'drop-shadow(0px 1px 1.5px rgba(0,0,0,0.3))' }}
    />
  </svg>
);
