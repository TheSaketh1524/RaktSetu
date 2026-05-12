import React from 'react';

const ReadinessGauge = ({ score }) => {
  const percentage = Math.min(100, Math.max(0, score));
  // Circle parameters
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = 'text-red-500';
  if (percentage >= 71) { color = 'text-emerald-500'; }
  else if (percentage >= 41) { color = 'text-amber-500'; }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-32 h-32 flex items-center justify-center mb-3">
        {/* Background Circle */}
        <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r={radius} className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" />
          {/* Progress Circle */}
          <circle cx="64" cy="64" r={radius} className={color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
        </svg>
        <span className={`text-4xl font-black ${color}`}>{Math.round(percentage)}</span>
      </div>
      <div className={`text-sm font-bold ${color}`}>
        {percentage >= 71 ? '🟢 High Readiness' : percentage >= 41 ? '🟡 Medium Readiness' : '🔴 Low Readiness'}
      </div>
    </div>
  );
};

export default ReadinessGauge;
