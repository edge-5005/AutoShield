import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  CarFront, 
  ChevronRight, 
  CreditCard,
  Building,
  Sparkles,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchingVehicle, setFetchingVehicle] = useState(false);
  const [lookupMessage, setLookupMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstin: '',
    notes: '',
    // Optional initial vehicle
    vehicle: {
      reg_number: '',
      make: '',
      model: '',
      segment: 'Sedan',
      color: '',
      year: '',
      paint_type: 'Metallic'
    }
  });

  const handleAutoFetchVehicle = async () => {
    const q = formData.vehicle.reg_number;
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
          setFormData(prev => ({
            ...prev,
            vehicle: {
              ...prev.vehicle,
              reg_number: d.reg_number || prev.vehicle.reg_number,
              make: d.make,
              model: d.model,
              year: d.year || '2024',
              segment: d.segment || 'Sedan',
              paint_type: d.paint_type || 'Metallic',
              color: d.color || ''
            }
          }));
          setLookupMessage({ success: true, text: `✓ Verified: ${d.make} ${d.model} • ${d.rto_location || res.source}` });
        } else {
          setFormData(prev => ({
            ...prev,
            vehicle: {
              ...prev.vehicle,
              reg_number: d.reg_number || prev.vehicle.reg_number
            }
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
    loadCustomers();
    api.getVehicleCatalog().then(cat => {
      if (cat && cat.models) {
        setCatalog(cat.models);
      }
    }).catch(() => {});
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.createCustomer(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        gstin: '',
        notes: '',
        vehicle: {
          reg_number: '',
          make: '',
          model: '',
          segment: 'Sedan',
          color: '',
          year: '',
          paint_type: 'Metallic'
        }
      });
      loadCustomers();
    } catch (err) {
      alert(err.message || 'Error creating customer');
    }
  };

  const filtered = customers.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.gstin?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-500" />
            <span>Customers & Cars (CRM)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Maintain customer database, vehicle garages, and service history
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer & Car</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading customers...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No Customers Found</p>
          <p className="text-xs text-slate-500 mt-1">Add your detailing clients to start logging their vehicles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/customers/${c.id}`}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between group shadow-sm transition-all"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300">
                    <CarFront className="w-3.5 h-3.5 text-blue-400" />
                    <span>{c.vehicle_count} {c.vehicle_count === 1 ? 'Vehicle' : 'Vehicles'}</span>
                  </div>
                </div>

                <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                  {c.name}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-400 mt-2">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-mono text-slate-300">{c.phone}</span>
                  </p>
                  {c.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{c.email}</span>
                    </p>
                  )}
                  {c.gstin && (
                    <p className="flex items-center gap-2 text-amber-400 font-mono text-[11px]">
                      <Building className="w-3.5 h-3.5 text-amber-500" />
                      <span>GST: {c.gstin}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 text-[11px] block">Total Spent</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatCurrency(c.total_spend || 0)}
                  </span>
                </div>

                <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Garage <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Add Customer & Vehicle</h2>
                <p className="text-xs text-slate-400">Register new client and their vehicle profile</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Customer Info */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Customer Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Mobile / WhatsApp *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. rajesh@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">GSTIN (Optional B2B)</label>
                    <input
                      type="text"
                      placeholder="e.g. 29AABCA1234D1Z5"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar, Bangalore"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Initial Vehicle Info */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
                    <CarFront className="w-4 h-4 text-amber-400" /> Initial Vehicle Profile (Optional)
                  </span>

                  <button
                    type="button"
                    onClick={handleAutoFetchVehicle}
                    disabled={fetchingVehicle}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 text-[11px] font-bold transition-all disabled:opacity-50"
                  >
                    {fetchingVehicle ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Auto-Fetch from Plate</span>
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
                    <label className="text-slate-300 font-semibold block mb-1">Registration Plate No *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. KA 01 AB 1234"
                      value={formData.vehicle.reg_number}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicle: { ...formData.vehicle, reg_number: e.target.value.toUpperCase() }
                      })}
                      onBlur={() => {
                        if (formData.vehicle.reg_number && !formData.vehicle.make) {
                          handleAutoFetchVehicle();
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-blue-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Make / Brand *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Toyota / BMW"
                      value={formData.vehicle.make}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicle: { ...formData.vehicle, make: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Model * (Smart Autocomplete)</label>
                    <input
                      required
                      type="text"
                      list="customer-car-models-list"
                      placeholder="e.g. Fortuner / Creta / Thar / Hector"
                      value={formData.vehicle.model}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matched = catalog.find(c => c.model.toLowerCase() === val.toLowerCase())
                          || catalog.find(c => `${c.make} ${c.model}`.toLowerCase() === val.toLowerCase());
                        if (matched) {
                          setFormData({
                            ...formData,
                            vehicle: {
                              ...formData.vehicle,
                              model: matched.model,
                              make: matched.make,
                              segment: matched.segment,
                              paint_type: matched.paint_type,
                              color: formData.vehicle.color || matched.colors?.[0] || ''
                            }
                          });
                        } else {
                          setFormData({
                            ...formData,
                            vehicle: { ...formData.vehicle, model: val }
                          });
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                    <datalist id="customer-car-models-list">
                      {catalog.map((c, idx) => (
                        <option key={idx} value={c.model}>{c.make} {c.model} ({c.segment})</option>
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2024"
                      value={formData.vehicle.year}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicle: { ...formData.vehicle, year: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Vehicle Segment</label>
                    <select
                      value={formData.vehicle.segment}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicle: { ...formData.vehicle, segment: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Hatchback">Hatchback / Compact</option>
                      <option value="Sedan">Sedan / Compact SUV</option>
                      <option value="SUV">Full Size SUV</option>
                      <option value="Luxury">Luxury / Supercar</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Color</label>
                    <input
                      type="text"
                      placeholder="e.g. Pearl White"
                      value={formData.vehicle.color}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicle: { ...formData.vehicle, color: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Paint Finish</label>
                    <select
                      value={formData.vehicle.paint_type}
                      onChange={(e) => setFormData({
                        ...formData,
                        vehicle: { ...formData.vehicle, paint_type: e.target.value }
                      })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Metallic">Metallic / Clearcoat</option>
                      <option value="Solid Gloss">Solid Gloss</option>
                      <option value="Matte/Satin">Matte / Satin (Special Care)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all"
                >
                  Save Customer & Car
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
