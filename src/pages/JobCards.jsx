import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  CarFront, 
  ChevronRight,
  ShieldAlert,
  User,
  ArrowRight,
  UserPlus,
  X
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/formatters';
import VehicleInspectionModal from '../components/VehicleInspectionModal';
import QuickCustomerModal from '../components/QuickCustomerModal';

export default function JobCards() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Job Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    assigned_tech: '',
    fuel_level: '50%',
    odometer: '',
    estimated_delivery: '',
    advance_amount: 0,
    notes: '',
    selectedServices: [],
    inspection_notes: {}
  });

  useEffect(() => {
    loadJobs();
    loadMeta();
    if (searchParams.get('create') === 'true') {
      setIsModalOpen(true);
    }
  }, [statusFilter]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getJobs(statusFilter);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const [cList, vList, sList] = await Promise.all([
        api.getCustomers(),
        api.getVehicles(),
        api.getServices()
      ]);
      setCustomers(cList);
      setVehicles(vList);
      setServices(sList);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerChange = (customerId) => {
    if (customerId === 'NEW_CUSTOMER') {
      setIsQuickCustomerOpen(true);
      return;
    }
    setFormData(prev => ({
      ...prev,
      customer_id: customerId,
      vehicle_id: '' // reset vehicle
    }));
  };

  const handleQuickCustomerCreated = async (created) => {
    // Reload customers & vehicles
    const [cList, vList] = await Promise.all([api.getCustomers(), api.getVehicles()]);
    setCustomers(cList);
    setVehicles(vList);

    setFormData(prev => ({
      ...prev,
      customer_id: String(created.customerId),
      vehicle_id: created.vehicleId ? String(created.vehicleId) : ''
    }));
  };

  const filteredCustomerVehicles = vehicles.filter(
    v => String(v.customer_id) === String(formData.customer_id)
  );

  const selectedVehicleObj = vehicles.find(v => String(v.id) === String(formData.vehicle_id));

  const toggleService = (srv) => {
    setFormData(prev => {
      const exists = prev.selectedServices.find(s => s.service_id === srv.id);
      if (exists) {
        return {
          ...prev,
          selectedServices: prev.selectedServices.filter(s => s.service_id !== srv.id)
        };
      } else {
        // Price based on vehicle segment
        const seg = (selectedVehicleObj?.segment || 'SUV').toLowerCase();
        let price = srv.price_suv;
        if (seg.includes('hatch')) price = srv.price_hatchback;
        else if (seg.includes('sedan')) price = srv.price_sedan;
        else if (seg.includes('lux')) price = srv.price_luxury;

        return {
          ...prev,
          selectedServices: [
            ...prev.selectedServices,
            {
              service_id: srv.id,
              name: srv.name,
              price: Number(price) || 0,
              qty: 1,
              warranty_months: srv.warranty_months,
              sac: srv.sac_code || '9987',
              taxRate: srv.tax_rate || 18
            }
          ]
        };
      }
    });
  };

  const totalCalculated = formData.selectedServices.reduce((acc, s) => acc + (s.price * (s.qty || 1)), 0);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.vehicle_id) {
      alert('Please select both Customer and Vehicle');
      return;
    }

    try {
      await api.createJob({
        customer_id: formData.customer_id,
        vehicle_id: formData.vehicle_id,
        assigned_tech: formData.assigned_tech,
        fuel_level: formData.fuel_level,
        odometer: formData.odometer,
        estimated_delivery: formData.estimated_delivery,
        advance_amount: Number(formData.advance_amount) || 0,
        total_estimated: totalCalculated,
        services_selected: formData.selectedServices,
        inspection_notes: formData.inspection_notes,
        notes: formData.notes,
        status: 'received'
      });

      setIsModalOpen(false);
      loadJobs();
    } catch (err) {
      alert(err.message || 'Error creating job card');
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      j.job_number?.toLowerCase().includes(q) ||
      j.reg_number?.toLowerCase().includes(q) ||
      j.make?.toLowerCase().includes(q) ||
      j.model?.toLowerCase().includes(q) ||
      j.customer_name?.toLowerCase().includes(q) ||
      j.customer_phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-blue-500" />
            <span>Job Cards & Studio Bays</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track active detailing cars, digital inspection sheets & work orders
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Job Card</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'received', label: 'Received' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'quality_check', label: 'Quality Check' },
            { id: 'ready', label: 'Ready for Delivery' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by plate, car, or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Jobs Grid / Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading job cards...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <Wrench className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No Job Cards Found</p>
          <p className="text-xs text-slate-500 mt-1">Create a new job card for an incoming customer car.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            const badge = getStatusBadge(job.status);
            return (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between group shadow-sm transition-all"
              >
                <div>
                  {/* Top Bar: Job Number & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {job.job_number}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Vehicle info with License plate badge */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-500/20 text-amber-300 font-black font-mono text-xs tracking-wider uppercase shrink-0">
                      {job.reg_number}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                        {job.make} {job.model}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {job.color || 'Standard'} • {job.segment || 'Sedan'}
                      </p>
                    </div>
                  </div>

                  {/* Customer & Technician */}
                  <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-400" /> Customer:
                      </span>
                      <span className="font-semibold text-white">{job.customer_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-amber-400" /> Technician:
                      </span>
                      <span className="text-slate-200">{job.assigned_tech || 'Unassigned'}</span>
                    </div>
                    {job.estimated_delivery && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" /> Est. Delivery:
                        </span>
                        <span className="text-emerald-400 font-medium">{formatDate(job.estimated_delivery)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Estimated Total</span>
                    <span className="font-bold text-white font-mono">{formatCurrency(job.total_estimated)}</span>
                  </div>

                  <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Open Details <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* New Job Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Create Detailing Job Card</h2>
                <p className="text-xs text-slate-400">Receive customer vehicle, assign services & inspect condition</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateJob} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Step 1: Customer & Vehicle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-semibold">Select Customer *</label>
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
                    value={formData.customer_id}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose Customer --</option>
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
                  <label className="text-slate-300 font-semibold block mb-1.5">Select Vehicle *</label>
                  <select
                    required
                    disabled={!formData.customer_id}
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="">-- Choose Customer's Vehicle --</option>
                    {filteredCustomerVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.reg_number} - {v.make} {v.model} ({v.segment})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Bay & Logistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">Assigned Detailer / Tech</label>
                  <input
                    type="text"
                    placeholder="e.g. Karthik & Team"
                    value={formData.assigned_tech}
                    onChange={(e) => setFormData({ ...formData, assigned_tech: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">Est. Delivery Date</label>
                  <input
                    type="date"
                    value={formData.estimated_delivery}
                    onChange={(e) => setFormData({ ...formData, estimated_delivery: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1.5">Advance Collected (₹)</label>
                  <input
                    type="number"
                    value={formData.advance_amount}
                    onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Step 3: Trigger Digital Inspection Sheet */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> Pre-Delivery Vehicle Inspection (PDI) Sheet
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {Object.keys(formData.inspection_notes?.selectedIssues || {}).length > 0
                      ? `${Object.keys(formData.inspection_notes.selectedIssues).length} panels marked with pre-existing issues.`
                      : 'No pre-existing damages marked yet. Click to inspect car before work begins.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInspectionOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-semibold transition-colors"
                >
                  Open Inspection Sheet
                </button>
              </div>

              {/* Step 4: Detailing Services Selection */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">
                  Select Detailing Services & Packages (Tiered by Car Size)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {services.map((srv) => {
                    const isSelected = formData.selectedServices.some(s => s.service_id === srv.id);
                    const seg = (selectedVehicleObj?.segment || 'SUV').toLowerCase();
                    let price = srv.price_suv;
                    if (seg.includes('hatch')) price = srv.price_hatchback;
                    else if (seg.includes('sedan')) price = srv.price_sedan;
                    else if (seg.includes('lux')) price = srv.price_luxury;

                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white'
                            : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs">{srv.name}</span>
                          <span className="font-mono font-bold text-blue-400">
                            {formatCurrency(price)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Category: {srv.category} {srv.warranty_months > 0 ? `• ${srv.warranty_months / 12} Yr Warranty` : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 p-3 bg-slate-950 rounded-xl flex justify-between items-center border border-slate-800">
                  <span className="text-slate-400 font-medium">Estimated Work Order Total:</span>
                  <span className="text-base font-black text-white font-mono">{formatCurrency(totalCalculated)}</span>
                </div>
              </div>

              {/* Step 5: Notes */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">Special Instructions / Customer Requests</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Customer requested extra coat on bonnet; avoid high pressure on loose emblem."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
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
                  Generate Job Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pre-Delivery Vehicle Inspection Modal */}
      <VehicleInspectionModal
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        initialData={formData.inspection_notes}
        onSave={(inspectionData) => {
          setFormData({
            ...formData,
            inspection_notes: inspectionData,
            fuel_level: inspectionData.fuelLevel || formData.fuel_level,
            odometer: inspectionData.odometer || formData.odometer
          });
        }}
      />

      {/* Quick Customer Modal */}
      <QuickCustomerModal
        isOpen={isQuickCustomerOpen}
        onClose={() => setIsQuickCustomerOpen(false)}
        onCustomerCreated={handleQuickCustomerCreated}
      />
    </div>
  );
}
