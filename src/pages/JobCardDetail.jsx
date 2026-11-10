import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Wrench, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Fuel, 
  Gauge, 
  ShieldAlert, 
  Receipt, 
  Share2, 
  User, 
  Phone, 
  MapPin, 
  CarFront,
  Sparkles,
  Award
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/formatters';
import VehicleInspectionModal from '../components/VehicleInspectionModal';
import WhatsAppShareModal from '../components/WhatsAppShareModal';

const STATUS_STEPS = [
  { id: 'received', label: '1. Received' },
  { id: 'in_progress', label: '2. In Progress' },
  { id: 'quality_check', label: '3. Quality Check' },
  { id: 'ready', label: '4. Ready for Delivery' },
  { id: 'delivered', label: '5. Delivered' },
];

export default function JobCardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [whatsAppType, setWhatsAppType] = useState('ready');

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await api.getJob(id);
      setJob(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.updateJob(id, { status: newStatus });
      setJob(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleSaveInspection = async (inspectionData) => {
    try {
      await api.updateJob(id, {
        inspection_notes: inspectionData,
        fuel_level: inspectionData.fuelLevel,
        odometer: inspectionData.odometer
      });
      loadJob();
    } catch (err) {
      alert('Failed to save inspection notes');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading job card details...</div>;
  }

  if (!job) {
    return <div className="p-12 text-center text-rose-500">Job card not found.</div>;
  }

  const badge = getStatusBadge(job.status);
  const parsedInspection = typeof job.inspection_notes === 'string'
    ? JSON.parse(job.inspection_notes || '{}')
    : (job.inspection_notes || {});

  const selectedServices = typeof job.services_selected === 'string'
    ? JSON.parse(job.services_selected || '[]')
    : (job.services_selected || []);

  const issuesList = Object.entries(parsedInspection.selectedIssues || {});

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Job Cards</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setWhatsAppType(job.status === 'ready' ? 'ready' : 'invoice');
              setIsWhatsAppOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Notify Customer (WhatsApp)</span>
          </button>

          {job.linkedInvoice ? (
            <Link
              to={`/billing?invoice=${job.linkedInvoice.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
            >
              <Receipt className="w-4 h-4" />
              <span>View Invoice ({job.linkedInvoice.invoice_number})</span>
            </Link>
          ) : (
            <Link
              to={`/billing/new?job_id=${job.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
            >
              <Receipt className="w-4 h-4" />
              <span>Generate GST Invoice</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm font-bold text-slate-400">{job.job_number}</span>
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                {badge.label}
              </span>
              <span className="text-xs text-slate-500">• Created {formatDate(job.created_at)}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-400/10 border-2 border-amber-500/30 text-amber-300 font-black font-mono text-base tracking-widest uppercase">
                {job.reg_number}
              </div>
              <div>
                <h1 className="text-xl font-black text-white">
                  {job.make} {job.model} {job.year ? `(${job.year})` : ''}
                </h1>
                <p className="text-xs text-slate-400">
                  {job.segment || 'Sedan'} • {job.color || 'Standard'} • Paint: {job.paint_type || 'Metallic'}
                </p>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 block">Total Work Order Value</span>
            <span className="text-2xl font-black text-white font-mono">{formatCurrency(job.total_estimated)}</span>
            <div className="text-xs text-slate-400 mt-1">
              Advance: <span className="text-emerald-400 font-medium">{formatCurrency(job.advance_amount)}</span>
            </div>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="pt-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Bay Workflow & Detailing Stage:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STATUS_STEPS.map((s) => {
              const active = job.status === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleStatusChange(s.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                    active
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30 ring-2 ring-blue-500/40'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2-Column Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer & Bay Details (1 Col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" /> Customer Information
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 block">Customer Name</span>
                <span className="font-bold text-white text-sm">{job.customer_name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Phone</span>
                <span className="font-medium text-slate-300 font-mono">{job.customer_phone}</span>
              </div>
              {job.customer_email && (
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <span className="font-medium text-slate-300">{job.customer_email}</span>
                </div>
              )}
              {job.customer_address && (
                <div>
                  <span className="text-slate-500 block">Billing Address</span>
                  <span className="text-slate-400">{job.customer_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bay Assignment & Logistics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" /> Bay & Logistics
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Detailer:</span>
                <span className="font-semibold text-white">{job.assigned_tech || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5 text-blue-400" /> Fuel Level:
                </span>
                <span className="font-semibold text-white">{job.fuel_level || '50%'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" /> Odometer:
                </span>
                <span className="font-semibold text-white">{job.odometer || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" /> Est. Delivery:
                </span>
                <span className="font-semibold text-emerald-400">{formatDate(job.estimated_delivery)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services & Pre-Delivery Inspection (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Services in Work Order */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Detailing Services in Work Order</span>
            </h3>

            {selectedServices.length === 0 ? (
              <p className="text-xs text-slate-500">No specific services itemized.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {selectedServices.map((srv, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{srv.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>SAC: {srv.sac || '9987'}</span>
                        {srv.warranty_months > 0 && (
                          <span className="text-purple-400 font-semibold">
                            🛡️ {srv.warranty_months / 12} Yr Warranty
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white text-xs">
                      {formatCurrency(srv.price * (srv.qty || 1))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pre-Delivery Vehicle Inspection */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Pre-Delivery Vehicle Inspection Record</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pre-existing panel damages & handover verification
                </p>
              </div>

              <button
                onClick={() => setIsInspectionOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 transition-colors"
              >
                Edit Sheet
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Paint Condition:</span>
                <span className="font-semibold text-amber-400">
                  {parsedInspection.paintCondition || 'Standard'}
                </span>
              </div>

              {issuesList.length > 0 ? (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Recorded Panel Damages ({issuesList.length} panels):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {issuesList.map(([area, tags]) => (
                      <div key={area} className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-xl text-xs flex justify-between items-center">
                        <span className="text-slate-300 font-medium">{area}</span>
                        <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
                          {tags.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No external dents or deep scratches recorded during initial vehicle checkin.</span>
                </div>
              )}

              {parsedInspection.customNotes && (
                <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <span className="font-bold text-slate-400 block mb-1">Handover Notes:</span>
                  {parsedInspection.customNotes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inspection Modal */}
      <VehicleInspectionModal
        isOpen={isInspectionOpen}
        onClose={() => setIsInspectionOpen(false)}
        initialData={job.inspection_notes}
        onSave={handleSaveInspection}
      />

      {/* WhatsApp Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        data={{
          customer_name: job.customer_name,
          customer_phone: job.customer_phone,
          reg_number: job.reg_number,
          make: job.make,
          model: job.model,
          grand_total: job.total_estimated,
          advance_paid: job.advance_amount,
          balance_due: Math.max(0, job.total_estimated - job.advance_amount),
          invoice_number: job.job_number
        }}
        type={whatsAppType}
      />
    </div>
  );
}
