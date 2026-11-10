export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

export function getStatusBadge(status) {
  switch (status) {
    case 'received':
      return { label: 'Received / Bay Queue', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'in_progress':
      return { label: 'In Progress (Detailing)', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    case 'quality_check':
      return { label: 'Quality Inspection', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    case 'ready':
      return { label: 'Ready for Delivery', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'delivered':
      return { label: 'Delivered', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    case 'cancelled':
      return { label: 'Cancelled', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    default:
      return { label: status, color: 'bg-slate-700 text-slate-300 border-slate-600' };
  }
}

export function getPaymentBadge(status) {
  switch (status) {
    case 'paid':
      return { label: 'Paid in Full', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'partially_paid':
      return { label: 'Advance Paid', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'unpaid':
      return { label: 'Unpaid / Pending', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    default:
      return { label: status, color: 'bg-slate-700 text-slate-300 border-slate-600' };
  }
}
