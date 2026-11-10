import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function WhatsAppShareModal({ isOpen, onClose, data = {}, type = 'invoice' }) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  // Clean phone number for WhatsApp wa.me
  const rawPhone = data.customer_phone || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

  let defaultText = '';
  if (type === 'invoice') {
    defaultText = `Hello ${data.customer_name || 'Customer'},\n\nThank you for choosing ${data.settings?.studio_name || 'our Detailing Studio'} for your ${data.make || ''} ${data.model || ''} (${data.reg_number || ''}).\n\n📄 *Invoice Details:*\n• Invoice No: ${data.invoice_number}\n• Total Amount: ${formatCurrency(data.grand_total)}\n• Advance Paid: ${formatCurrency(data.advance_paid)}\n• *Balance Due: ${formatCurrency(data.balance_due)}*\n\n💳 *Payment Modes:*\nUPI ID: ${data.settings?.upi_id || 'apexautostudio@hdfcbank'}\n\nPlease let us know if you need any assistance!\nBest Regards,\n${data.settings?.studio_name || 'Apex Auto Detailing'}`;
  } else if (type === 'ready') {
    defaultText = `Hello ${data.customer_name || 'Customer'},\n\n🎉 Great news! Detailing work on your *${data.make || ''} ${data.model || ''} (${data.reg_number || ''})* is completed and quality checked.\n\nYour vehicle is shining and ready for delivery at our studio! 🚗✨\n\nLooking forward to seeing you,\n${data.settings?.studio_name || 'Apex Auto Detailing'}`;
  } else if (type === 'reminder') {
    defaultText = `Hello ${data.customer_name || 'Customer'},\n\nGreetings from ${data.settings?.studio_name || 'Apex Auto Detailing Studio'}.\n\nThis is a friendly reminder that the *scheduled periodic maintenance & inspection* for your *${data.make || ''} ${data.model || ''} (${data.reg_number || ''})* is due on *${data.next_followup_date || 'this week'}* to keep your coating warranty active.\n\nWould you like us to reserve a bay slot for you this weekend?\n\nBest Regards,\n${data.settings?.studio_name || 'Apex Auto Detailing'}`;
  }

  const [message, setMessage] = useState(defaultText);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Share via WhatsApp</h2>
              <p className="text-xs text-slate-400">Direct message to {data.customer_name || 'Customer'} ({rawPhone})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Area */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Message Preview (Editable)
            </label>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950/40">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Open in WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
