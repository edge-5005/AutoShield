import express from 'express';
import db from '../db.js';

const router = express.Router();

// List all accessories
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM accessories WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR brand LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY is_active DESC, name ASC';
    const accessories = db.query(sql, params);
    res.json(accessories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new accessory
router.post('/', (req, res) => {
  try {
    const {
      name, category, description, hsn_sac_code = '8708',
      tax_rate = 18.0, cost_price = 0, selling_price = 0,
      stock_quantity = 10, min_stock_alert = 3, warranty_months = 12,
      brand = 'Studio OEM', image_url = ''
    } = req.body;

    if (!name || !category || selling_price === undefined) {
      return res.status(400).json({ error: 'Name, Category, and Selling Price are required' });
    }

    const result = db.run(`
      INSERT INTO accessories (name, category, description, hsn_sac_code, tax_rate, cost_price, selling_price, stock_quantity, min_stock_alert, warranty_months, brand, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, category, description || '', hsn_sac_code,
      tax_rate, cost_price, selling_price,
      stock_quantity, min_stock_alert, warranty_months, brand, image_url || ''
    ]);

    const created = db.queryOne('SELECT * FROM accessories WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update accessory
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, category, description, hsn_sac_code,
      tax_rate, cost_price, selling_price,
      stock_quantity, min_stock_alert, warranty_months,
      brand, image_url, is_active
    } = req.body;

    db.run(`
      UPDATE accessories
      SET name = ?, category = ?, description = ?, hsn_sac_code = ?,
          tax_rate = ?, cost_price = ?, selling_price = ?,
          stock_quantity = ?, min_stock_alert = ?, warranty_months = ?,
          brand = ?, image_url = ?, is_active = ?
      WHERE id = ?
    `, [
      name, category, description, hsn_sac_code,
      tax_rate, cost_price, selling_price,
      stock_quantity, min_stock_alert, warranty_months,
      brand, image_url || '', is_active === undefined ? 1 : is_active, id
    ]);

    const updated = db.queryOne('SELECT * FROM accessories WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete accessory
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM accessories WHERE id = ?', [id]);
    res.json({ message: 'Accessory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Restore default catalog
router.post('/reset-defaults', (req, res) => {
  try {
    db.run('DELETE FROM accessories');
    db.run(`
      INSERT INTO accessories (name, category, description, hsn_sac_code, tax_rate, cost_price, selling_price, stock_quantity, min_stock_alert, warranty_months, brand, image_url)
      VALUES
      ('7D Custom Diamond-Stitch Floor Mats', 'Floor Mats & Protection', 'Dual-layer wire coil + waterproof diamond leatherette tailored specifically to vehicle cabin contour.', '8708', 18, 3200, 6499, 12, 3, 24, 'Apex Armour', '/accessories/7d-mats.jpg'),
      ('4K Dual-Channel Dashcam with Hardwired Parking Mode', 'Electronics & Dashcams', 'Front 4K + Rear 1080p, Sony Starvis night vision, supercapacitor, 24-hr G-sensor parking recording.', '8525', 18, 6800, 12999, 8, 2, 12, '70mai / DDPAI Pro', '/accessories/4k-dashcam.jpg'),
      ('Graphene Hydrophobic Top-Up Detailer (500ml)', 'Care & Sprays', 'Spray-on ceramic booster that revives contact angle, gloss, and hydrophobic water-beading on coated surfaces.', '3405', 18, 650, 1499, 35, 8, 24, 'CeramicPro Lab', '/accessories/graphene-spray.jpg'),
      ('1200 GSM Twisted Loop Microfiber Car Drying Towel (60x90cm)', 'Microfiber & Towels', 'Scratch-free edgeless super absorbent towel capable of drying an entire full-size SUV in a single pass without wringing.', '6307', 18, 420, 999, 45, 10, 6, 'PureFiber Ultra', '/accessories/microfiber-towel.jpg'),
      ('German Leather Rejuvenation & Balm Conditioner Kit', 'Interior Luxury', 'pH-neutral foaming leather shampoo, restorative lanolin balm conditioner, and horsehair bristle cleaning brush.', '3405', 18, 950, 2199, 16, 4, 12, 'KochChemie / Colourlock', '/accessories/leather-kit.jpg'),
      ('Solar Alloy Rotary Car Perfume & Aromatherapy Diffuser', 'Interior Luxury', 'Machined aircraft-grade aluminum alloy with solar-powered turbine bearing and organic essential scent ring.', '3307', 18, 550, 1299, 22, 5, 6, 'Zenith Drive', '/accessories/solar-diffuser.jpg'),
      ('Self-Healing TPU Door Edge & Cup Guard Kit (8 Pcs)', 'Floor Mats & Protection', 'Pre-cut 200-micron optical TPU protection film to prevent ring scratches in door cups and parking wall chips.', '3919', 18, 600, 1499, 20, 5, 36, 'Apex Shield TPU', '/accessories/tpu-door-guards.jpg'),
      ('Custom Magnetic Snap-On Window Sunshades (Set of 4)', 'Floor Mats & Protection', 'High-density laser-measured heat and UV blocking mesh curtains with magnetic window frame snaps.', '8708', 18, 900, 1999, 14, 3, 12, 'AutoShade Pro', '/accessories/magnetic-sunshades.jpg'),
      ('15W MagSafe Auto-Clamping Fast Wireless Car Charger', 'Electronics & Dashcams', 'Smart infrared motorized grip, Qi fast-charging certification, and anti-vibration air vent hook.', '8504', 18, 1100, 2499, 18, 4, 12, 'Anker / Baseus Turbo', '/accessories/magsafe-charger.jpg'),
      ('Carbon Fiber Protective Key Fob Shell Case', 'Interior Luxury', 'Real twill weave look lightweight ABS shell protecting key remote from accidental drops and scuffs.', '3926', 18, 350, 899, 28, 6, 12, 'Apex Carbon', '/accessories/carbon-keyfob.jpg');
    `);
    const refreshed = db.query('SELECT * FROM accessories ORDER BY name ASC');
    res.json({ message: 'Default accessories catalog restored successfully', accessories: refreshed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
