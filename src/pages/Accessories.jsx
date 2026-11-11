import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, Plus, Search, Edit3, Trash2, RefreshCw, 
  ShieldCheck, AlertTriangle, CheckCircle, ArrowUpDown, Tag, Box,
  Image as ImageIcon, Sparkles, ExternalLink, Receipt, FolderPlus,
  Layers, Check, ChevronRight, SlidersHorizontal, LayoutGrid, ListFilter
} from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CATEGORIES = [
  'Floor Mats & Protection',
  'Electronics & Dashcams',
  'Care & Sprays',
  'Microfiber & Towels',
  'Interior Luxury'
];

const DEFAULT_BRANDS = [
  'Apex Armour',
  '70mai / DDPAI Pro',
  'CeramicPro Lab',
  'PureFiber Ultra',
  'KochChemie / Colourlock',
  'Zenith Drive',
  'Apex Shield TPU',
  'AutoShade Pro',
  'Anker / Baseus Turbo',
  'Apex Carbon',
  '3M Professional',
  'Meguiar\'s',
  'Garware Hi-Tech',
  'Studio OEM'
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
  
  // Sorting & View Mode
  const [sortBy, setSortBy] = useState('name_asc');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'grid'

  // Custom Categories & Brands (persisted in localStorage)
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('autoshield_custom_categories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [customBrands, setCustomBrands] = useState(() => {
    try {
      const saved = localStorage.getItem('autoshield_custom_brands');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Quick New Category Modal from toolbar
  const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
  const [standaloneCatInput, setStandaloneCatInput] = useState('');

  // 3-Step Selection / Creation state inside Add Accessory Modal
  const [categoryMode, setCategoryMode] = useState('select'); // 'select' | 'create'
  const [newCategoryName, setNewCategoryName] = useState('');

  const [brandMode, setBrandMode] = useState('select'); // 'select' | 'create'
  const [newBrandName, setNewBrandName] = useState('');

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
    brand: 'Apex Armour',
    image_url: ''
  });

  // Load accessories from API
  useEffect(() => {
    loadAccessories();
  }, [selectedCategory, searchQuery]);

  const loadAccessories = async () => {
    try {
      setLoading(true);
      const data = await api.getAccessories(selectedCategory === 'All' ? 'all' : selectedCategory, searchQuery);
      setAccessories(data || []);
    } catch (err) {
      console.error('Error loading accessories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derive all active categories (Defaults + DB categories + Custom)
  const allCategories = useMemo(() => {
    const set = new Set(DEFAULT_CATEGORIES);
    accessories.forEach(a => {
      if (a.category && a.category.trim()) set.add(a.category.trim());
    });
    customCategories.forEach(c => {
      if (c && c.trim()) set.add(c.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [accessories, customCategories]);

  // Derive all active brands (Defaults + DB brands + Custom)
  const allBrands = useMemo(() => {
    const set = new Set(DEFAULT_BRANDS);
    accessories.forEach(a => {
      if (a.brand && a.brand.trim()) set.add(a.brand.trim());
    });
    customBrands.forEach(b => {
      if (b && b.trim()) set.add(b.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [accessories, customBrands]);

  // Persist custom categories and brands to localStorage
  const saveCustomCategory = (catName) => {
    const trimmed = catName.trim();
    if (!trimmed) return;
    if (!customCategories.includes(trimmed)) {
      const updated = [...customCategories, trimmed];
      setCustomCategories(updated);
      try { localStorage.setItem('autoshield_custom_categories', JSON.stringify(updated)); } catch (e) {}
    }
  };

  const saveCustomBrand = (brandName) => {
    const trimmed = brandName.trim();
    if (!trimmed) return;
    if (!customBrands.includes(trimmed)) {
      const updated = [...customBrands, trimmed];
      setCustomBrands(updated);
      try { localStorage.setItem('autoshield_custom_brands', JSON.stringify(updated)); } catch (e) {}
    }
  };

  // Sort comparator function
  const sortAccessories = (items) => {
    return [...items].sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price_asc') return (a.selling_price || 0) - (b.selling_price || 0);
      if (sortBy === 'price_desc') return (b.selling_price || 0) - (a.selling_price || 0);
      if (sortBy === 'stock_desc') return (b.stock_quantity || 0) - (a.stock_quantity || 0);
      if (sortBy === 'stock_asc') return (a.stock_quantity || 0) - (b.stock_quantity || 0);
      if (sortBy === 'margin_desc') {
        const marginA = a.selling_price > 0 ? ((a.selling_price - a.cost_price) / a.selling_price) : 0;
        const marginB = b.selling_price > 0 ? ((b.selling_price - b.cost_price) / b.selling_price) : 0;
        return marginB - marginA;
      }
      return 0;
    });
  };

  // Grouped products inside each category
  const categorizedProducts = useMemo(() => {
    // If a specific category is selected, only group that one
    const categoriesToGroup = selectedCategory === 'All' ? allCategories : [selectedCategory];
    const grouped = {};

    categoriesToGroup.forEach(cat => {
      const itemsInCat = accessories.filter(a => a.category === cat);
      grouped[cat] = sortAccessories(itemsInCat);
    });

    // Also collect any uncategorized or custom category items that might exist
    const otherItems = accessories.filter(a => !categoriesToGroup.includes(a.category));
    if (otherItems.length > 0 && selectedCategory === 'All') {
      grouped['Other Accessories'] = sortAccessories(otherItems);
    }

    return grouped;
  }, [accessories, allCategories, selectedCategory, sortBy]);

  // Flat sorted accessories for grid view
  const flatSortedAccessories = useMemo(() => {
    return sortAccessories(accessories);
  }, [accessories, sortBy]);

  // Open Create Modal
  const handleOpenCreate = (presetCategory = null) => {
    setEditingItem(null);
    setCategoryMode('select');
    setBrandMode('select');
    setNewCategoryName('');
    setNewBrandName('');

    const initialCategory = presetCategory || (selectedCategory !== 'All' ? selectedCategory : (allCategories[0] || 'Floor Mats & Protection'));
    const initialBrand = allBrands[0] || 'Studio OEM';

    setFormData({
      name: '',
      category: initialCategory,
      brand: initialBrand,
      description: '',
      hsn_sac_code: '8708',
      tax_rate: 18,
      cost_price: 1500,
      selling_price: 3499,
      stock_quantity: 10,
      min_stock_alert: 3,
      warranty_months: 12,
      image_url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80'
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setCategoryMode('select');
    setBrandMode('select');
    setNewCategoryName('');
    setNewBrandName('');

    setFormData({
      name: item.name,
      category: item.category || (allCategories[0] || 'Floor Mats & Protection'),
      brand: item.brand || (allBrands[0] || 'Studio OEM'),
      description: item.description || '',
      hsn_sac_code: item.hsn_sac_code || '8708',
      tax_rate: item.tax_rate || 18,
      cost_price: item.cost_price || 0,
      selling_price: item.selling_price || 0,
      stock_quantity: item.stock_quantity || 0,
      min_stock_alert: item.min_stock_alert || 3,
      warranty_months: item.warranty_months || 0,
      image_url: item.image_url || ''
    });
    setIsModalOpen(true);
  };

  // 1-Click Preset
  const handleApplyPreset = (preset) => {
    saveCustomCategory(preset.category);
    saveCustomBrand(preset.brand);
    setCategoryMode('select');
    setBrandMode('select');
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

  // Add new category inside modal
  const handleApplyNewCategory = (e) => {
    e?.preventDefault();
    if (!newCategoryName.trim()) return;
    const cat = newCategoryName.trim();
    saveCustomCategory(cat);
    setFormData(prev => ({ ...prev, category: cat }));
    setCategoryMode('select');
    setNewCategoryName('');
  };

  // Add new brand inside modal
  const handleApplyNewBrand = (e) => {
    e?.preventDefault();
    if (!newBrandName.trim()) return;
    const br = newBrandName.trim();
    saveCustomBrand(br);
    setFormData(prev => ({ ...prev, brand: br }));
    setBrandMode('select');
    setNewBrandName('');
  };

  // Create Standalone Category from Toolbar
  const handleCreateStandaloneCategory = (e) => {
    e.preventDefault();
    if (!standaloneCatInput.trim()) return;
    const cat = standaloneCatInput.trim();
    saveCustomCategory(cat);
    setSelectedCategory(cat);
    setStandaloneCatInput('');
    setIsQuickCatModalOpen(false);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Save category and brand if custom entered
    if (categoryMode === 'create' && newCategoryName.trim()) {
      saveCustomCategory(newCategoryName.trim());
      formData.category = newCategoryName.trim();
    } else {
      saveCustomCategory(formData.category);
    }

    if (brandMode === 'create' && newBrandName.trim()) {
      saveCustomBrand(newBrandName.trim());
      formData.brand = newBrandName.trim();
    } else {
      saveCustomBrand(formData.brand);
    }

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

  // Delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this accessory?')) return;
    try {
      await api.deleteAccessory(id);
      loadAccessories();
    } catch (err) {
      alert('Error deleting accessory');
    }
  };

  // Reset default accessories
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

  // Profit calculation for active modal form
  const modalProfit = (formData.selling_price || 0) - (formData.cost_price || 0);
  const modalMarginPct = formData.selling_price > 0 ? ((modalProfit / formData.selling_price) * 100).toFixed(1) : 0;

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
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <Package className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
            <span>Car Accessories & Merchandise</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Group and sort accessories inside categories. Add new products with structured Category ➔ Brand ➔ Product creation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setIsQuickCatModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-carbon-850 hover:bg-carbon-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all touch-press"
            title="Create a new accessory category"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ New Category</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-slate-300 hover:text-white border border-carbon-700 text-xs font-semibold transition-all touch-press"
            title="Restore default catalog with photography"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Reload Pre-Set Catalog</span>
          </button>

          <button
            onClick={() => handleOpenCreate()}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 font-black text-xs shadow-ceramic transition-all transform active:scale-95 touch-press"
          >
            <Plus className="w-4 h-4 text-carbon-950 stroke-[3]" />
            <span>Add New Accessory</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-3.5 sm:p-4 shadow-carbon">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Products</span>
          <p className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">{totalItems}</p>
          <span className="text-[10px] text-slate-500">Across {allCategories.length} categories</span>
        </div>

        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-3.5 sm:p-4 shadow-carbon">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Ready in Stock</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 font-mono">{inStockCount}</p>
          <span className="text-[10px] text-emerald-400/80">Available for walk-in billing</span>
        </div>

        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-3.5 sm:p-4 shadow-carbon">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Low Stock Alert</span>
          <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1 font-mono">{lowStockCount}</p>
          <span className="text-[10px] text-amber-400/80">Re-order from vendor</span>
        </div>

        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-3.5 sm:p-4 shadow-carbon">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            {isAdmin ? 'Total Inventory Capital' : 'Product Lineup'}
          </span>
          <p className="text-xl sm:text-2xl font-black text-cyan-400 mt-1 font-mono truncate">
            {isAdmin ? formatCurrency(totalStockValue) : `${totalItems} Items`}
          </p>
          <span className="text-[10px] text-slate-500 truncate block">
            {isAdmin ? 'Wholesale acquisition cost' : 'Certified Detailing Grade'}
          </span>
        </div>
      </div>

      {/* Filters, Categories & Sorting Toolbar */}
      <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-3.5 space-y-3 shadow-carbon">
        {/* Row 1: Dynamic Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all touch-press ${
              selectedCategory === 'All'
                ? 'bg-amber-500 text-carbon-950 shadow-ceramic font-black'
                : 'bg-carbon-950 text-slate-400 hover:text-white hover:bg-carbon-800 border border-carbon-800'
            }`}
          >
            All Categories ({totalItems})
          </button>

          {allCategories.map(cat => {
            const count = accessories.filter(a => a.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 touch-press ${
                  isSelected
                    ? 'bg-amber-500 text-carbon-950 shadow-ceramic font-black'
                    : 'bg-carbon-950 text-slate-400 hover:text-white hover:bg-carbon-800 border border-carbon-800'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-carbon-950 text-amber-300' : 'bg-carbon-900 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setIsQuickCatModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-400/90 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-dashed border-amber-500/30 whitespace-nowrap transition-all flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Row 2: Search, Sort Controls & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-carbon-800/80">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by product name, brand, or specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-carbon-950 border border-carbon-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-carbon-950 border border-carbon-700/80 rounded-xl px-2.5 py-1.5 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 text-[11px] hidden md:inline">Sort Inside Categories:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="name_asc" className="bg-carbon-900 text-white">Product Name (A → Z)</option>
                <option value="name_desc" className="bg-carbon-900 text-white">Product Name (Z → A)</option>
                <option value="price_asc" className="bg-carbon-900 text-white">Price: Low to High</option>
                <option value="price_desc" className="bg-carbon-900 text-white">Price: High to Low</option>
                <option value="stock_desc" className="bg-carbon-900 text-white">Stock: High to Low</option>
                <option value="stock_asc" className="bg-carbon-900 text-white">Stock: Low to High (Alerts)</option>
                <option value="margin_desc" className="bg-carbon-900 text-white">Profit Margin: High to Low</option>
              </select>
            </div>

            {/* View Mode Toggle (Grouped sections vs Grid) */}
            {selectedCategory === 'All' && (
              <div className="flex items-center bg-carbon-950 border border-carbon-800 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grouped')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    viewMode === 'grouped'
                      ? 'bg-amber-500 text-carbon-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grouped by Category Sections"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    viewMode === 'grid'
                      ? 'bg-amber-500 text-carbon-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Unified Flat Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area: Products Sorted Inside Categories */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-semibold">Loading and sorting accessories...</p>
        </div>
      ) : accessories.length === 0 ? (
        <div className="bg-carbon-900 border border-carbon-800 rounded-2xl p-12 text-center shadow-carbon">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Accessories Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {searchQuery
              ? `No products matched "${searchQuery}". Try a different keyword or reset filters.`
              : 'There are currently no products in this category. You can add one or reload standard presets.'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => handleOpenCreate(selectedCategory !== 'All' ? selectedCategory : null)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-carbon-950 font-black text-xs shadow-ceramic"
            >
              + Add Product to {selectedCategory !== 'All' ? selectedCategory : 'Catalog'}
            </button>
            <button
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-xl bg-carbon-800 hover:bg-carbon-750 text-slate-300 font-bold text-xs"
            >
              Reload 10 Detailing Presets
            </button>
          </div>
        </div>
      ) : (selectedCategory === 'All' && viewMode === 'grouped') ? (
        /* ================= GROUPED BY CATEGORY VIEW ================= */
        <div className="space-y-8">
          {Object.entries(categorizedProducts).map(([catName, items]) => {
            if (items.length === 0) return null;
            const catInStock = items.filter(i => i.stock_quantity > 0).length;
            const catValue = items.reduce((sum, i) => sum + ((i.cost_price || 0) * (i.stock_quantity || 0)), 0);

            return (
              <div key={catName} className="space-y-3.5 bg-carbon-950/40 p-4 sm:p-5 rounded-2xl border border-carbon-850">
                {/* Category Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-carbon-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                        <span>{catName}</span>
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                          {items.length} {items.length === 1 ? 'item' : 'items'}
                        </span>
                      </h2>
                      <span className="text-[11px] text-slate-400">
                        {catInStock} in stock {isAdmin && `• ${formatCurrency(catValue)} capital`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenCreate(catName)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-carbon-900 hover:bg-carbon-850 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all touch-press"
                    >
                      <Plus className="w-3 h-3 text-amber-400" />
                      <span>Add to {catName.split(' ')[0]}</span>
                    </button>

                    <button
                      onClick={() => setSelectedCategory(catName)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-white text-xs hover:bg-carbon-850 transition-colors"
                    >
                      <span>Focus</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Sorted Products in this Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {items.map((item) => renderProductCard(item))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= FLAT GRID / SINGLE CATEGORY VIEW ================= */
        <div className="space-y-4">
          {selectedCategory !== 'All' && (
            <div className="flex items-center justify-between bg-carbon-900 p-3 rounded-xl border border-carbon-800">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Viewing: {selectedCategory}</span>
                <span className="text-xs text-slate-400 font-mono">({flatSortedAccessories.length} items sorted)</span>
              </div>
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300"
              >
                Clear Category Filter ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {flatSortedAccessories.map((item) => renderProductCard(item))}
          </div>
        </div>
      )}

      {/* Quick Standalone Category Creator Modal */}
      {isQuickCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-carbon-900 border border-carbon-700 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-carbon-800">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-sm">Create New Accessory Category</h3>
              </div>
              <button
                onClick={() => setIsQuickCatModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStandaloneCategory} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PPF Rolls & Films, Ceramic Coatings, Exhaust & Performance..."
                  value={standaloneCatInput}
                  onChange={(e) => setStandaloneCatInput(e.target.value)}
                  className="w-full bg-carbon-950 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              {/* Popular Category Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 block font-semibold">Quick Suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Ceramic & Graphene Coatings', 'Window Sun Films', 'Exhaust & Performance', 'Air Fresheners & Scent', 'Wheel & Tire Armor', 'Underbody Coatings'].map((suggested) => (
                    <button
                      type="button"
                      key={suggested}
                      onClick={() => setStandaloneCatInput(suggested)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-carbon-950 hover:bg-carbon-800 text-slate-300 hover:text-amber-300 border border-carbon-800 transition-all"
                    >
                      + {suggested}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCatModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-carbon-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-carbon-950 font-black shadow-ceramic transition-all"
                >
                  Create & Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD / EDIT ACCESSORY MODAL ================= */}
      {/* Sequenced Hierarchy: 1. Category -> 2. Brand -> 3. Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-carbon-900 border border-carbon-700 rounded-3xl w-full max-w-xl shadow-2xl p-5 sm:p-7 space-y-5 my-8 text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-carbon-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {editingItem ? 'Edit Accessory Details & Photo' : 'Add New Car Accessory'}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Step 1: Category ➔ Step 2: Brand ➔ Step 3: Product Details
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Visual Step Indicator Banner */}
            <div className="grid grid-cols-3 gap-1.5 bg-carbon-950 p-2 rounded-xl border border-carbon-800 text-[11px] font-bold text-center">
              <div className={`p-1.5 rounded-lg flex items-center justify-center gap-1.5 ${
                formData.category ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'text-slate-500'
              }`}>
                <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-400">1</span>
                <span>Category</span>
              </div>

              <div className={`p-1.5 rounded-lg flex items-center justify-center gap-1.5 ${
                formData.brand ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'text-slate-500'
              }`}>
                <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-400">2</span>
                <span>Brand</span>
              </div>

              <div className={`p-1.5 rounded-lg flex items-center justify-center gap-1.5 ${
                formData.name ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'text-slate-500'
              }`}>
                <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-400">3</span>
                <span>Product</span>
              </div>
            </div>

            {/* 1-Click Detailing Presets */}
            {!editingItem && (
              <div className="bg-carbon-950 p-3 rounded-2xl border border-carbon-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" /> 1-Click Popular Car Accessory Presets:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {PRESET_ACCESSORIES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold bg-carbon-900 hover:bg-carbon-800 text-slate-300 hover:text-amber-300 border border-carbon-700/80 transition-all text-left"
                    >
                      {preset.name.split('(')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* ================= STEP 1: CATEGORY (SELECT OR CREATE) ================= */}
              <div className="p-3.5 bg-carbon-950 rounded-2xl border border-carbon-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-amber-500 text-carbon-950 font-black flex items-center justify-center text-xs">
                      1
                    </span>
                    <label className="text-white font-black text-xs uppercase tracking-wider">
                      Select or Create Category *
                    </label>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center bg-carbon-900 rounded-lg p-0.5 border border-carbon-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCategoryMode('select')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        categoryMode === 'select'
                          ? 'bg-amber-500 text-carbon-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Select Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryMode('create')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        categoryMode === 'create'
                          ? 'bg-amber-500 text-carbon-950 shadow-sm'
                          : 'text-amber-400/90 hover:text-amber-300'
                      }`}
                    >
                      + Create New
                    </button>
                  </div>
                </div>

                {categoryMode === 'select' ? (
                  <div className="space-y-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-semibold"
                    >
                      {allCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    {/* Quick Category Chips */}
                    <div className="flex flex-wrap gap-1">
                      {allCategories.slice(0, 6).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                            formData.category === cat
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-carbon-900 text-slate-400 border-carbon-800 hover:text-white'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Enter new category name (e.g. PPF Films, LED Lighting, Exhaust)..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 bg-carbon-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyNewCategory}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-carbon-950 font-bold text-xs shrink-0 shadow-sm"
                    >
                      Use Category
                    </button>
                  </div>
                )}
              </div>

              {/* ================= STEP 2: BRAND (SELECT OR CREATE) ================= */}
              <div className="p-3.5 bg-carbon-950 rounded-2xl border border-carbon-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-amber-500 text-carbon-950 font-black flex items-center justify-center text-xs">
                      2
                    </span>
                    <label className="text-white font-black text-xs uppercase tracking-wider">
                      Select or Create Brand / Vendor *
                    </label>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center bg-carbon-900 rounded-lg p-0.5 border border-carbon-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setBrandMode('select')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        brandMode === 'select'
                          ? 'bg-amber-500 text-carbon-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Select Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrandMode('create')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                        brandMode === 'create'
                          ? 'bg-amber-500 text-carbon-950 shadow-sm'
                          : 'text-amber-400/90 hover:text-amber-300'
                      }`}
                    >
                      + Create New
                    </button>
                  </div>
                </div>

                {brandMode === 'select' ? (
                  <div className="space-y-2">
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-carbon-900 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-semibold"
                    >
                      {allBrands.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>

                    {/* Quick Brand Chips */}
                    <div className="flex flex-wrap gap-1">
                      {allBrands.slice(0, 7).map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setFormData({ ...formData, brand: b })}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                            formData.brand === b
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-carbon-900 text-slate-400 border-carbon-800 hover:text-white'
                          }`}
                        >
                          {b.split('/')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Enter brand name (e.g. 3M Professional, Meguiar's, Pioneer)..."
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      className="flex-1 bg-carbon-900 border border-amber-500/50 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-semibold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyNewBrand}
                      className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-carbon-950 font-bold text-xs shrink-0 shadow-sm"
                    >
                      Set Brand
                    </button>
                  </div>
                )}
              </div>

              {/* ================= STEP 3: PRODUCT DETAILS & PRICING ================= */}
              <div className="p-3.5 bg-carbon-950 rounded-2xl border border-carbon-800 space-y-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-amber-500 text-carbon-950 font-black flex items-center justify-center text-xs">
                    3
                  </span>
                  <label className="text-white font-black text-xs uppercase tracking-wider">
                    Product Information & Pricing
                  </label>
                </div>

                {/* Product Name */}
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Product Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 7D Custom Diamond-Stitch Floor Mats"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-carbon-900 border border-carbon-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-semibold"
                  />
                </div>

                {/* Product Image URL with Live Thumbnail */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" /> Product Image URL (HD Photo)
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Direct .jpg / .png / Unsplash link</span>
                  </label>

                  <div className="flex gap-2.5 items-center">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or paste image URL"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="flex-1 bg-carbon-900 border border-carbon-700 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                    />

                    {/* Thumbnail Preview */}
                    <div className="w-14 h-10 rounded-xl bg-carbon-900 border border-carbon-700 overflow-hidden shrink-0 flex items-center justify-center">
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

                {/* Description */}
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Description & Specifications</label>
                  <textarea
                    rows={2}
                    placeholder="Fitment details, materials, warranty, or key features..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-carbon-900 border border-carbon-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                {/* Pricing, Tax & Inventory Numbers */}
                <div className="space-y-2 pt-1 border-t border-carbon-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                      Pricing & Stock Values
                    </span>

                    {/* Live Margin Badge */}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border font-mono ${
                      modalProfit >= 0
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}>
                      Profit: ₹{modalProfit} ({modalMarginPct}% Gross Margin)
                    </span>
                  </div>

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
                      <label className="text-slate-400 text-[11px] block mb-0.5">Min Stock Alert</label>
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
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-carbon-800 text-slate-300 font-semibold touch-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-carbon-950 font-black shadow-ceramic transition-all transform active:scale-95 touch-press"
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

  // Helper renderer for each accessory product card
  function renderProductCard(item) {
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
          {/* Product Image Banner */}
          <div className="relative w-full h-44 sm:h-48 bg-carbon-950 overflow-hidden select-none">
            <img 
              src={displayImage} 
              alt={item.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = fallbackImage;
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-carbon-900 via-transparent to-black/40"></div>

            {/* Category & Brand Badges */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-carbon-950/85 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-md">
                {item.category}
              </span>

              {item.brand && (
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/75 backdrop-blur-md text-slate-200 border border-carbon-700">
                  {item.brand}
                </span>
              )}
            </div>

            {/* Stock Status Badge */}
            <div className="absolute bottom-2.5 right-2.5">
              {isOutOfStock ? (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-rose-500/90 text-white backdrop-blur-sm border border-rose-400">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-amber-500/90 text-carbon-950 backdrop-blur-sm border border-amber-400 animate-pulse">
                  Low Stock ({item.stock_quantity})
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-emerald-500/90 text-white backdrop-blur-sm border border-emerald-400">
                  {item.stock_quantity} in stock
                </span>
              )}
            </div>
          </div>

          {/* Product Info Body */}
          <div className="p-4 space-y-2.5">
            <div>
              <h3 className="font-extrabold text-white text-sm line-clamp-1 group-hover:text-amber-400 transition-colors">
                {item.name}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {item.description || 'Premium automotive detailing accessory.'}
              </p>
            </div>

            {/* Pricing Matrix */}
            <div className="bg-carbon-950/70 p-2.5 rounded-xl border border-carbon-800 space-y-1.5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Retail Price</span>
                  <span className="text-base font-black text-white font-mono">
                    {formatCurrency(item.selling_price)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    +{marginPct}% Gross Margin
                  </span>
                  {isAdmin && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Cost: {formatCurrency(item.cost_price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Warranty and HSN */}
              <div className="pt-1 border-t border-carbon-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>{item.warranty_months ? `${item.warranty_months}-Mo Warranty` : 'Standard'}</span>
                </span>
                <span className="font-mono text-slate-500">
                  HSN {item.hsn_sac_code || '8708'} ({item.tax_rate || 18}% GST)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 pt-0">
          <div className="pt-2.5 border-t border-carbon-800/80 flex items-center justify-between gap-2">
            <span className="text-[10px] text-slate-400">
              Alert at: <strong>{item.min_stock_alert || 3} units</strong>
            </span>

            <div className="flex items-center gap-1.5">
              <Link
                to={`/billing/new?accessory_id=${item.id}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-black transition-all touch-press"
                title="Add this accessory directly to a new customer invoice"
              >
                <Receipt className="w-3 h-3 text-amber-400" />
                <span>Bill Item</span>
              </Link>

              <button
                onClick={() => handleOpenEdit(item)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800 transition-colors touch-press"
                title="Edit Accessory Details"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors touch-press"
                title="Delete Accessory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
