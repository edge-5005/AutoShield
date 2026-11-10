import React, { useRef } from 'react';
import { X, Printer, Share2, ShieldCheck, Download, Award } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function InvoicePrintModal({ isOpen, onClose, invoice, onOpenWarranty, onOpenWhatsApp }) {
  if (!isOpen || !invoice) return null;

  const { settings = {} } = invoice;
  const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : (invoice.items || []);

  const handlePrint = () => {
    window.print();
  };

  const isEstimate = invoice.type === 'estimate';

  // Check if invoice has any ceramic/PPF warranty service
  const hasWarranty = items.some(item => Number(item.warranty_months) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[95vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Topbar (Hidden on print) */}
        <div className="no-print p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm">
              {isEstimate ? 'Estimate Preview' : 'Tax Invoice Preview'} — {invoice.invoice_number}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
              invoice.payment_status === 'paid' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {invoice.payment_status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasWarranty && !isEstimate && (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenWarranty) onOpenWarranty(invoice);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 text-xs font-semibold transition-colors"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Warranty Certificate</span>
              </button>
            )}

            <button
              onClick={() => onOpenWhatsApp && onOpenWhatsApp(invoice)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 overflow-y-auto bg-white text-slate-900 text-xs printable-card font-sans">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 mb-5 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-xl tracking-tight text-blue-700">
                  {settings.studio_name || 'Apex Auto Detailing Studio'}
                </span>
              </div>
              <p className="text-slate-500 font-medium text-[11px] max-w-md">
                {settings.tagline || 'Premium Paint Correction & Ceramic Studio'}
              </p>
              <p className="text-slate-600 text-[11px] mt-1 max-w-sm">
                {settings.address}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-slate-600 text-[11px] mt-1">
                <span><strong>Phone:</strong> {settings.phone}</span>
                <span><strong>Email:</strong> {settings.email}</span>
              </div>
              {settings.gstin && (
                <p className="text-slate-900 font-bold text-[11px] mt-1">
                  GSTIN: {settings.gstin} | State Code: {settings.state_code || '29'} ({settings.state_name || 'Karnataka'})
                </p>
              )}
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-sm tracking-wider uppercase rounded mb-2">
                {isEstimate ? 'ESTIMATE / QUOTE' : 'TAX INVOICE'}
              </span>
              <p className="text-base font-bold text-slate-900 tracking-tight">
                {invoice.invoice_number}
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                <strong>Date:</strong> {formatDate(invoice.invoice_date)}
              </p>
            </div>
          </div>

          {/* Vehicle & Customer Details in 2-Column Banner */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            {/* Bill To */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Customer Details
              </span>
              <p className="text-sm font-bold text-slate-900">{invoice.customer_name}</p>
              <p className="text-slate-600 text-[11px] mt-0.5"><strong>Phone:</strong> {invoice.customer_phone}</p>
              {invoice.customer_email && (
                <p className="text-slate-600 text-[11px]"><strong>Email:</strong> {invoice.customer_email}</p>
              )}
              {invoice.customer_address && (
                <p className="text-slate-600 text-[11px] mt-0.5">{invoice.customer_address}</p>
              )}
              {invoice.customer_gstin && (
                <p className="text-slate-900 font-bold text-[11px] mt-1">
                  Customer GSTIN: {invoice.customer_gstin}
                </p>
              )}
            </div>

            {/* Vehicle Profile */}
            <div className="border-l border-slate-200 pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Vehicle Details
              </span>
              <div className="inline-block px-3 py-1 bg-amber-400/20 border-2 border-amber-600/40 text-slate-950 font-black text-sm rounded tracking-widest font-mono uppercase mb-1">
                {invoice.reg_number}
              </div>
              <p className="text-sm font-bold text-slate-800">
                {invoice.make} {invoice.model} {invoice.year ? `(${invoice.year})` : ''}
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-600 mt-1">
                <span><strong>Segment:</strong> {invoice.segment || 'Sedan'}</span>
                <span><strong>Color:</strong> {invoice.color || 'Standard'}</span>
                {invoice.paint_type && <span><strong>Paint:</strong> {invoice.paint_type}</span>}
                {invoice.odometer && <span><strong>Odometer:</strong> {invoice.odometer}</span>}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-left border-y border-slate-300">
                <th className="py-2.5 px-3 font-bold text-[11px] w-10">#</th>
                <th className="py-2.5 px-3 font-bold text-[11px]">Service & Work Description</th>
                <th className="py-2.5 px-3 font-bold text-[11px] text-center w-20">SAC</th>
                <th className="py-2.5 px-3 font-bold text-[11px] text-center w-14">Qty</th>
                <th className="py-2.5 px-3 font-bold text-[11px] text-right w-24">Rate (₹)</th>
                <th className="py-2.5 px-3 font-bold text-[11px] text-right w-24">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, idx) => (
                <tr key={idx} className="text-slate-800">
                  <td className="py-3 px-3 text-slate-400 text-center font-medium">{idx + 1}</td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{item.description || item.name}</p>
                    {item.warranty_months > 0 && (
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        🛡️ {item.warranty_months / 12 >= 1 ? `${item.warranty_months / 12}-Year` : `${item.warranty_months}-Month`} Warranty Included
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-500 font-mono text-[11px]">{item.sac || '9987'}</td>
                  <td className="py-3 px-3 text-center font-semibold">{item.qty || 1}</td>
                  <td className="py-3 px-3 text-right font-medium">{formatCurrency(item.rate)}</td>
                  <td className="py-3 px-3 text-right font-bold">{formatCurrency((item.rate || 0) * (item.qty || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations & Bank Info */}
          <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-300 mb-6">
            {/* Payment & Bank Info */}
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                <p className="font-bold text-slate-800 mb-1">Bank Settlement Details:</p>
                <p className="text-slate-600"><strong>Bank:</strong> {settings.bank_name || 'HDFC Bank'}</p>
                <p className="text-slate-600"><strong>A/C No:</strong> {settings.account_number || '-'}</p>
                <p className="text-slate-600"><strong>IFSC:</strong> {settings.ifsc_code || '-'}</p>
                {settings.upi_id && (
                  <p className="text-blue-700 font-bold mt-1">UPI ID: {settings.upi_id}</p>
                )}
              </div>

              {invoice.notes && (
                <div className="text-[11px] text-slate-600">
                  <strong>Notes:</strong> {invoice.notes}
                </div>
              )}
            </div>

            {/* Totals Table */}
            <div className="space-y-1.5 text-right text-[11px]">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(invoice.subtotal)}</span>
              </div>

              {invoice.discount > 0 && (
                <div className="flex justify-between py-1 text-emerald-600">
                  <span>Special Studio Discount:</span>
                  <span className="font-semibold">- {formatCurrency(invoice.discount)}</span>
                </div>
              )}

              {invoice.is_interstate ? (
                <div className="flex justify-between py-1 text-slate-600">
                  <span>IGST (18%):</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(invoice.igst_amount || invoice.tax_amount)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>CGST (9%):</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(invoice.cgst_amount || (invoice.tax_amount / 2))}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>SGST (9%):</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(invoice.sgst_amount || (invoice.tax_amount / 2))}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between py-2 border-y-2 border-slate-900 text-sm font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-blue-700">{formatCurrency(invoice.grand_total)}</span>
              </div>

              <div className="flex justify-between py-1 text-slate-600">
                <span>Advance / Paid:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(invoice.advance_paid)}</span>
              </div>

              <div className="flex justify-between py-1 text-sm font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                <span>Balance Due:</span>
                <span>{formatCurrency(invoice.balance_due)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Footer */}
          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">Terms & Conditions:</p>
            <p>{settings.terms_conditions || '1. Warranty requires periodic maintenance washes. 2. Vehicle delivered after full settlement.'}</p>
            <div className="pt-6 flex justify-between items-end text-slate-700">
              <p>Thank you for trusting us with your car's care!</p>
              <div className="text-center border-t border-slate-400 pt-1 w-48">
                <p className="font-bold">Authorized Signatory</p>
                <p className="text-[9px] text-slate-400">{settings.studio_name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
