import React from 'react';
import { AlertTriangle, Clock, Calendar, Check } from 'lucide-react';

const urgencyOptions = [
  { id: 'CRITICAL', icon: <AlertTriangle className="w-7 h-7" />, title: 'Critical', desc: 'Need within 1 hour', color: 'border-red-400 bg-red-50 text-red-700', ring: 'ring-red-400', badge: '🔴' },
  { id: 'URGENT', icon: <Clock className="w-7 h-7" />, title: 'Urgent', desc: 'Need within 6 hours', color: 'border-amber-400 bg-amber-50 text-amber-700', ring: 'ring-amber-400', badge: '🟡' },
  { id: 'SCHEDULED', icon: <Calendar className="w-7 h-7" />, title: 'Scheduled', desc: 'Need within 48 hours', color: 'border-emerald-400 bg-emerald-50 text-emerald-700', ring: 'ring-emerald-400', badge: '🟢' },
];

const UrgencySelector = ({ selected, onSelect }) => {
  return (
    <div className="space-y-4">
      {urgencyOptions.map((opt) => (
        <button key={opt.id} onClick={() => onSelect(opt.id)}
          className={`w-full flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${
            selected === opt.id ? `${opt.color} ring-2 ${opt.ring}` : 'border-gray-100 bg-white hover:border-gray-200'
          }`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
            selected === opt.id ? opt.color : 'bg-gray-50 text-gray-400'
          }`}>
            {opt.icon}
          </div>
          <div className="flex-1">
            <div className="text-xl font-bold text-secondary">{opt.badge} {opt.title}</div>
            <div className="text-sm text-gray-500">{opt.desc}</div>
          </div>
          {selected === opt.id && <Check className="w-6 h-6 text-current" />}
        </button>
      ))}
    </div>
  );
};

export default UrgencySelector;
