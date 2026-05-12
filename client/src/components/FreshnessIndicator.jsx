import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const FreshnessIndicator = ({ date }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!date) return <span className="text-gray-400">No data</span>;

  const mins = Math.round((now - new Date(date).getTime()) / 60000);
  
  let color = 'text-red-500';
  if (mins < 30) color = 'text-emerald-500';
  else if (mins < 120) color = 'text-amber-500';

  let label = 'Just now';
  if (mins >= 1 && mins < 60) label = `${mins}m ago`;
  else if (mins >= 60) label = `${Math.round(mins / 60)}h ago`;

  return (
    <div className={`text-xs font-medium flex items-center gap-1 ${color}`}>
      <Clock className="w-3 h-3" /> {label}
    </div>
  );
};

export default FreshnessIndicator;
