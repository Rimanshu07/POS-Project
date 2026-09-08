import React from 'react';
import clsx from 'clsx';

export const StatCard = ({ title, value, icon: Icon, trend, className }) => {
  return (
    <div className={clsx("bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100", className)}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="p-3 bg-indigo-50 rounded-lg">
              <Icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {trend && (
                  <div className={clsx(
                    "ml-2 flex items-baseline text-sm font-semibold",
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {trend > 0 ? '+' : ''}{trend}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
