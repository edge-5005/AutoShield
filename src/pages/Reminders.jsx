import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  Plus, 
  Search, 
  CheckCircle2, 
  Share2, 
  Calendar, 
  Clock, 
  ShieldCheck,
  X
} from 'lucide-react';
import { api } from '../utils/api';
import { formatDate } from '../utils/formatters';
import WhatsAppShareModal from '../components/WhatsAppShareModal';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    title: '',
    service_type: 'Ceramic Coating',
    warranty_expiry: '',
    next_followup_date: '',
    notes: ''
  });

  useEffect(() => {
    loadReminders();
    loadMeta();
  }, [statusFilter]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await api.getReminders(statusFilter);
      setReminders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMeta = async () => {
    try {
      const [cList, vList] = await Promise.all([api.getCustomers(), api.getVehicles()]);
      setCustomers(cList);
      setVehicles(vList);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCustomerVehicles = vehicles.filter(v => String(v.customer_id) === String(formData.customer_id));

  const handleComplete = async (r) => {
    try {
      await api.updateReminder(r.id, { status: 'completed' });
      loadReminders();
    } catch (err) {
      alert('Error updating reminder');
    }
  };

  const handleOpenWhatsApp = (r) => {
    setSelectedReminder(r);
    setIsWhatsAppOpen(true);
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      await api.createReminder(formData);
      setIsModalOpen(false);
      loadReminders();
    } catch (err) {
      alert(err.message || 'Error creating reminder');
    }
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BellRing className="w-6 h-6 text-amber-500" />
            <span>Warranty Follow-ups & Maintenance Alerts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Retain ceramic coating & PPF customers with automated 6-month & annual checkup reminders
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Follow-up Alert</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'all', label: 'All Follow-ups' },
          { id: 'pending', label: 'Pending / Due' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading follow-ups...</div>
      ) : reminders.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
          <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No Reminders Found</p>
          <p className="text-xs text-slate-500 mt-1">Reminders are automatically generated when Ceramic Coating or PPF invoices are created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((r) => {
            const isDone = r.status === 'completed';
            return (
              <div
                key={r.id}
                className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all ${
                  isDone ? 'border-slate-800 opacity-60' : 'border-amber-500/30 bg-amber-950/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-500/20 font-mono font-bold text-xs uppercase">
                      {r.reg_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isDone ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm mb-1">{r.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{r.make} {r.model} • Owner: <strong className="text-slate-300">{r.customer_name}</strong></p>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Due Date:
                      </span>
                      <span className="font-bold text-amber-300">{formatDate(r.next_followup_date)}</span>
                    </div>
                    {r.warranty_expiry && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Warranty Expiry:</span>
                        <span className="text-slate-400">{formatDate(r.warranty_expiry)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleOpenWhatsApp(r)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 font-semibold transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp Alert</span>
                  </button>

                  {!isDone && (
                    <button
                      onClick={() => handleComplete(r)}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-semibold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Done</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">Schedule Maintenance Follow-up</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Customer *</label>
                <select
                  required
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value, vehicle_id: '' })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Select Vehicle *</label>
                <select
                  required
                  disabled={!formData.customer_id}
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {filteredCustomerVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.reg_number} - {v.make} {v.model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Follow-up Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ceramic Coating 6-Month Top-up Wash Due"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Follow-up Date *</label>
                  <input
                    required
                    type="date"
                    value={formData.next_followup_date}
                    onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Warranty Expiry Date</label>
                  <input
                    type="date"
                    value={formData.warranty_expiry}
                    onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

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
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        data={selectedReminder}
        type="reminder"
      />
    </div>
  );
}
