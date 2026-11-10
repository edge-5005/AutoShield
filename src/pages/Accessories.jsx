import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Edit3, Trash2, RefreshCw, 
  ShieldCheck, AlertTriangle, CheckCircle, ArrowUpDown, Tag, Box
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const CATEGORIES = [
  'All',
  'Floor Mats & Protection',
  'Electronics & Dashcams',
  'Care & Sprays',
  'Microfiber & Towels',
  'Interior Luxury'
];

export default function Accessories() {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Floor Mats & Protection',
    description: '',
    hsn_sac_code: '8708',
    tax_rate: 18,
    cost_price: 1000,
    selling_price: 2499,
    stock_quantity: 10,
    min_stock_alert: 3,
    warranty_months: 12,
    brand: 'Apex Studio OEM'
  });

  useEffect(() => {
    loadAccessories();
  }, [selectedCategory, searchQuery]);

  const loadAccessories = async () => {
    try {
      setLoading(true);
      const data = await api.getAccessories(selectedCategory === 'All' ? 'all' : selectedCategory, searchQuery);
      setAccessories(data);
    } catch (err) {
      console.error('Error loading accessories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Floor Mats & Protection',
      description: '',
      hsn_sac_code: '8708',
      tax_rate: 18,
      cost_price: 1500,
      selling_price: 3499,
      stock_quantity: 10,
      min_stock_alert: 3,
      warranty_months: 12,
      brand: 'Apex Studio OEM'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      hsn_sac_code: item.hsn_sac_code || '8708',
      tax_rate: item.tax_rate || 18,
      cost_price: item.cost_price || 0,
      selling_price: item.selling_price || 0,
      stock_quantity: item.stock_quantity || 0,
      min_stock_alert: item.min_stock_alert || 3,
      warranty_months: item.warranty_months || 0,
      brand: item.brand || 'Apex Studio OEM'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateAccessory(editingItem.id, formData);
      } else {
        await api.createAccessory(formData);
      }
      setIsModalOpen(false);
      loadAccessories();
    } catch (err) {
      alert(err.message || 'Error saving accessory');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this accessory?')) return;
    try {
      await api.deleteAccessory(id);
      loadAccessories();
    } catch (err) {
      alert('Error deleting accessory');
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('This will restore the standard pre-configured car accessories list. Continue?')) return;
    try {
      setLoading(true);
      await api.resetDefaultAccessories();
      loadAccessories();
    } catch (err) {
      alert('Error restoring default catalog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-amber-500" />
            <span>Car Accessories & Inventory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pre-loaded detailing accessories, 7D mats, dashcams, ceramic boosters & stock inventory tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            title="Restore default pre-loaded car accessories"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-carbon-800 hover:bg-carbon-700 text-slate-300 hover:text-white border border-carbon-700 text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Default List</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 font-extrabold text-xs shadow-ceramic transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Accessory</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-4 shadow-carbon flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-carbon-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-carbon-950 text-slate-400 hover:text-white hover:bg-carbon-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search accessories or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-carbon-950 border border-carbon-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Accessories Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading accessories catalog...</div>
      ) : accessories.length === 0 ? (
        <div className="p-12 text-center bg-carbon-900 border border-carbon-800 rounded-2xl">
          <Box className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">No accessories found</p>
          <p className="text-xs text-slate-400 mt-1">Try another category or restore the default car accessories list</p>
          <button
            onClick={handleResetDefaults}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-carbon-950 font-bold text-xs shadow-ceramic"
          >
            Load Default Detailing Accessories
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessories.map((item) => {
            const isLowStock = item.stock_quantity <= item.min_stock_alert && item.stock_quantity > 0;
            const isOutOfStock = item.stock_quantity <= 0;
            const profitPerUnit = (item.selling_price || 0) - (item.cost_price || 0);
            const marginPct = item.selling_price > 0 ? ((profitPerUnit / item.selling_price) * 100).toFixed(0) : 0;

            return (
              <div
                key={item.id}
                className="bg-carbon-900 border border-carbon-800 rounded-2xl p-5 shadow-carbon hover:border-carbon-700 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>

                    {/* Stock status badge */}
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      isOutOfStock
                        ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        : isLowStock
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? `Low: ${item.stock_quantity} left` : `In Stock: ${item.stock_quantity}`}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Brand: <strong className="text-slate-300">{item.brand}</strong> • HSN: <span className="font-mono">{item.hsn_sac_code}</span>
                  </p>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description || 'Premium automotive detailing accessory.'}
                  </p>
                </div>

                {/* Price, Margin & Actions */}
                <div className="pt-3 border-t border-carbon-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-semibold">Selling Price</span>
                      <span className="text-base font-extrabold text-white font-mono">
                        {formatCurrency(item.selling_price)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block uppercase font-semibold">Margin / Profit</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        +{formatCurrency(profitPerUnit)} ({marginPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      Warranty: <strong className="text-slate-300">{item.warranty_months} Mos</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800 transition-colors"
                        title="Edit Accessory"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                        title="Delete Accessory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Accessory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-carbon-900 border border-carbon-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                <span>{editingItem ? 'Edit Accessory Profile' : 'Add New Car Accessory'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Accessory Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 7D Custom Diamond-Stitch Floor Mats"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Brand / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Armour / 70mai"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Specification, materials, installation notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Pricing & Stock Details */}
              <div className="p-3.5 bg-carbon-950 rounded-xl border border-carbon-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  Pricing, Taxes & Inventory
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">Selling Price (₹) *</label>
                    <input
                      required
                      type="number"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">Cost Price (₹)</label>
                    <input
                      type="number"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">GST Rate (%)</label>
                    <input
                      type="number"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-slate-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">Low Stock Alert</label>
                    <input
                      type="number"
                      value={formData.min_stock_alert}
                      onChange={(e) => setFormData({ ...formData, min_stock_alert: parseInt(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 text-[11px] block mb-0.5">Warranty (Months)</label>
                    <input
                      type="number"
                      value={formData.warranty_months}
                      onChange={(e) => setFormData({ ...formData, warranty_months: parseInt(e.target.value) || 0 })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 font-bold shadow-ceramic"
                >
                  {editingItem ? 'Save Changes' : 'Create Accessory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
