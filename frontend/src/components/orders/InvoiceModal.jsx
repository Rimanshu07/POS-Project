import React from "react";
import { useOrderInvoice } from "../../hooks/useOrders";
import { Invoice } from "./Invoice";
import { X, Printer, AlertCircle } from "lucide-react";
import { InvoiceA4 } from "./InvoiceA4";

// Modal wrapper for the A4 Invoice component.
// Fetches invoice data from GET /orders/:id/invoice and renders it
// with a print/download-PDF button.
export const InvoiceModal = ({ isOpen, onClose, orderId }) => {
  const { data, isLoading, isError } = useOrderInvoice(orderId);
  const [previewType, setPreviewType] = React.useState('thermal'); // 'thermal' or 'a4'

  if (!isOpen) return null;

  const invoice = data?.invoice;

  const handlePrint = () => {
    const el = document.getElementById('invoice-print-area');
    if (!el) { window.print(); return; }
    const printHtml = `<!DOCTYPE html><html><head>
      <title>Invoice</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Inter','Segoe UI',sans-serif; }
        @media print { body { margin: 0; } }
      </style>
    </head><body>${el.outerHTML}</body></html>`;
    const pw = window.open('', '_blank', 'width=900,height=700');
    pw.document.write(printHtml);
    pw.document.close();
    pw.focus();
    setTimeout(() => { pw.print(); pw.close(); }, 600);
  };

  return (
    <>

      <div
        id="invoice-modal-print-root"
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-gray-900 bg-opacity-60 p-2 !m-0 sm:p-8"
      >
        {/* Modal card */}
        <div className="my-2 flex max-h-[calc(100dvh-1rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-8 sm:max-h-[calc(100dvh-4rem)] print:m-0 print:rounded-none print:shadow-none">

          {/* Header — hidden when printing */}
          <div className="flex flex-none flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-3 py-3 print:hidden sm:px-6 sm:py-4">
            <div className="min-w-0">
              <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold text-gray-900">
                Invoice
                <div className="ml-0 flex gap-1 rounded-lg bg-gray-200 p-1 sm:ml-4">
                  <button 
                    onClick={() => setPreviewType('thermal')}
                    className={`text-xs px-3 py-1.5 rounded-md transition-colors ${previewType === 'thermal' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-gray-600 hover:bg-gray-300'}`}
                  >
                    POS Printer
                  </button>
                  <button 
                    onClick={() => setPreviewType('a4')}
                    className={`text-xs px-3 py-1.5 rounded-md transition-colors ${previewType === 'a4' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-gray-600 hover:bg-gray-300'}`}
                  >
                    A4 Size
                  </button>
                </div>
              </h2>
              {invoice && (
                <p className="text-sm text-gray-500 mt-0.5">#{invoice.invoice_number}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {invoice && (
                <button
                  onClick={handlePrint}
                  id="invoice-print-btn"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </button>
              )}
              <button
                onClick={onClose}
                id="invoice-close-btn"
                className="text-gray-400 hover:text-gray-600 focus:outline-none p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-gray-100 print:overflow-visible print:bg-white">
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center print:hidden">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4" />
                <p className="text-sm text-gray-500">Loading invoice…</p>
              </div>
            ) : isError || !invoice ? (
              <div className="p-12 text-center print:hidden">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">Failed to load invoice</h3>
                <p className="text-sm text-gray-500 mt-1">Please try again later.</p>
              </div>
            ) : (
              <div className="p-2 sm:p-6 print:p-0">
                <div className="bg-white rounded-xl shadow-sm print:shadow-none print:rounded-none">
                  {previewType === 'thermal' ? <Invoice invoice={invoice} /> : <InvoiceA4 invoice={invoice} />}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
