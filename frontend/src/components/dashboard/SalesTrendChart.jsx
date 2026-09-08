import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

export const SalesTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 w-full flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-gray-500">No sales data available for this period</p>
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    // Safely parse date and format it. Expecting "YYYY-MM-DD" or similar ISO date string.
    formattedDate: format(new Date(item.date), 'MMM dd')
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Trend</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
              labelStyle={{ color: '#374151', fontWeight: 'bold' }}
              formatter={(value) => [`₹${value}`, 'Sales']}
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="#4f46e5" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSales)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
