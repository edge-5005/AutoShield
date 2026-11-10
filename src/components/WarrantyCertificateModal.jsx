import React from 'react';
import { X, Award, ShieldCheck, Printer, Calendar, CheckCircle } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function WarrantyCertificateModal({ isOpen, onClose, invoice }) {
  if (!isOpen || !invoice) return null;

  const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : (invoice.items || []);
  const warrantyItem = items.find(i => Number(i.warranty_months) > 0) || items[0] || {};
  const warrantyMonths = Number(warrantyItem.warranty_months) || 36;
  const years = (warrantyMonths / 12).toFixed(0);

  const applyDate = new Date(invoice.invoice_date || new Date());
  const expiryDate = new Date(applyDate);
  expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl max-h-[95vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top actions */}
        <div className="no-print p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white text-sm">Official Studio Warranty Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="p-10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-white border-8 border-double border-amber-500/40 m-4 rounded-xl printable-card relative overflow-hidden">
          {/* Watermark bg */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ShieldCheck className="w-96 h-96 text-amber-400" />
          </div>

          <div className="text-center relative z-10">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-3">
              <Award className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-black uppercase tracking-widest text-amber-400">
              Certificate of Protection & Warranty
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-mono">
              Certificate ID: CERT-{invoice.invoice_number?.replace('INV-', '')}
            </p>

            <div className="my-6 border-y border-amber-500/30 py-4 max-w-lg mx-auto">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">This certifies that the vehicle</p>
              <div className="text-xl font-black text-white font-mono tracking-widest bg-slate-800/80 inline-block px-4 py-1.5 rounded border border-amber-500/40 mb-2">
                {invoice.reg_number}
              </div>
              <p className="text-base font-bold text-slate-200">
                {invoice.make} {invoice.model}
              </p>
              <p className="text-xs text-slate-400">Owner: {invoice.customer_name}</p>
            </div>

            <p className="text-xs text-slate-400 uppercase tracking-wider">Has been successfully treated with</p>
            <h2 className="text-lg font-bold text-amber-300 mt-1 mb-4">
              {warrantyItem.description || warrantyItem.name || 'Ceramic / PPF Protection'}
            </h2>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto bg-slate-800/50 p-4 rounded-xl border border-slate-700/80 mb-6 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Application Date</span>
                <span className="font-bold text-white text-sm">{formatDate(applyDate)}</span>
              </div>
              <div className="border-l border-slate-700 pl-4">
                <span className="text-slate-400 block text-[11px]">Warranty Expiration</span>
                <span className="font-bold text-amber-400 text-sm">{formatDate(expiryDate)} ({years} Years)</span>
              </div>
            </div>

            {/* Terms notes */}
            <div className="text-[11px] text-slate-400 max-w-lg mx-auto space-y-1 text-left bg-slate-900/80 p-3 rounded-lg border border-slate-800 mb-6">
              <p className="font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Maintenance Guidelines for Warranty Validity:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-400 pl-1">
                <li>Vehicle must undergo a scheduled checkup & top-up wash every 6 months at our studio.</li>
                <li>Do not wash the vehicle with hard borewell water or harsh acid-based detergents.</li>
                <li>Avoid wiping the dry surface with coarse cloths; use only plush 500+ GSM microfibers.</li>
              </ul>
            </div>

            {/* Signature & Seal */}
            <div className="flex justify-between items-end pt-4 max-w-md mx-auto text-xs">
              <div className="text-left">
                <p className="text-[10px] text-slate-400">Issued by</p>
                <p className="font-bold text-white">{invoice.settings?.studio_name || 'Apex Detailing Studio'}</p>
                <p className="text-[10px] text-slate-400">{invoice.settings?.phone}</p>
              </div>

              <div className="text-center border-t border-amber-500/40 pt-1 w-36">
                <p className="font-bold text-amber-400 text-[11px]">Certified Detailer</p>
                <p className="text-[9px] text-slate-400">Quality Assurance Seal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
