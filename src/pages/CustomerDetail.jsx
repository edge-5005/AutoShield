import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  CarFront, 
  Plus, 
  Wrench, 
  Receipt, 
  ShieldCheck,
  ChevronRight,
  Edit,
  Sparkles,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, getStatusBadge, getPaymentBadge } from '../utils/formatters';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingVehicle, setFetchingVehicle] = useState(false);
  const [lookupMessage, setLookupMessage] = useState(null);

  // Add Vehicle Modal
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    reg_number: '',
    make: '',
    model: '',
    year: '',
    color: '',
    paint_type: 'Metallic',
    segment: 'Sedan',
    odometer: '',
    notes: ''
  });

  const handleAutoFetchVehicle = async () => {
    const q = vehicleForm.reg_number;
    if (!q || q.trim().length < 2) {
      alert('Please enter a Registration Number Plate first (e.g. KA 01 AB 1234)');
      return;
    }
    try {
      setFetchingVehicle(true);
      setLookupMessage(null);
      const res = await api.lookupVehicle(q);
      if (res && res.data) {
        const d = res.data;
        if (res.found && d.make) {
          setVehicleForm(prev => ({
            ...prev,
            reg_number: d.reg_number || prev.reg_number,
            make: d.make,
            model: d.model,
            year: d.year || '2024',
            segment: d.segment || 'Sedan',
            paint_type: d.paint_type || 'Metallic',
            color: d.color || ''
          }));
          setLookupMessage({ success: true, text: `✓ Verified: ${d.make} ${d.model} • ${d.rto_location || res.source}` });
        } else {
          setVehicleForm(prev => ({
            ...prev,
            reg_number: d.reg_number || prev.reg_number
          }));
          setLookupMessage({ success: true, text: `✓ RTO Verified: ${d.rto_location || res.source}. Please enter vehicle make & model.` });
        }
      } else {
        setLookupMessage({ success: false, text: res.message || 'Plate verified.' });
      }
    } catch (e) {
      setLookupMessage({ success: false, text: 'Lookup error or offline' });
    } finally {
      setFetchingVehicle(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomer(id);
      setCustomer(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await api.createVehicle({
        ...vehicleForm,
        customer_id: customer.id
      });
      setIsVehicleModalOpen(false);
      setVehicleForm({
        reg_number: '',
        make: '',
        model: '',
        year: '',
        color: '',
        paint_type: 'Metallic',
        segment: 'Sedan',
        odometer: '',
        notes: ''
      });
      loadCustomer();
    } catch (err) {
      alert(err.message || 'Error adding vehicle');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading customer profile...</div>;
  }

  if (!customer) {
    return <div className="p-12 text-center text-rose-500">Customer not found.</div>;
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </button>

        <button
          onClick={() => setIsVehicleModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Car to Garage</span>
        </button>
      </div>

      {/* Customer Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
              {customer.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{customer.name}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1.5 text-slate-200 font-mono">
                  <Phone className="w-3.5 h-3.5 text-blue-400" /> {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {customer.email}
                  </span>
                )}
                {customer.gstin && (
                  <span className="flex items-center gap-1.5 text-amber-400 font-mono">
                    <Building className="w-3.5 h-3.5 text-amber-500" /> GST: {customer.gstin}
                  </span>
                )}
              </div>
              {customer.address && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" /> {customer.address}
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-left md:text-right">
            <span className="text-xs text-slate-400 block">Total Lifetime Detailing Spend</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {formatCurrency(customer.invoices?.reduce((acc, i) => acc + (i.grand_total || 0), 0) || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer's Registered Vehicles Garage */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CarFront className="w-5 h-5 text-blue-400" />
            <span>Vehicles in Client's Garage ({customer.vehicles?.length || 0})</span>
          </h2>
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            + Add Vehicle
          </button>
        </div>

        {customer.vehicles?.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No vehicles added yet for this client.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customer.vehicles.map((v) => (
              <div
                key={v.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-500/20 text-amber-300 font-black font-mono text-xs tracking-wider uppercase">
                    {v.reg_number}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">{v.segment}</span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{v.make} {v.model}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {v.color || 'Standard'} • {v.paint_type || 'Metallic'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <Link
                    to={`/jobs?create=true`}
                    className="text-blue-400 hover:underline font-semibold"
                  >
                    + New Job Card
                  </Link>
                  <Link
                    to={`/billing/new`}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    + Invoice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service & Detailing History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Cards History */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>Job History</span>
          </h2>

          {customer.jobCards?.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No detailing jobs logged yet.</p>
          ) : (
            <div className="space-y-3">
              {customer.jobCards.map((j) => {
                const b = getStatusBadge(j.status);
                return (
                  <Link
                    key={j.id}
                    to={`/jobs/${j.id}`}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition-colors block text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-400 block">{j.job_number}</span>
                      <p className="font-semibold text-white mt-0.5">{j.reg_number} - {j.make} {j.model}</p>
                      <span className="text-slate-500 text-[11px]">{formatDate(j.created_at)}</span>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.color}`}>
                        {b.label}
                      </span>
                      <p className="font-mono font-bold text-white mt-1">{formatCurrency(j.total_estimated)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Invoices History */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            <span>Billing & Invoices</span>
          </h2>

          {customer.invoices?.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No invoices issued yet.</p>
          ) : (
            <div className="space-y-3">
              {customer.invoices.map((inv) => {
                const pb = getPaymentBadge(inv.payment_status);
                return (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-400 block">{inv.invoice_number}</span>
                      <p className="font-semibold text-white mt-0.5">{inv.reg_number}</p>
                      <span className="text-slate-500 text-[11px]">{formatDate(inv.invoice_date)}</span>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pb.color}`}>
                        {pb.label}
                      </span>
                      <p className="font-mono font-bold text-white mt-1">{formatCurrency(inv.grand_total)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">Add Vehicle to {customer.name}'s Garage</h3>
              <button
                onClick={() => setIsVehicleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Vehicle Identifiers
                </span>
                <button
                  type="button"
                  onClick={handleAutoFetchVehicle}
                  disabled={fetchingVehicle}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 text-[11px] font-bold transition-all disabled:opacity-50"
                >
                  {fetchingVehicle ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching Free API...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Auto-Fetch Data (Free API)</span>
                    </>
                  )}
                </button>
              </div>

              {lookupMessage && (
                <div className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
                  lookupMessage.success
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/20 border-amber-500/20 text-amber-300'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{lookupMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Registration Plate Number *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. MH 02 CD 9988"
                    value={vehicleForm.reg_number}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, reg_number: e.target.value.toUpperCase() })}
                    onBlur={() => {
                      if (vehicleForm.reg_number && !vehicleForm.make) {
                        handleAutoFetchVehicle();
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Make / Brand *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Mercedes-Benz"
                    value={vehicleForm.make}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Model *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. E-Class"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Vehicle Segment</label>
                  <select
                    value={vehicleForm.segment}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, segment: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Hatchback">Hatchback / Compact</option>
                    <option value="Sedan">Sedan / Compact SUV</option>
                    <option value="SUV">Full Size SUV</option>
                    <option value="Luxury">Luxury / Exotic</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Paint Finish</label>
                  <select
                    value={vehicleForm.paint_type}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, paint_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Metallic">Metallic</option>
                    <option value="Solid Gloss">Solid Gloss</option>
                    <option value="Matte/Satin">Matte/Satin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Obsidian Black"
                    value={vehicleForm.color}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Odometer / Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 24,000 km (2023)"
                    value={vehicleForm.odometer}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, odometer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
