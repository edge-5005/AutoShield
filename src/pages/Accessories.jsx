import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Plus, Search, Edit3, Trash2, RefreshCw, 
  ShieldCheck, AlertTriangle, CheckCircle, ArrowUpDown, Tag, Box,
  Image as ImageIcon, Sparkles, ExternalLink, Receipt
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Floor Mats & Protection',
  'Electronics & Dashcams',
  'Care & Sprays',
  'Microfiber & Towels',
  'Interior Luxury'
];

const PRESET_ACCESSORIES = [
  {
    name: '7D Custom Diamond-Stitch Floor Mats',
    category: 'Floor Mats & Protection',
    brand: 'Apex Armour',
    cost_price: 3200,
    selling_price: 6499,
    stock_quantity: 12,
    warranty_months: 24,
    description: 'Dual-layer wire coil + waterproof diamond leatherette tailored specifically to vehicle cabin contour.',
    image_url: '/accessories/7d-mats.jpg'
  },
  {
    name: '4K Dual-Channel Dashcam with Hardwired Parking Mode',
    category: 'Electronics & Dashcams',
    brand: '70mai / DDPAI Pro',
    cost_price: 6800,
    selling_price: 12999,
    stock_quantity: 8,
    warranty_months: 12,
    description: 'Front 4K + Rear 1080p, Sony Starvis night vision, supercapacitor, 24-hr G-sensor parking recording.',
    image_url: '/accessories/4k-dashcam.jpg'
  },
  {
    name: 'Graphene Hydrophobic Top-Up Detailer (500ml)',
    category: 'Care & Sprays',
    brand: 'CeramicPro Lab',
    cost_price: 650,
    selling_price: 1499,
    stock_quantity: 35,
    warranty_months: 24,
    description: 'Spray-on ceramic booster that revives contact angle, gloss, and hydrophobic water-beading on coated surfaces.',
    image_url: '/accessories/graphene-spray.jpg'
  },
  {
    name: '1200 GSM Twisted Loop Microfiber Car Drying Towel',
    category: 'Microfiber & Towels',
    brand: 'PureFiber Ultra',
    cost_price: 420,
    selling_price: 999,
    stock_quantity: 45,
    warranty_months: 6,
    description: 'Scratch-free edgeless super absorbent towel capable of drying an entire full-size SUV in a single pass.',
    image_url: '/accessories/microfiber-towel.jpg'
  },
  {
    name: 'German Leather Rejuvenation & Balm Conditioner Kit',
    category: 'Interior Luxury',
    brand: 'KochChemie / Colourlock',
    cost_price: 950,
    selling_price: 2199,
    stock_quantity: 16,
    warranty_months: 12,
    description: 'pH-neutral foaming leather shampoo, restorative lanolin balm conditioner, and horsehair cleaning brush.',
    image_url: '/accessories/leather-kit.jpg'
  },
  {
    name: 'Solar Alloy Rotary Car Perfume & Aromatherapy Diffuser',
    category: 'Interior Luxury',
    brand: 'Zenith Drive',
    cost_price: 550,
    selling_price: 1299,
    stock_quantity: 22,
    warranty_months: 6,
    description: 'Machined aircraft-grade aluminum alloy with solar-powered turbine bearing and organic essential scent ring.',
    image_url: '/accessories/solar-diffuser.jpg'
  },
  {
    name: 'Self-Healing TPU Door Edge & Cup Guard Kit (8 Pcs)',
    category: 'Floor Mats & Protection',
    brand: 'Apex Shield TPU',
    cost_price: 600,
    selling_price: 1499,
    stock_quantity: 20,
    warranty_months: 36,
    description: 'Pre-cut 200-micron optical TPU protection film to prevent ring scratches in door cups and wall chips.',
    image_url: '/accessories/tpu-door-guards.jpg'
  },
  {
    name: 'Custom Magnetic Snap-On Window Sunshades (Set of 4)',
    category: 'Floor Mats & Protection',
    brand: 'AutoShade Pro',
    cost_price: 900,
    selling_price: 1999,
    stock_quantity: 14,
    warranty_months: 12,
    description: 'High-density laser-measured heat and UV blocking mesh curtains with magnetic window frame snaps.',
    image_url: '/accessories/magnetic-sunshades.jpg'
  },
  {
    name: '15W MagSafe Auto-Clamping Fast Wireless Car Charger',
    category: 'Electronics & Dashcams',
    brand: 'Anker / Baseus Turbo',
    cost_price: 1100,
    selling_price: 2499,
    stock_quantity: 18,
    warranty_months: 12,
    description: 'Smart infrared motorized grip, Qi fast-charging certification, and anti-vibration air vent hook.',
    image_url: '/accessories/magsafe-charger.jpg'
  },
  {
    name: 'Carbon Fiber Protective Key Fob Shell Case',
    category: 'Interior Luxury',
    brand: 'Apex Carbon',
    cost_price: 350,
    selling_price: 899,
    stock_quantity: 28,
    warranty_months: 12,
    description: 'Real twill weave look lightweight ABS shell protecting key remote from accidental drops and scuffs.',
    image_url: '/accessories/carbon-keyfob.jpg'
  }
];

export default function Accessories() {
  const { isAdmin } = useAuth();
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
    brand: 'Apex Studio OEM',
    image_url: ''
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
      brand: 'Apex Studio OEM',
      image_url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80'
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
      brand: item.brand || 'Apex Studio OEM',
      image_url: item.image_url || ''
    });
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      name: preset.name,
      category: preset.category,
      brand: preset.brand,
      cost_price: preset.cost_price,
      selling_price: preset.selling_price,
      stock_quantity: preset.stock_quantity,
      warranty_months: preset.warranty_months,
      description: preset.description,
      image_url: preset.image_url
    }));
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
    if (!confirm('This will restore the standard pre-configured car accessories catalog with HD product images. Continue?')) return;
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

  // Metrics
  const totalItems = accessories.length;
  const inStockCount = accessories.filter(a => a.stock_quantity > 0).length;
  const lowStockCount = accessories.filter(a => a.stock_quantity <= a.min_stock_alert && a.stock_quantity > 0).length;
  const totalStockValue = accessories.reduce((acc, a) => acc + ((a.cost_price || 0) * (a.stock_quantity || 0)), 0);

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Retail Inventory & Add-Ons
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <Package className="w-7 h-7 text-amber-400" />
            <span>Car Accessories & Merchandise</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Aftermarket high-margin accessories with HD product photography, stock alerts, and 1-click invoice billing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-slate-300 hover:text-white border border-carbon-700 text-xs font-semibold transition-all"
            title="Restore default catalog with photography"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reload Pre-Set Catalog</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 font-black text-xs shadow-ceramic transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-carbon-950" />
            <span>Add New Accessory</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-4 shadow-carbon">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Products</span>
          <p className="text-2xl font-black text-white mt-1 font-mono">{totalItems}</p>
          <span className="text-[10px] text-slate-500">Across 5 studio categories</span>
        </div>

        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-4 shadow-carbon">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Ready in Stock</span>
          <p className="text-2xl font-black text-emerald-400 mt-1 font-mono">{inStockCount}</p>
          <span className="text-[10px] text-emerald-400/80">Available for walk-in billing</span>
        </div>

        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-4 shadow-carbon">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Low Stock Alert</span>
          <p className="text-2xl font-black text-amber-400 mt-1 font-mono">{lowStockCount}</p>
          <span className="text-[10px] text-amber-400/80">Re-order from vendor soon</span>
        </div>

        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-4 shadow-carbon">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            {isAdmin ? 'Total Inventory Capital' : 'Product Lineup'}
          </span>
          <p className="text-2xl font-black text-cyan-400 mt-1 font-mono">
            {isAdmin ? formatCurrency(totalStockValue) : `${totalItems} Items`}
          </p>
          <span className="text-[10px] text-slate-500">
            {isAdmin ? 'At raw wholesale acquisition cost' : 'Certified Detailing Grade'}
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-carbon">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-carbon-950 shadow-ceramic font-black'
                  : 'bg-carbon-950 text-slate-400 hover:text-white hover:bg-carbon-800 border border-carbon-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search accessories or brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-carbon-950 border border-carbon-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Product Grid with High-Definition Photography */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-semibold">Loading product catalog and images...</p>
        </div>
      ) : accessories.length === 0 ? (
        <div className="p-12 text-center bg-carbon-900 border border-carbon-800 rounded-3xl">
          <Box className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No accessories found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try switching the category filter or reload the default detailing merchandise catalog with pre-loaded product photos.
          </p>
          <button
            onClick={handleResetDefaults}
            className="mt-4 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-carbon-950 font-black text-xs shadow-ceramic"
          >
            Load 10 Default Accessories with Photos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accessories.map((item) => {
            const isLowStock = item.stock_quantity <= item.min_stock_alert && item.stock_quantity > 0;
            const isOutOfStock = item.stock_quantity <= 0;
            const profitPerUnit = (item.selling_price || 0) - (item.cost_price || 0);
            const marginPct = item.selling_price > 0 ? ((profitPerUnit / item.selling_price) * 100).toFixed(0) : 0;

            const fallbackImage = 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80';
            const displayImage = item.image_url && item.image_url.trim() ? item.image_url : fallbackImage;

            return (
              <div
                key={item.id}
                className="bg-carbon-900 border border-carbon-800 rounded-2xl overflow-hidden shadow-carbon hover:border-carbon-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image Banner Container */}
                  <div className="relative w-full h-48 bg-carbon-950 overflow-hidden select-none">
                    <img 
                      src={displayImage} 
                      alt={item.name}
                      onError={(e) => { e.target.src = fallbackImage; }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon-900 via-transparent to-black/30 pointer-events-none"></div>

                    {/* Category Pill Floating Top-Left */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-carbon-950/80 backdrop-blur-md border border-amber-500/30 px-2.5 py-1 rounded-lg shadow-sm">
                        {item.category}
                      </span>
                    </div>

                    {/* Stock Status Pill Floating Top-Right */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg backdrop-blur-md border shadow-sm ${
                        isOutOfStock
                          ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                          : isLowStock
                          ? 'bg-amber-950/80 border-amber-500/40 text-amber-300 animate-pulse'
                          : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      }`}>
                        {isOutOfStock ? '● Out of Stock' : isLowStock ? `⚠️ Low: ${item.stock_quantity} left` : `✓ In Stock: ${item.stock_quantity}`}
                      </span>
                    </div>

                    {/* Brand Pill Bottom-Left */}
                    <div className="absolute bottom-2.5 left-3 z-10">
                      <span className="text-[11px] font-bold text-white bg-carbon-950/90 px-2 py-0.5 rounded-md border border-carbon-700">
                        {item.brand || 'Studio OEM'}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-white text-sm group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed h-8">
                      {item.description || 'Premium automotive detailing accessory tailored for luxury client vehicles.'}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 font-mono">
                      <span>HSN: {item.hsn_sac_code || '8708'}</span>
                      <span>•</span>
                      <span>GST: {item.tax_rate || 18}%</span>
                      <span>•</span>
                      <span>Warranty: {item.warranty_months}M</span>
                    </div>
                  </div>
                </div>

                {/* Pricing, Margins & Controls */}
                <div className="p-4 pt-3 border-t border-carbon-800/80 bg-carbon-950/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">Selling Price</span>
                      <span className="text-lg font-black text-white font-mono">
                        {formatCurrency(item.selling_price)}
                      </span>
                    </div>

                    {/* Admin sees cost & gross margins; front office sees customer price */}
                    {isAdmin ? (
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block uppercase font-bold">Profit / Margin</span>
                        <span className="text-xs font-black text-emerald-400 font-mono">
                          +{formatCurrency(profitPerUnit)} ({marginPct}%)
                        </span>
                      </div>
                    ) : (
                      <div className="text-right">
                        <span className="text-slate-500 text-[10px] block uppercase font-bold">Bay Status</span>
                        <span className="text-xs font-bold text-cyan-300">
                          Ready for Invoice
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-carbon-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      Alert: <strong>{item.min_stock_alert} units</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/billing/new?accessory_id=${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-black transition-all"
                        title="Add this accessory directly to a new customer invoice"
                      >
                        <Receipt className="w-3 h-3 text-amber-400" />
                        <span>Bill Item</span>
                      </Link>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800 transition-colors"
                        title="Edit Accessory & Photo"
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

      {/* Add / Edit Accessory Modal with Image URL & Preset Gallery */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-carbon-900 border border-carbon-700 rounded-3xl w-full max-w-xl shadow-2xl p-6 sm:p-7 space-y-5 my-8 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {editingItem ? 'Edit Accessory Details & Photo' : 'Add New Car Accessory'}
                  </h3>
                  <span className="text-[10px] text-slate-400">Upload product image and set retail price</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800 text-sm"
              >
                ✕
              </button>
            </div>

            {/* 1-Click Popular Detailing Presets */}
            {!editingItem && (
              <div className="bg-carbon-950 p-3 rounded-2xl border border-carbon-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" /> 1-Click Popular Car Accessory Presets (With HD Photos):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {PRESET_ACCESSORIES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-carbon-900 hover:bg-carbon-800 text-slate-300 hover:text-amber-300 border border-carbon-700/80 transition-all text-left"
                    >
                      {preset.name.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Product Image URL Input with Live Preview */}
              <div className="space-y-2">
                <label className="text-slate-300 font-bold block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Product Image URL (HD Photo)
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">Direct image URL (.jpg / .png / Unsplash)</span>
                </label>

                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or paste image URL"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                    />
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="w-16 h-11 rounded-xl bg-carbon-950 border border-carbon-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {formData.image_url ? (
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Package className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Accessory Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 7D Custom Diamond-Stitch Floor Mats"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-semibold"
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
                <label className="text-slate-300 font-semibold block mb-1">Description & Specifications</label>
                <textarea
                  rows={2}
                  placeholder="Product materials, fitment specifications, key features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Pricing & Stock Details */}
              <div className="p-3.5 bg-carbon-950 rounded-2xl border border-carbon-800 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
                  Pricing, Taxes & Inventory Control
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-carbon-950 font-black shadow-ceramic transition-all transform active:scale-95"
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
