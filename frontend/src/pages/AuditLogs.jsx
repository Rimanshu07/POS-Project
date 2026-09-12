import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  ShoppingBag, 
  FileText, 
  Clock, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuditLogs } from '../hooks/useAuditLogs';

export const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParams = {
    page,
    limit,
    ...(search && { search }),
    ...(actionFilter && { action: actionFilter }),
    ...(entityFilter && { entity: entityFilter }),
  };

  const { data: logsData, isLoading, isError, error } = useAuditLogs(queryParams);
  const logs = logsData?.logs || [];
  const meta = logsData?.meta || { total: 0, totalPages: 1 };
  const totalPages = meta.totalPages || 1;

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Helper for action badges
  const getActionBadge = (action) => {
    switch (action) {
      case 'ORDER_CREATED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShoppingBag className="w-3 h-3 mr-1" /> Order Created
          </span>
        );
      case 'USER_CREATED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <User className="w-3 h-3 mr-1" /> User Created
          </span>
        );
      case 'USER_UPDATED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <FileText className="w-3 h-3 mr-1" /> User Updated
          </span>
        );
      case 'USER_DELETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            User Deleted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
            {action}
          </span>
        );
    }
  };

  // Helper to parse metadata
  const renderMetadata = (metadataString) => {
    if (!metadataString) return <span className="text-gray-400">—</span>;
    try {
      const parsed = JSON.parse(metadataString);
      return (
        <div className="flex flex-wrap gap-1.5 max-w-sm">
          {Object.entries(parsed).map(([k, v]) => (
            <span key={k} className="inline-flex items-center text-xs bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-700">
              <span className="font-semibold text-gray-500 mr-1">{k}:</span>
              <span className="font-mono text-gray-900">{String(v)}</span>
            </span>
          ))}
        </div>
      );
    } catch {
      return <span className="text-xs text-gray-600 font-mono">{metadataString}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#163b2d] rounded-xl text-[#f2c879] shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Logs & Activity Trail</h1>
              <p className="text-sm text-gray-500">Security history and activity log of all staff actions, bills, and changes.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-[#163b2d] text-[#f2c879] shadow-sm">
            Admin Only Access
          </span>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Recorded Events</p>
            <p className="text-2xl font-bold text-gray-900">{meta.total}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Orders & Sales Activity</p>
            <p className="text-2xl font-bold text-emerald-700">Audit Trail Active</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#163b2d]/10 flex items-center justify-center text-[#163b2d]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role Protection</p>
            <p className="text-2xl font-bold text-[#163b2d]">ADMIN Verified</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by staff name, action, bill number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#163b2d] focus:border-[#163b2d] outline-none text-sm transition-all"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#163b2d] min-w-[150px]"
          >
            <option value="">All Actions</option>
            <option value="ORDER_CREATED">Order Created</option>
            <option value="USER_CREATED">User Created</option>
            <option value="USER_UPDATED">User Updated</option>
            <option value="USER_DELETED">User Deleted</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#163b2d] min-w-[130px]"
          >
            <option value="">All Entities</option>
            <option value="ORDER">Order</option>
            <option value="USER">User</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Staff / User</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#163b2d] border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading audit logs...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                    <p className="font-semibold">Failed to load audit logs</p>
                    <p className="text-xs text-gray-500 mt-1">{error?.message || 'Access restricted to administrators'}</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="font-medium text-gray-700">No audit logs found</p>
                    <p className="text-xs text-gray-400 mt-1">Actions performed by staff members will automatically show up here.</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{formatDate(log.created_at)}</span>
                      </div>
                    </td>

                    {/* Staff */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#163b2d] text-[#f2c879] flex items-center justify-center font-bold text-xs shadow-sm">
                          {log.user?.name ? log.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{log.user?.name || `User #${log.user_id}`}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{log.user?.username || log.user?.email || '—'}</span>
                            {log.user?.role && (
                              <span className="inline-flex px-1.5 py-0.2 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                                {log.user.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    {/* Entity */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {log.entity} #{log.entity_id}
                      </span>
                    </td>

                    {/* Metadata */}
                    <td className="px-6 py-4 text-sm">
                      {renderMetadata(log.metadata)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
