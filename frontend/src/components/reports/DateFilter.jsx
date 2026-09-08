import React from 'react';
import { Calendar } from 'lucide-react';

export const DateFilter = ({ preset, setPreset, customDate, setCustomDate }) => {
  const handlePresetChange = (e) => {
    setPreset(e.target.value);
    if (e.target.value !== 'custom') {
      setCustomDate({ from: '', to: '' });
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4 mb-6 print:hidden">
      <div className="flex items-center text-gray-500">
        <Calendar className="w-5 h-5 mr-2" />
        <span className="font-medium text-sm">Date Range:</span>
      </div>
      
      <select
        value={preset}
        onChange={handlePresetChange}
        className="form-select block w-full sm:w-auto px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="this_week">This Week</option>
        <option value="this_month">This Month</option>
        <option value="custom">Custom Date Range</option>
      </select>

      {preset === 'custom' && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={customDate.from}
            onChange={(e) => setCustomDate({ ...customDate, from: e.target.value })}
            className="form-input block w-full sm:w-auto px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customDate.to}
            onChange={(e) => setCustomDate({ ...customDate, to: e.target.value })}
            className="form-input block w-full sm:w-auto px-3 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
};
