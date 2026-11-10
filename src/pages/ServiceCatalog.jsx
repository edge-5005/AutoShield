import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  CarFront, 
  Layers,
  X
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

export default function ServiceCatalog() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Ceramic Coating',
    description: '',
    sac_code: '9987',
    tax_rate: 18,
    warranty_months: 0,
    price_hatchback: 0,
    price_sedan: 0,
    price_suv: 0,
    price_luxury: 0
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await api.getServices();
      setServices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Ceramic Coating',
      description: '',
      sac_code: '9987',
      tax_rate: 18,
      warranty_months: 0,
      price_hatchback: 0,
      price_sedan: 0,
      price_suv: 0,
      price_luxury: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setFormData({
      name: srv.name,
      category: srv.category,
      description: srv.description || '',
      sac_code: srv.sac_code || '9987',
      tax_rate: srv.tax_rate || 18,
      warranty_months: srv.warranty_months || 0,
      price_hatchback: srv.price_hatchback || 0,
      price_sedan: srv.price_sedan || 0,
      price_suv: srv.price_suv || 0,
      price_luxury: srv.price_luxury || 0
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.updateService(editingService.id, formData);
      } else {
        await api.createService(formData);
      }
      setIsModalOpen(false);
      loadServices();
    } catch (err) {
      alert(err.message || 'Error saving service');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete package "${name}"?`)) return;
    try {
      await api.deleteService(id);
      loadServices();
    } catch (err) {
      alert('Error deleting service');
    }
  };

  const categories = ['All', 'Ceramic Coating', 'PPF', 'Paint Correction', 'Interior', 'Wash & Detail', 'Addon'];

  const filtered = services.filter(s => {
    if (activeCategory === 'All') return true;
    return s.category === activeCategory;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <span>Detailing Packages & Sized Pricing</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure ceramic coating, PPF, correction packages, and vehicle size rates
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Detailing Package</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading detailing catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((srv) => (
            <div
              key={srv.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative group"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {srv.category}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(srv.id, srv.name)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-white text-sm mb-1">{srv.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{srv.description}</p>

                {srv.warranty_months > 0 && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold mb-3">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{srv.warranty_months / 12} Year Official Warranty</span>
                  </div>
                )}
              </div>

              {/* Sized Pricing Table */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Tiered Size Pricing:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Hatchback</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(srv.price_hatchback)}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Sedan / C-SUV</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(srv.price_sedan)}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Full SUV</span>
                    <span className="font-mono font-bold text-blue-400">{formatCurrency(srv.price_suv)}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 block">Luxury / Exotic</span>
                    <span className="font-mono font-bold text-amber-400">{formatCurrency(srv.price_luxury)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">
                {editingService ? 'Edit Detailing Package' : 'Add New Detailing Package'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Package Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ceramic Coating 9H Diamond Shield"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Ceramic Coating">Ceramic Coating</option>
                    <option value="PPF">PPF (Paint Protection Film)</option>
                    <option value="Paint Correction">Paint Correction</option>
                    <option value="Interior">Interior Detailing</option>
                    <option value="Wash & Detail">Wash & Detail</option>
                    <option value="Addon">Addon / Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Warranty (Months)</label>
                  <input
                    type="number"
                    value={formData.warranty_months}
                    onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
                    placeholder="e.g. 36 (for 3 yrs) or 60 (for 5 yrs)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 3-stage polishing, ceramic seal, swirl removal, and 6-month checkups."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Tiered Pricing */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">
                  Tiered Pricing by Car Segment (₹)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Hatchback</span>
                    <input
                      type="number"
                      value={formData.price_hatchback}
                      onChange={(e) => setFormData({ ...formData, price_hatchback: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Sedan</span>
                    <input
                      type="number"
                      value={formData.price_sedan}
                      onChange={(e) => setFormData({ ...formData, price_sedan: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Full SUV</span>
                    <input
                      type="number"
                      value={formData.price_suv}
                      onChange={(e) => setFormData({ ...formData, price_suv: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Luxury</span>
                    <input
                      type="number"
                      value={formData.price_luxury}
                      onChange={(e) => setFormData({ ...formData, price_luxury: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-center"
                    />
                  </div>
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
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
