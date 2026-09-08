import React from 'react';
import clsx from 'clsx';

export const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelectCategory(null)}
        className={clsx(
          "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors",
          selectedCategory === null
            ? "bg-indigo-600 text-white"
            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
        )}
      >
        All Items
      </button>
      
      {categories?.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={clsx(
            "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedCategory === category.id
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
