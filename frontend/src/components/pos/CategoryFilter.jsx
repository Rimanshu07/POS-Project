import React, { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200; // Amount to scroll per click
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      // Delay check slightly to allow smooth scroll to happen
      setTimeout(checkScroll, 350);
    }
  };

  return (
    <div className="relative group flex items-center">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 p-1 bg-white/90 shadow-sm border border-gray-200 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-white transition-all -ml-2 sm:-ml-4 hidden sm:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Categories Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex space-x-2 overflow-x-auto pb-2 pt-1 scrollbar-hide flex-1 px-1 relative scroll-smooth"
      >
        <button
          onClick={() => onSelectCategory(null)}
          className={clsx(
            "flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors",
            selectedCategory === null
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-indigo-200"
          )}
        >
          All Items
        </button>
        
        {categories?.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={clsx(
              "flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors",
              selectedCategory === category.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-indigo-200"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 p-1 bg-white/90 shadow-sm border border-gray-200 rounded-full text-gray-600 hover:text-indigo-600 hover:bg-white transition-all -mr-2 sm:-mr-4 hidden sm:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
