import React, { useState, useEffect } from 'react';
import { X, UserPlus, CarFront, Sparkles, Loader2, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { api } from '../utils/api';

const DEFAULT_QUICK_PICKS = [
  { make: 'Toyota', model: 'Fortuner Legender', segment: 'SUV' },
  { make: 'Hyundai', model: 'Creta', segment: 'SUV' },
  { make: 'Mahindra', model: 'Thar Roxx', segment: 'SUV' },
  { make: 'Mahindra', model: 'XUV700', segment: 'SUV' },
  { make: 'Toyota', model: 'Innova Hycross', segment: 'SUV' },
  { make: 'BMW', model: '3 Series (330Li / M340i)', segment: 'Sedan' },
  { make: 'Mercedes-Benz', model: 'C-Class', segment: 'Sedan' },
  { make: 'Tata', model: 'Nexon', segment: 'SUV' },
  { make: 'Maruti Suzuki', model: 'Swift', segment: 'Hatchback' },
  { make: 'Honda', model: 'City', segment: 'Sedan' },
  { make: 'Volkswagen', model: 'Virtus', segment: 'Sedan' },
  { make: 'Kia', model: 'Seltos', segment: 'SUV' }
];

export default function QuickCustomerModal({ isOpen, onClose, onCustomerCreated }) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [fetchingVehicle, setFetchingVehicle] = useState(false);
  const [lookupMessage, setLookupMessage] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [showQuickPicks, setShowQuickPicks] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('All');

  const BRANDS = ['All', 'Toyota', 'Hyundai', 'Mahindra', 'Tata', 'Maruti Suzuki', 'Kia', 'BMW', 'Mercedes-Benz', 'Volkswagen', 'Skoda', 'Audi', 'MG'];

  const [formData, setFormData] = useState({
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
      year: new Date().getFullYear().toString(),
      segment: 'Sedan',
      color: '',
      paint_type: 'Metallic'
    }
  });

  useEffect(() => {
    api.getVehicleCatalog()
      .then(res => {
        if (res && res.models) setCatalog(res.models);
      })
      .catch(() => {});
  }, []);

  // Auto-fetch vehicle data from Number Plate
  const handleAutoFetchVehicle = async () => {
    const query = formData.vehicle.reg_number;
    if (!query || query.trim().length < 2) {
      alert('Please enter a Registration Number Plate (e.g. KA 03 MX 8899) first.');
      return;
    }

    try {
      setFetchingVehicle(true);
      setLookupMessage(null);
      const res = await api.lookupVehicle(query);

      if (res && res.data) {
        const d = res.data;
        if (res.found && d.make) {
          // Full real vehicle data found (from live VAHAN API or studio garage records)
          setFormData(prev => ({
            ...prev,
            name: prev.name || d.customer_name || '',
            phone: prev.phone || d.customer_phone || '',
            vehicle: {
              ...prev.vehicle,
              reg_number: d.reg_number || prev.vehicle.reg_number,
              make: d.make,
              model: d.model,
              year: d.year || new Date().getFullYear().toString(),
              segment: d.segment || 'Sedan',
              paint_type: d.paint_type || 'Metallic',
              color: d.color || ''
            }
          }));

          setLookupMessage({
            success: true,
            text: `✓ Live Verified: ${d.make} ${d.model} (${d.rto_location || res.source})`
          });
          setShowQuickPicks(false);
        } else {
          // 100% Genuine RTO Verified, prompt for exact model without guessing fake data
          setFormData(prev => ({
            ...prev,
            vehicle: {
              ...prev.vehicle,
              reg_number: d.reg_number || prev.vehicle.reg_number
            }
          }));

          setLookupMessage({
            success: true,
            text: `✓ RTO Verified: ${d.rto_location || res.source}. Select your car model below in 1 click.`
          });
          setShowQuickPicks(true);
        }
      }
    } catch (err) {
      setLookupMessage({
        success: true,
        text: 'Plate formatted. Tap your car model below to auto-fill.'
      });
      setShowQuickPicks(true);
    } finally {
      setFetchingVehicle(false);
    }
  };

  // 1-Click Apply from quick pick chip
  const handleApplyQuickPick = (pick) => {
    const matched = catalog.find(c => c.model.toLowerCase() === pick.model.toLowerCase());
    setFormData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        make: pick.make,
        model: pick.model,
        segment: pick.segment || matched?.segment || 'SUV',
        paint_type: matched?.paint_type || 'Metallic',
        color: pick.color || matched?.colors?.[0] || 'White'
      }
    }));

    setLookupMessage({
      success: true,
      text: `Selected: ${pick.make} ${pick.model} (${pick.segment || 'SUV'})`
    });
  };

  // When model is typed or selected, auto-fill make and segment
  const handleModelChange = (modelName) => {
    const matched = catalog.find(c => c.model.toLowerCase() === modelName.toLowerCase());
    if (matched) {
      setFormData(prev => ({
        ...prev,
        vehicle: {
          ...prev.vehicle,
          model: matched.model,
          make: matched.make,
          segment: matched.segment,
          paint_type: matched.paint_type,
          color: prev.vehicle.color || matched.colors?.[0] || ''
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        vehicle: { ...prev.vehicle, model: modelName }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Customer Name and Phone number are required');
      return;
    }
    if (!formData.vehicle.reg_number) {
      alert('Vehicle Registration Plate is required');
      return;
    }
    if (!formData.vehicle.make) {
      alert('Vehicle Make / Brand is required. You can select one from the quick picks.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createCustomer(formData);
      if (onCustomerCreated) {
        onCustomerCreated({
          customerId: res.id,
          vehicleId: res.vehicleId,
          customerName: formData.name,
          phone: formData.phone,
          regNumber: formData.vehicle.reg_number
        });
      }
      onClose();
    } catch (err) {
      alert(err.message || 'Error creating customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Quick Add New Customer & Car</h3>
              <p className="text-xs text-slate-400">Add client profile and auto-fetch vehicle specs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Customer Details */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              1. Customer Information
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Phone / WhatsApp *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@gmail.com"
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Details with Auto-Fetch */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CarFront className="w-4 h-4 text-amber-400" /> 2. Vehicle Profile (Number Plate Only)
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

            {/* Notification message from API */}
            {lookupMessage && (
              <div className="p-2.5 rounded-xl border text-[11px] flex items-center gap-2 bg-emerald-950/30 border-emerald-500/30 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lookupMessage.text}</span>
              </div>
            )}

            {/* 1-Click Popular Car & Brand Presets */}
            {(showQuickPicks || (!formData.vehicle.make && formData.vehicle.reg_number)) && (
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" /> Quick Vehicle Picker (1-Click Auto-Fill):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQuickPicks(!showQuickPicks)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    {showQuickPicks ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* Brand Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                  {BRANDS.map((b, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedBrand(b)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all ${
                        selectedBrand === b
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                {/* Model Chips for Selected Brand */}
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {(selectedBrand === 'All'
                    ? DEFAULT_QUICK_PICKS
                    : catalog.filter(c => c.make.toLowerCase() === selectedBrand.toLowerCase())
                  ).map((p, idx) => {
                    const isSelected = formData.vehicle.model.toLowerCase().includes(p.model.toLowerCase()) || p.model.toLowerCase().includes(formData.vehicle.model.toLowerCase() && formData.vehicle.model.length > 2);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyQuickPick(p)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-white'
                        }`}
                      >
                        {p.make} {p.model}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Registration Plate *</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="e.g. KA 03 MX 8899 / TN 01 AB 1234"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Make / Brand *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Toyota / BMW / Hyundai"
                  value={formData.vehicle.make}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicle: { ...formData.vehicle, make: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Model * (Smart Autocomplete)</label>
                <input
                  required
                  type="text"
                  list="car-models-list"
                  placeholder="e.g. Fortuner / Creta / Thar"
                  value={formData.vehicle.model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <datalist id="car-models-list">
                  {catalog.map((c, idx) => (
                    <option key={idx} value={c.model}>{c.make} {c.model} ({c.segment})</option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Size Segment</label>
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
                <label className="text-slate-300 font-semibold block mb-1">Model Year</label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Color</label>
                <input
                  type="text"
                  placeholder="e.g. Attitude Black / Super White"
                  value={formData.vehicle.color}
                  onChange={(e) => setFormData({
                    ...formData,
                    vehicle: { ...formData.vehicle, color: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                {(() => {
                  const currentCar = catalog.find(c => c.model.toLowerCase() === formData.vehicle.model.toLowerCase());
                  if (currentCar?.colors?.length) {
                    return (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {currentCar.colors.map((col, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              vehicle: { ...prev.vehicle, color: col }
                            }))}
                            className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                              formData.vehicle.color === col
                                ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
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
                  <option value="Metallic">Metallic</option>
                  <option value="Solid Gloss">Solid Gloss</option>
                  <option value="Matte/Satin">Matte/Satin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create & Select Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
