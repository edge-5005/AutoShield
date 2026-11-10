import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Receipt, 
  Plus, 
  Search, 
  Printer, 
  Share2, 
  Award, 
  CreditCard, 
  CheckCircle, 
  ArrowRight,
  Filter,
  DollarSign,
  X
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, getPaymentBadge } from '../utils/formatters';
import InvoicePrintModal from '../components/InvoicePrintModal';
import WarrantyCertificateModal from '../components/WarrantyCertificateModal';
import WhatsAppShareModal from '../components/WhatsAppShareModal';
import { useAuth } from '../context/AuthContext';

export default function Billing() {
  const { currentCompany } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isWarrantyOpen, setIsWarrantyOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Quick Payment Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('UPI');
  const [payRef, setPayRef] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [typeFilter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await api.getInvoices(typeFilter);
      setInvoices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPrint = async (inv) => {
    try {
      const full = await api.getInvoice(inv.id);
      setSelectedInvoice(full);
      setIsPrintOpen(true);
    } catch (err) {
      alert('Failed to load invoice details');
    }
  };

  const handleOpenWarranty = async (inv) => {
    try {
      const full = await api.getInvoice(inv.id);
      setSelectedInvoice(full);
      setIsWarrantyOpen(true);
    } catch (err) {
      alert('Failed to load warranty certificate');
    }
  };

  const handleOpenWhatsApp = (inv) => {
    setSelectedInvoice(inv);
    setIsWhatsAppOpen(true);
  };

  const handleOpenPay = (inv) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balance_due || '');
    setIsPayModalOpen(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await api.payInvoice(selectedInvoice.id, {
        amount: Number(payAmount) || 0,
        payment_mode: payMode,
        payment_ref: payRef
      });
      setIsPayModalOpen(false);
      loadInvoices();
    } catch (err) {
      alert('Failed to record payment');
    }
  };

  const handleConvertToInvoice = async (est) => {
    if (!window.confirm(`Convert ${est.invoice_number} into an official Tax Invoice?`)) return;
    try {
      await api.convertToInvoice(est.id);
      loadInvoices();
    } catch (err) {
      alert('Conversion failed');
    }
  };

  const filtered = invoices.filter(inv => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoice_number?.toLowerCase().includes(q) ||
      inv.reg_number?.toLowerCase().includes(q) ||
      inv.customer_name?.toLowerCase().includes(q) ||
      inv.customer_phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {currentCompany?.logo_url ? (
            <div className="w-12 h-12 rounded-2xl bg-carbon-900 border border-amber-500/30 p-1 flex items-center justify-center shrink-0 shadow-sm">
              <img src={currentCompany.logo_url} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-carbon-900 border border-carbon-800 flex items-center justify-center text-amber-400 shrink-0">
              <Receipt className="w-6 h-6 text-amber-400" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Billing, Invoices & Estimates</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                {currentCompany?.name || 'Studio'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              GST-compliant invoices (SAC 9987), payments, advance deposits & warranty cards
            </p>
          </div>
        </div>

        <Link
          to="/billing/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-carbon-950 text-xs font-black shadow-ceramic transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4 text-carbon-950 stroke-[3]" />
          <span>New Invoice / Estimate</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'tax_invoice', label: 'Tax Invoices' },
            { id: 'estimate', label: 'Quotations / Estimates' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice no, plate, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading billing records...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No Invoices Found</p>
          <p className="text-xs text-slate-500 mt-1">Create an invoice or estimate to get started.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Invoice No / Date</th>
                  <th className="py-3.5 px-4">Customer & Vehicle</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((inv) => {
                  const pb = getPaymentBadge(inv.payment_status);
                  const isEst = inv.type === 'estimate';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-white block text-sm">
                          {inv.invoice_number}
                        </span>
                        <span className="text-[11px] text-slate-400">{formatDate(inv.invoice_date)}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-500/20 font-mono font-bold uppercase text-[11px]">
                            {inv.reg_number}
                          </span>
                          <span className="font-semibold text-white">{inv.customer_name}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {inv.make} {inv.model} ({inv.segment})
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isEst ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {isEst ? 'Estimate' : 'Tax Invoice'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                        {formatCurrency(inv.grand_total)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-mono font-bold ${
                          inv.balance_due > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {formatCurrency(inv.balance_due)}
                        </span>
                        {inv.advance_paid > 0 && (
                          <span className="text-[10px] text-slate-500 block">
                            Adv: {formatCurrency(inv.advance_paid)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${pb.color}`}>
                          {pb.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isEst ? (
                            <button
                              onClick={() => handleConvertToInvoice(inv)}
                              title="Convert to Tax Invoice"
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px]"
                            >
                              Convert to Invoice
                            </button>
                          ) : (
                            <>
                              {inv.balance_due > 0 && (
                                <button
                                  onClick={() => handleOpenPay(inv)}
                                  title="Record Payment"
                                  className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenWarranty(inv)}
                                title="Digital Warranty Certificate"
                                className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                              >
                                <Award className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleOpenWhatsApp(inv)}
                            title="Send via WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenPrint(inv)}
                            title="Print / PDF Invoice"
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPayModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Record Payment</h3>
                <p className="text-xs text-slate-400">
                  {selectedInvoice.invoice_number} • Balance: {formatCurrency(selectedInvoice.balance_due)}
                </p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Amount to Collect (₹) *</label>
                <input
                  required
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  max={selectedInvoice.balance_due}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-base font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card (POS)</option>
                  <option value="Net Banking">Net Banking / IMPS / NEFT</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Transaction Ref / UTR / Note</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/6192837482"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Print Preview Modal */}
      <InvoicePrintModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        invoice={selectedInvoice}
        onOpenWarranty={(inv) => {
          setSelectedInvoice(inv);
          setIsWarrantyOpen(true);
        }}
        onOpenWhatsApp={(inv) => {
          setSelectedInvoice(inv);
          setIsWhatsAppOpen(true);
        }}
      />

      {/* Warranty Certificate Modal */}
      <WarrantyCertificateModal
        isOpen={isWarrantyOpen}
        onClose={() => setIsWarrantyOpen(false)}
        invoice={selectedInvoice}
      />

      {/* WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        data={selectedInvoice}
        type="invoice"
      />
    </div>
  );
}
