import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { ProductGrid } from '../components/pos/ProductGrid';
import { CategoryFilter } from '../components/pos/CategoryFilter';
import { Cart } from '../components/pos/Cart';
import { Search, AlertCircle, ShoppingCart, LayoutDashboard, Home, Package, Tags, BarChart3, ChevronDown } from 'lucide-react';
import { useEffect } from 'react';

export const POS = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: productsData, isLoading: isLoadingProducts, error: errorProducts } = useProducts({ is_active: 'true' });
  const { data: categoriesData, isLoading: isLoadingCategories, error: errorCategories } = useCategories({ is_active: 'true' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // For live clock in navbar
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const filteredProducts = useMemo(() => {
    const products = productsData?.products || [];
    if (!products.length) return [];
    
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === null || product.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productsData, searchQuery, selectedCategory]);

  if (errorProducts || errorCategories) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md w-full border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load POS</h2>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50 overflow-hidden">
      {/* POS Top Navbar */}
      <div className="h-14 bg-[#2c3e50] flex items-center justify-between px-4 text-white shrink-0 shadow-md z-30">
        <div className="flex items-center gap-6 h-full">
          <div className="flex items-center gap-2 mr-4">
            <ShoppingCart className="w-5 h-5 text-indigo-400" />
            <span className="font-bold tracking-wider hidden sm:block">POS System</span>
          </div>
          
          <div className="hidden md:flex items-center h-full">
            <button onClick={() => navigate('/dashboard')} className="px-3 h-full flex items-center hover:bg-[#34495e] transition-colors border-l border-[#34495e]" title="Dashboard">
              <Home className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/products')} className="px-3 h-full flex items-center hover:bg-[#34495e] transition-colors border-l border-[#34495e]" title="Products">
              <Package className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/categories')} className="px-3 h-full flex items-center hover:bg-[#34495e] transition-colors border-l border-[#34495e]" title="Categories">
              <Tags className="w-5 h-5" />
            </button>
            <button onClick={() => navigate('/orders')} className="px-3 h-full flex items-center hover:bg-[#34495e] transition-colors border-l border-r border-[#34495e]" title="All Sales">
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="hidden lg:block text-right">
            <div className="text-gray-300">
              {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div>
              {currentTime.toLocaleTimeString('en-US')}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#34495e] py-1.5 px-3 rounded-full cursor-pointer hover:bg-[#3d566e] transition-colors">
            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <span>{user?.name || 'Admin'}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left side: Cart (30%) */}
        <div className="w-full lg:w-96 flex-none bg-white shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 h-full max-h-full overflow-hidden flex flex-col border-r border-gray-200">
        <div className="bg-[#2c3e50] text-white p-3 font-semibold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          <span>Current Sale</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <Cart />
        </div>
      </div>

      {/* Right side: Products (70%) */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        <div className="p-4 sm:p-6 bg-white border-b border-gray-200 shadow-sm z-10 flex-none space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Product Search */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Search Product</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="name, code, barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-shadow"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            {!isLoadingCategories && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500">Categories</label>
                <CategoryFilter 
                  categories={[...(categoriesData?.categories || [])].sort((a, b) => a.name.localeCompare(b.name))} 
                  selectedCategory={selectedCategory} 
                  onSelectCategory={setSelectedCategory} 
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ProductGrid products={filteredProducts} isLoading={isLoadingProducts} />
        </div>
      </div>
    </div>
  </div>
  );
};
