import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { ProductGrid } from "../components/pos/ProductGrid";
import { CategoryFilter } from "../components/pos/CategoryFilter";
import { Cart } from "../components/pos/Cart";
import {
  Search,
  AlertCircle,
  ShoppingCart,
  Home,
  Package,
  Tags,
  BarChart3,
  History,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";

export const POS = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const productParams = {
    is_active: "true",
    ...(searchQuery.trim() && { search: searchQuery.trim() }),
    ...(selectedCategory !== null && { category_id: selectedCategory }),
  };

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: errorProducts,
  } = useInfiniteProducts(productParams);

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useCategories({ is_active: "true", limit: 1000 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const products = useMemo(
    () => productsData?.pages.flatMap((page) => page.products || []) || [],
    [productsData],
  );

  const handleProductScroll = (event) => {
    const element = event.currentTarget;
    const nearBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 240;
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  if (errorProducts || errorCategories) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f7f5f0] p-6">
        <div className="bg-[#fffdf9] p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Failed to load POS
          </h2>
          <p className="text-gray-600">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full min-w-0 overflow-hidden bg-[#f7f5f0]">
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <div className="min-w-0 flex flex-1 flex-col overflow-hidden">
        {/* Mobile Navbar */}
        <div className="lg:hidden">
          <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        </div>

        {/* ============ DESKTOP HEADER ============ */}
        <div className="hidden h-16 shrink-0 items-center justify-between bg-[#163b2d] px-4 text-white shadow-md lg:flex">
          {/* Left: Logo + Nav icons */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#f2c879]" />
              <span className="font-bold tracking-wider restaurant-heading">
                Sherwoods POS
              </span>
            </div>
            <div className="flex h-16 items-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-3 h-full hover:bg-[#285743]"
                title="Dashboard"
              >
                <Home className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate("/products")}
                className="px-3 h-full hover:bg-[#285743]"
                title="Products"
              >
                <Package className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate("/categories")}
                className="px-3 h-full hover:bg-[#285743]"
                title="Categories"
              >
                <Tags className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate("/reports")}
                className="px-3 h-full hover:bg-[#285743]"
                title="Reports"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="px-3 h-full hover:bg-[#285743]"
                title="Orders"
              >
                <History className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Right: Date/Time + User + Logout */}
          <div className="flex items-center gap-3 text-xs font-medium">
            {/* Date/Time */}
            <div className="text-right hidden sm:block">
              <div className="text-gray-300">
                {currentTime.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div>{currentTime.toLocaleTimeString("en-US")}</div>
            </div>

            {/* User pill */}
            <div className="flex items-center gap-2 rounded-full bg-[#285743] px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f2c879] font-bold text-[#163b2d]">
                {user?.name?.charAt(0) || "A"}
              </div>
              <span>{user?.name || "Admin"}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>

            {/* ✅ LOGOUT BUTTON (Desktop) */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden xl:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* ============ MAIN CONTENT ============ */}
        <div className="min-h-0 min-w-0 flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* Left side: Cart */}
          <div className="min-h-0 h-[48%] w-full flex-none overflow-hidden border-r border-[#e8e1d5] bg-[#fffdf9] shadow-[4px_0_15px_-3px_rgba(0,0,0,0.08)] z-20 flex flex-col lg:h-full lg:w-96">
            <div className="flex flex-none items-center justify-between gap-2 bg-[#0e6b4f] p-2.5 font-semibold text-white sm:p-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Current Sale</span>
              </div>

              {/* ✅ Mobile Logout Button (cart header me) */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-red-600 lg:hidden"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Cart />
            </div>
          </div>

          {/* Right side: Products */}
          <div className="min-h-0 min-w-0 flex-1 flex flex-col bg-[#f7f5f0]">
            <div className="p-2.5 sm:p-6 bg-[#fffdf9] border-b border-[#e8e1d5] shadow-sm z-10 flex-none space-y-2 sm:space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Product Search */}
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-gray-500 mb-1 sm:text-xs">
                    Search Product
                  </label>
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

              <div className="pt-1 sm:pt-2">
                {!isLoadingCategories && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-gray-500 sm:text-xs">
                      Categories
                    </label>
                    <CategoryFilter
                      categories={[...(categoriesData?.categories || [])].sort(
                        (a, b) => a.name.localeCompare(b.name),
                      )}
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                    />
                  </div>
                )}
              </div>
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5 sm:p-6"
              onScroll={handleProductScroll}
            >
              <ProductGrid products={products} isLoading={isLoadingProducts} />
              {isFetchingNextPage && (
                <p className="py-5 text-center text-sm font-medium text-[#0e6b4f]">
                  Loading more products...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
