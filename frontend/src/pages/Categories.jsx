import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Check, X as XIcon, Tags, Upload, Download, Package } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useBulkCreateCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
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
  const { data: categoryCountData } = useCategories({ limit: 1 });
  const { data: productCountData } = useProducts({ limit: 1 });
  const categories = categoriesData?.categories || [];
  const meta = categoriesData?.meta || { total: 0, totalPages: 1 };
  const totalCategoryCount = categoryCountData?.meta?.total ?? categoriesData?.meta?.total ?? 0;
  const totalProductCount = productCountData?.meta?.total ?? 0;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkFileError, setBulkFileError] = useState('');

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

  const bulkMutation = useBulkCreateCategories({
    onSuccess: (data) => {
      const skippedMessage = data.skipped?.length ? ` Skipped: ${data.skipped.join(', ')}.` : '';
      alert(`${data.count} categories uploaded successfully.${skippedMessage}`);
      setIsBulkModalOpen(false);
      setBulkFileError('');
    },
    onError: (err) => setBulkFileError(err.message)
  });

  const handleBulkFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBulkFileError('');
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
      const normalizeHeaders = (row) => Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[\s_-]+/g, ''),
          value
        ])
      );
      const categories = rows.map(row => {
        const normalized = normalizeHeaders(row);
        return {
          name: normalized.name || normalized.category || normalized.categoryname,
          is_active: String(normalized.isactive ?? 'true').toLowerCase() !== 'false'
        };
      });
      if (!categories.length || categories.some(category => !String(category.name || '').trim())) {
        throw new Error('Upload must contain a name column with a value in every row.');
      }
      bulkMutation.mutate(categories);
    } catch (error) {
      setBulkFileError(error.message || 'Could not read the selected file.');
    }
  };

  const downloadBulkTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{ name: 'Beverages', is_active: true }]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
    XLSX.writeFile(workbook, 'categories-template.xlsx');
  };

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

        <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-indigo-100 bg-indigo-50 p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Tags className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Total Categories</p>
              <p className="mt-1 text-2xl font-extrabold text-gray-900">{totalCategoryCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Products</p>
              <p className="mt-1 text-2xl font-extrabold text-gray-900">{totalProductCount}</p>
            </div>
          </div>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setIsBulkModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium">
              <Upload className="w-5 h-5 mr-2" /> Bulk Upload
            </button>
            <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium">
              <Plus className="w-5 h-5 mr-2" /> Add Category
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name..."
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                {canManage && (
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={canManage ? 3 : 2} className="px-6 py-8 text-center text-gray-500">
                    Loading categories...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={canManage ? 3 : 2} className="px-6 py-8 text-center text-red-500">
                    Failed to load categories
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 3 : 2} className="px-6 py-12 text-center">
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
        {meta.totalPages > 1 && (
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
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
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

      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/50" onClick={() => !bulkMutation.isPending && setIsBulkModalOpen(false)} />
          <div className="relative max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Bulk Upload Categories</h2>
              <button onClick={() => setIsBulkModalOpen(false)} disabled={bulkMutation.isPending}><XIcon className="h-5 w-5 text-gray-500" /></button>
            </div>
            <p className="mb-4 text-sm text-gray-600">Upload an Excel or CSV file with a required <strong>name</strong> column. Optional column: <strong>is_active</strong>.</p>
            {bulkFileError && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{bulkFileError}</div>}
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleBulkFile} disabled={bulkMutation.isPending} className="w-full rounded-lg border border-gray-300 p-2 text-sm" />
            <button onClick={downloadBulkTemplate} type="button" className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800">
              <Download className="mr-1 h-4 w-4" /> Download template
            </button>
            {bulkMutation.isPending && <p className="mt-4 text-sm text-gray-500">Uploading categories...</p>}
          </div>
        </div>
      )}

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
