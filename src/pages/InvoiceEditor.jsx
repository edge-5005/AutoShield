import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Receipt, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Sparkles, 
  Save, 
  Calculator,
  CarFront,
  User,
  UserPlus,
  ShieldCheck
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import QuickCustomerModal from '../components/QuickCustomerModal';
import { useAuth } from '../context/AuthContext';

export default function InvoiceEditor() {
  const { currentCompany } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job_id');
  const accessoryId = searchParams.get('accessory_id');

  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);

  // Form State
  const [type, setType] = useState('tax_invoice'); // 'tax_invoice' or 'estimate'
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [items, setItems] = useState([
    { description: '', sac: '9987', qty: 1, rate: 0, taxRate: 18, warranty_months: 0 }
  ]);
  const [discount, setDiscount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);
  const [isInterstate, setIsInterstate] = useState(false);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');

  useEffect(() => {
    loadInitialData();
  }, [jobId, accessoryId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [cList, vList, sList, sett, accList] = await Promise.all([
        api.getCustomers(),
        api.getVehicles(),
        api.getServices(),
        api.getSettings(),
        api.getAccessories()
      ]);

      setCustomers(cList || []);
      setVehicles(vList || []);
      setServices(sList || []);
      setSettings(sett || {});
      setAccessories(accList || []);
      setTerms(sett?.terms_conditions || '');

      // If accessory_id is passed, pre-populate accessory item
      if (accessoryId && accList && accList.length > 0) {
        const acc = accList.find(a => String(a.id) === String(accessoryId));
        if (acc) {
          setItems([
            {
              description: `${acc.name} (${acc.brand || 'OEM'})`,
              sac: acc.hsn_sac_code || '8708',
              qty: 1,
              rate: Number(acc.selling_price) || 0,
              taxRate: Number(acc.tax_rate) || 18,
              warranty_months: Number(acc.warranty_months) || 0
            }
          ]);
        }
      }

      // If job_id is passed, preload from Job Card
      if (jobId) {
        const job = await api.getJob(jobId);
        if (job) {
          setCustomerId(String(job.customer_id));
          setVehicleId(String(job.vehicle_id));
          setAdvancePaid(job.advance_amount || 0);

          const jobServices = typeof job.services_selected === 'string'
            ? JSON.parse(job.services_selected || '[]')
            : (job.services_selected || []);

          if (jobServices.length > 0) {
            setItems(jobServices.map(s => ({
              description: s.name,
              sac: s.sac || '9987',
              qty: s.qty || 1,
              rate: s.price || 0,
              taxRate: s.taxRate || 18,
              warranty_months: s.warranty_months || 0
            })));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCustomerCreated = async (created) => {
    const [cList, vList] = await Promise.all([api.getCustomers(), api.getVehicles()]);
    setCustomers(cList);
    setVehicles(vList);
    setCustomerId(String(created.customerId));
    if (created.vehicleId) {
      setVehicleId(String(created.vehicleId));
    }
  };

  const selectedVehicleObj = vehicles.find(v => String(v.id) === String(vehicleId));
  const filteredCustomerVehicles = vehicles.filter(v => String(v.customer_id) === String(customerId));

  // Add line item
  const addItem = () => {
    setItems([
      ...items,
      { description: '', sac: '9987', qty: 1, rate: 0, taxRate: 18, warranty_months: 0 }
    ]);
  };

  // Add service from dropdown
  const addServiceItem = (serviceId) => {
    const srv = services.find(s => String(s.id) === String(serviceId));
    if (!srv) return;

    const seg = (selectedVehicleObj?.segment || 'SUV').toLowerCase();
    let price = srv.price_suv;
    if (seg.includes('hatch')) price = srv.price_hatchback;
    else if (seg.includes('sedan')) price = srv.price_sedan;
    else if (seg.includes('lux')) price = srv.price_luxury;

    setItems([
      ...items.filter(i => i.description.trim() !== '' || i.rate > 0),
      {
        description: srv.name,
        sac: srv.sac_code || '9987',
        qty: 1,
        rate: Number(price) || 0,
        taxRate: srv.tax_rate || 18,
        warranty_months: srv.warranty_months || 0
      }
    ]);
  };

  // Add accessory / merchandise item
  const addAccessoryItem = (accId) => {
    const acc = accessories.find(a => String(a.id) === String(accId));
    if (!acc) return;

    setItems([
      ...items.filter(i => i.description.trim() !== '' || i.rate > 0),
      {
        description: `${acc.name} (${acc.brand || 'OEM'})`,
        sac: acc.hsn_sac_code || '8708',
        qty: 1,
        rate: Number(acc.selling_price) || 0,
        taxRate: Number(acc.tax_rate) || 18,
        warranty_months: Number(acc.warranty_months) || 0
      }
    ]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index) => {
    if (items.length <= 1) {
      setItems([{ description: '', sac: '9987', qty: 1, rate: 0, taxRate: 18, warranty_months: 0 }]);
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + (Number(item.rate) || 0) * (Number(item.qty) || 1), 0);
  const totalTax = items.reduce((acc, item) => {
    const lineTotal = (Number(item.rate) || 0) * (Number(item.qty) || 1);
    return acc + (lineTotal * (Number(item.taxRate) || 18)) / 100;
  }, 0);

  const disc = Number(discount) || 0;
  const taxableAfterDiscount = Math.max(0, subtotal - disc);
  const factor = subtotal > 0 ? taxableAfterDiscount / subtotal : 1;
  const adjustedTax = totalTax * factor;
  const grandTotal = Math.round(taxableAfterDiscount + adjustedTax);
  const advance = Number(advancePaid) || 0;
  const balanceDue = Math.max(0, grandTotal - advance);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !vehicleId) {
      alert('Please select Customer and Vehicle');
      return;
    }

    if (items.filter(i => i.description.trim() !== '').length === 0) {
      alert('Please add at least one line item description');
      return;
    }

    try {
      const res = await api.createInvoice({
        type,
        invoice_date: invoiceDate,
        job_card_id: jobId ? Number(jobId) : null,
        customer_id: Number(customerId),
        vehicle_id: Number(vehicleId),
        items,
        discount: disc,
        advance_paid: advance,
        payment_mode: paymentMode,
        payment_ref: paymentRef,
        notes,
        terms,
        is_interstate: isInterstate ? 1 : 0
      });

      navigate('/billing');
    } catch (err) {
      alert(err.message || 'Error generating invoice');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading invoice editor...</div>;
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/billing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setType('tax_invoice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              type === 'tax_invoice'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tax Invoice (GST)
          </button>
          <button
            type="button"
            onClick={() => setType('estimate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              type === 'estimate'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Estimate / Quotation
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              {(settings?.logo_url || currentCompany?.logo_url) && (
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 p-1 flex items-center justify-center shrink-0">
                  <img src={settings?.logo_url || currentCompany?.logo_url} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-black text-white">
                  Create {type === 'estimate' ? 'Quotation / Estimate' : 'GST Tax Invoice'}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Billed under: <span className="text-amber-400 font-bold">{currentCompany?.name || settings?.studio_name || 'Studio'}</span> • {type === 'estimate' ? 'Prepare job estimate for customer approval' : 'Generate official SAC 9987 tax invoice'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Customer & Car Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Customer *
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickCustomerOpen(true)}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Create New Customer</span>
                </button>
              </div>
              <select
                required
                value={customerId}
                onChange={(e) => {
                  if (e.target.value === 'NEW_CUSTOMER') {
                    setIsQuickCustomerOpen(true);
                    return;
                  }
                  setCustomerId(e.target.value);
                  setVehicleId('');
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Select Customer --</option>
                <option value="NEW_CUSTOMER" className="text-blue-400 font-bold bg-slate-900">
                  ✨ + Create New Customer...
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5 flex items-center gap-1.5">
                <CarFront className="w-3.5 h-3.5 text-amber-400" /> Vehicle *
              </label>
              <select
                required
                disabled={!customerId}
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">-- Select Customer's Vehicle --</option>
                {filteredCustomerVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.reg_number} — {v.make} {v.model} ({v.segment})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedVehicleObj && (
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Selected Vehicle Tier: <strong className="text-white">{selectedVehicleObj.segment}</strong> ({selectedVehicleObj.make} {selectedVehicleObj.model} - {selectedVehicleObj.color})
              </span>
              <span className="text-[11px] text-blue-400 font-medium">
                Auto-pricing applied for {selectedVehicleObj.segment}
              </span>
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Detailing Services & Products</span>
            </h2>

            {/* Quick Add From Service Catalog & Accessories */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addServiceItem(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">+ Add Service Package...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>

              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addAccessoryItem(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bg-slate-950 border border-amber-500/40 text-amber-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-amber-400"
              >
                <option value="">📦 + Add Car Accessory...</option>
                {accessories.map(a => (
                  <option key={a.id} value={a.id} disabled={a.stock_quantity <= 0}>
                    {a.name} — ₹{a.selling_price} {a.stock_quantity <= 0 ? '(Out of Stock)' : `(${a.stock_quantity} in stock)`}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                + Custom Line
              </button>
            </div>
          </div>

          {/* Items Header & Rows */}
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 items-center text-xs"
              >
                <div className="col-span-12 sm:col-span-5">
                  <label className="text-[10px] text-slate-400 block sm:hidden mb-0.5">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceramic Coating 9H / Foam Wash / PPF"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-4 sm:col-span-2">
                  <label className="text-[10px] text-slate-400 block sm:hidden mb-0.5">SAC Code</label>
                  <input
                    type="text"
                    placeholder="SAC"
                    value={item.sac}
                    onChange={(e) => updateItem(index, 'sac', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono text-center focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-3 sm:col-span-1">
                  <label className="text-[10px] text-slate-400 block sm:hidden mb-0.5">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateItem(index, 'qty', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-5 sm:col-span-2">
                  <label className="text-[10px] text-slate-400 block sm:hidden mb-0.5">Rate (₹)</label>
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateItem(index, 'rate', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-right focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-10 sm:col-span-1 text-right font-mono font-bold text-white pr-2">
                  {formatCurrency((item.rate || 0) * (item.qty || 1))}
                </div>

                <div className="col-span-2 sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculations, GST & Payment Settlement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notes, Terms & Interstate toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <span className="font-bold text-white block">Inter-State Supply (IGST 18%)</span>
                <span className="text-slate-400 text-[11px]">
                  {isInterstate ? 'Applying 18% Integrated GST' : 'Applying 9% CGST + 9% SGST (Intra-state)'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={isInterstate}
                onChange={(e) => setIsInterstate(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Invoice Notes / Warranty Terms</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Includes 5-Year Graphene Warranty with complimentary 6-month checkup washes."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Financial Breakdown Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Tax & Balance Calculation</span>
            </h3>

            <div className="flex justify-between py-1 text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono font-bold text-white">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Special Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-28 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-emerald-400 font-mono font-bold"
              />
            </div>

            {isInterstate ? (
              <div className="flex justify-between py-1 text-slate-400">
                <span>IGST (18%):</span>
                <span className="font-mono text-white">{formatCurrency(adjustedTax)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>CGST (9%):</span>
                  <span className="font-mono text-white">{formatCurrency(adjustedTax / 2)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-400">
                  <span>SGST (9%):</span>
                  <span className="font-mono text-white">{formatCurrency(adjustedTax / 2)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between py-2.5 border-y border-slate-800 text-sm font-black text-white">
              <span>Grand Total:</span>
              <span className="font-mono text-blue-400 text-base">{formatCurrency(grandTotal)}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">Advance / Paid Amount (₹):</span>
              <input
                type="number"
                min="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                className="w-32 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-white font-mono font-bold"
              />
            </div>

            <div className="flex justify-between py-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-slate-300">Balance Due:</span>
              <span className="font-mono font-bold text-rose-400 text-sm">
                {formatCurrency(balanceDue)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/billing')}
            className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 text-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Generate & Save {type === 'estimate' ? 'Estimate' : 'Tax Invoice'}</span>
          </button>
        </div>
      </form>

      {/* Quick Customer Modal */}
      <QuickCustomerModal
        isOpen={isQuickCustomerOpen}
        onClose={() => setIsQuickCustomerOpen(false)}
        onCustomerCreated={handleQuickCustomerCreated}
      />
    </div>
  );
}
