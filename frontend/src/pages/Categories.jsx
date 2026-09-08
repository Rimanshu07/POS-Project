import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Check, X as XIcon, Tags } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { useAuth } from '../hooks/useAuth';
import { CategoryModal } from '../components/categories/CategoryModal';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';

export const Categories = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParams = {
    page,
    limit,
    ...(search && { search }),
    ...(statusFilter !== 'ALL' && { is_active: statusFilter === 'ACTIVE' ? 'true' : 'false' })
  };

  const { data: categoriesData, isLoading, isError } = useCategories(queryParams);
  const categories = categoriesData?.categories || [];
  const meta = categoriesData?.meta || { total: 0, pages: 1 };

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Mutations
  const createMutation = useCreateCategory({
    onSuccess: () => {
      alert('Category created successfully');
      setIsModalOpen(false);
    },
    onError: (err) => alert(err.message)
  });

  const updateMutation = useUpdateCategory({
    onSuccess: () => {
      alert('Category updated successfully');
      setIsModalOpen(false);
    },
    onError: (err) => alert(err.message)
  });

  const deleteMutation = useDeleteCategory({
    onSuccess: () => {
      alert('Category deleted successfully');
      setIsDeleteModalOpen(false);
      if (categories.length === 1 && page > 1) {
        setPage(page - 1);
      }
    },
    onError: (err) => alert(err.message)
  });

  const handleOpenModal = (category = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = (data) => {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Tags className="mr-2 h-6 w-6 text-indigo-600" />
            Categories
          </h1>
          <p className="text-gray-500 mt-1">Manage product categories</p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl card-shadow border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                {canManage && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-6 py-8 text-center text-gray-500">
                    Loading categories...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-6 py-8 text-center text-red-500">
                    Failed to load categories
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center">
                    <Tags className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Adjust your filters or add a new category.
                    </p>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-indigo-50/30 transition-modern">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {category.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XIcon className="w-3 h-3 mr-1" /> Inactive
                        </span>
                      )}
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
              <span className="font-medium">{Math.min(page * limit, meta.total)}</span> of{' '}
              <span className="font-medium">{meta.total}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 bg-white"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-100 bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};
