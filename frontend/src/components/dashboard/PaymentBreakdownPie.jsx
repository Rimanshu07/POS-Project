import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  CASH: '#10b981', // emerald-500
  CARD: '#3b82f6', // blue-500
  UPI: '#8b5cf6', // violet-500
};

export const PaymentBreakdownPie = ({ breakdown }) => {
  if (!breakdown || (parseFloat(breakdown.CASH) === 0 && parseFloat(breakdown.CARD) === 0 && parseFloat(breakdown.UPI) === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-96 flex items-center justify-center">
        <p className="text-gray-500">No payment data available</p>
      </div>
    );
  }

  const data = [
    { name: 'Cash', value: parseFloat(breakdown.CASH), color: COLORS.CASH },
    { name: 'Card', value: parseFloat(breakdown.CARD), color: COLORS.CARD },
    { name: 'UPI', value: parseFloat(breakdown.UPI), color: COLORS.UPI },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue by Payment</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
            /><Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              formatter={(value) => <span className="text-gray-700 font-medium ml-1">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
