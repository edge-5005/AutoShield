import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

// Candidate paths for bundled database
const possibleBundledPaths = [
  path.join(__dirname, 'data', 'detailing.db'),
  path.join(process.cwd(), 'server', 'data', 'detailing.db'),
  path.resolve('/var/task', 'server', 'data', 'detailing.db'),
];

let bundledDbPath = null;
for (const p of possibleBundledPaths) {
  if (fs.existsSync(p)) {
    bundledDbPath = p;
    break;
  }
}

const dataDir = isVercel ? '/tmp' : path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'detailing.db');

if (!isVercel && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In Vercel serverless environment, copy the pre-seeded SQLite DB into /tmp
if (isVercel && !fs.existsSync(dbPath) && bundledDbPath) {
  try {
    fs.copyFileSync(bundledDbPath, dbPath);
  } catch (err) {
    console.error('Failed to copy bundled db to /tmp:', err);
  }
}

let db = null;
let SQL = null;

// Find sql-wasm.wasm
const possibleWasmPaths = [
  path.resolve(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
  path.resolve(process.cwd(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
  path.resolve('/var/task', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
];

let wasmBinary = null;
for (const p of possibleWasmPaths) {
  if (fs.existsSync(p)) {
    try {
      wasmBinary = fs.readFileSync(p);
      break;
    } catch (e) {
      // ignore
    }
  }
}

export async function initDb() {
  if (db) return db;

  const options = wasmBinary ? { wasmBinary } : {};
  SQL = await initSqlJs(options);

  if (fs.existsSync(dbPath)) {
    try {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Failed to read existing DB, creating new:', e.message);
      db = new SQL.Database();
    }
  } else if (bundledDbPath) {
    try {
      const fileBuffer = fs.readFileSync(bundledDbPath);
      db = new SQL.Database(fileBuffer);
    } catch (e) {
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
  }

  createSchema();
  try {
    db.run("ALTER TABLE settings ADD COLUMN rc_api_key TEXT DEFAULT ''");
  } catch (e) {
    // Column already exists
  }
  seedInitialData();
  saveDb();
  return db;
}

export function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      studio_name TEXT DEFAULT 'Apex Auto Detailing Studio',
      tagline TEXT DEFAULT 'Precision Paint Protection & Ceramic Studio',
      phone TEXT DEFAULT '+91 98765 43210',
      email TEXT DEFAULT 'contact@apexdetailing.com',
      address TEXT DEFAULT 'Plot 42, Auto Hub Road, Industrial Area, Bangalore, Karnataka - 560068',
      gstin TEXT DEFAULT '29AABCA1234D1Z5',
      state_code TEXT DEFAULT '29',
      state_name TEXT DEFAULT 'Karnataka',
      bank_name TEXT DEFAULT 'HDFC Bank Ltd',
      account_number TEXT DEFAULT '50200012345678',
      ifsc_code TEXT DEFAULT 'HDFC0001234',
      branch TEXT DEFAULT 'Indiranagar',
      upi_id TEXT DEFAULT 'apexautostudio@hdfcbank',
      rc_api_key TEXT DEFAULT '',
      terms_conditions TEXT DEFAULT '1. Warranty valid only with prescribed periodic maintenance washes. 2. Please avoid high-pressure wash directly on film edges for 7 days post-PPF. 3. Vehicle delivered only after full payment settlement.'
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      gstin TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      reg_number TEXT NOT NULL UNIQUE,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year TEXT,
      color TEXT,
      paint_type TEXT DEFAULT 'Metallic',
      segment TEXT NOT NULL DEFAULT 'SUV',
      vin TEXT,
      odometer TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      sac_code TEXT DEFAULT '9987',
      tax_rate REAL DEFAULT 18.0,
      warranty_months INTEGER DEFAULT 0,
      price_hatchback REAL DEFAULT 0,
      price_sedan REAL DEFAULT 0,
      price_suv REAL DEFAULT 0,
      price_luxury REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS job_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_number TEXT UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
      status TEXT DEFAULT 'received',
      assigned_tech TEXT,
      fuel_level TEXT DEFAULT '50%',
      odometer TEXT,
      inspection_notes TEXT,
      services_selected TEXT,
      estimated_delivery TEXT,
      actual_delivery TEXT,
      total_estimated REAL DEFAULT 0,
      advance_amount REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      invoice_date TEXT NOT NULL,
      job_card_id INTEGER REFERENCES job_cards(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
      type TEXT DEFAULT 'tax_invoice',
      items TEXT NOT NULL,
      subtotal REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      cgst_amount REAL DEFAULT 0,
      sgst_amount REAL DEFAULT 0,
      igst_amount REAL DEFAULT 0,
      is_interstate INTEGER DEFAULT 0,
      discount REAL DEFAULT 0,
      grand_total REAL DEFAULT 0,
      advance_paid REAL DEFAULT 0,
      balance_due REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'unpaid',
      payment_mode TEXT DEFAULT 'UPI',
      payment_ref TEXT,
      notes TEXT,
      terms TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS warranties_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
      invoice_id INTEGER REFERENCES invoices(id),
      title TEXT NOT NULL,
      service_type TEXT,
      warranty_expiry TEXT,
      next_followup_date TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS accessories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      hsn_sac_code TEXT DEFAULT '8708',
      tax_rate REAL DEFAULT 18.0,
      cost_price REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      stock_quantity INTEGER DEFAULT 10,
      min_stock_alert INTEGER DEFAULT 3,
      warranty_months INTEGER DEFAULT 12,
      brand TEXT DEFAULT 'Studio OEM',
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_name TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      target_audience TEXT,
      featured_service TEXT,
      daily_budget REAL DEFAULT 500,
      total_spend REAL DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      leads_generated INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      revenue_generated REAL DEFAULT 0,
      ad_copy TEXT,
      cta_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      payment_mode TEXT DEFAULT 'Bank Transfer',
      vendor_name TEXT,
      receipt_ref TEXT,
      notes TEXT,
      is_recurring INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedInitialData() {
  // Check settings
  const checkSettings = db.exec("SELECT COUNT(*) as count FROM settings");
  const settingsCount = checkSettings[0]?.values[0]?.[0] || 0;
  if (settingsCount === 0) {
    db.run(`
      INSERT INTO settings (id, studio_name, tagline, phone, email, address, gstin, state_code, state_name, bank_name, account_number, ifsc_code, branch, upi_id)
      VALUES (1, 'Apex Auto Detailing & PPF Studio', 'Premium Paint Correction, Ceramic Coating & Self-Healing PPF', '+91 98765 43210', 'info@apexautodetailing.in', 'Plot 108, Outer Ring Road, Near Marathahalli, Bangalore, Karnataka - 560037', '29AABCA1234D1Z5', '29', 'Karnataka', 'HDFC Bank Ltd', '50200088991122', 'HDFC0001824', 'Outer Ring Road', 'apexautostudio@hdfcbank');
    `);
  }

  // Check services
  const checkServices = db.exec("SELECT COUNT(*) as count FROM services");
  const servicesCount = checkServices[0]?.values[0]?.[0] || 0;
  if (servicesCount === 0) {
    const servicesList = [
      {
        name: 'Ceramic Coating 9H (3-Year Warranty)',
        category: 'Ceramic Coating',
        description: 'Multi-layer 9H Japanese ceramic coating with 3-stage paint correction, swirl removal, and 6-month free top-ups.',
        sac_code: '9987',
        tax_rate: 18,
        warranty_months: 36,
        hatchback: 18000,
        sedan: 22000,
        suv: 26000,
        luxury: 32000
      },
      {
        name: 'Graphene Matrix Coating 10H (5-Year Warranty)',
        category: 'Ceramic Coating',
        description: 'Military-grade graphene dispersion providing extreme slickness, high heat dissipation, water-spot resistance, and deep gloss.',
        sac_code: '9987',
        tax_rate: 18,
        warranty_months: 60,
        hatchback: 28000,
        sedan: 34000,
        suv: 42000,
        luxury: 52000
      },
      {
        name: 'Full Body Paint Protection Film (TPU Self-Healing)',
        category: 'PPF',
        description: '185-micron hydrophobic, non-yellowing thermoplastic polyurethane (TPU) film with instant heat self-healing & 5-year replacement warranty.',
        sac_code: '9987',
        tax_rate: 18,
        warranty_months: 60,
        hatchback: 85000,
        sedan: 105000,
        suv: 125000,
        luxury: 155000
      },
      {
        name: 'Front Track PPF Package',
        category: 'PPF',
        description: 'Covers Front Bumper, Full Hood, Front Fenders, Headlights & ORVMs to stop stone chips and highway debris.',
        sac_code: '9987',
        tax_rate: 18,
        warranty_months: 60,
        hatchback: 35000,
        sedan: 42000,
        suv: 48000,
        luxury: 60000
      },
      {
        name: 'Interior Deep Spa & Leather Rejuvenation',
        category: 'Interior',
        description: 'High-temp steam sterilization, roof liner dry-clean, carpet extraction, leather scrubbing & conditioning, AC duct ozone treatment.',
        sac_code: '9987',
        tax_rate: 18,
        warranty_months: 0,
        hatchback: 3500,
        sedan: 4500,
        suv: 5500,
        luxury: 7000
      },
      {
        name: '3-Stage Paint Correction & Gloss Enhancement',
        category: 'Paint Correction',
        description: 'Heavy compound cutting, medium swirl polish, and micro-finishing jeweling polish to restore clear coat depth.',
        sac_code: '9987',
        tax_rate: 18,
        warranty_months: 0,
        hatchback: 7000,
        sedan: 8500,
        suv: 10500,
        luxury: 14000
      },
      {
        name: 'Full Glass Hydrophobic Ceramic Shield',
        category: 'Addon',
        description: 'All glass polishing and 12-month ceramic rain repellent coat for crystal-clear night and wet weather visibility.',
        sac_code: '9987',
        tax_rate: 18,
        warranty_months: 12,
        hatchback: 3000,
        sedan: 3500,
        suv: 4500,
        luxury: 5500
      },
      {
        name: 'Underbody Rubberized Anti-Rust Coating',
        category: 'Addon',
        description: 'High-density anti-corrosion chassis treatment with sound deadening benefits (5-year guarantee).',
        sac_code: '9987',
        tax_rate: 18,
        warranty_months: 60,
        hatchback: 3800,
        sedan: 4400,
        suv: 5200,
        luxury: 6500
      },
      {
        name: 'Signature Foam Wash & Wax',
        category: 'Wash & Detail',
        description: 'pH-neutral snow foam bath, two-bucket hand wash, wheel de-ironizer, underbody rinse, and ceramic spray sealant.',
        sac_code: '9987',
        tax_rate: 18,
        warranty_months: 0,
        hatchback: 1200,
        sedan: 1500,
        suv: 1800,
        luxury: 2200
      }
    ];

    for (const s of servicesList) {
      db.run(`
        INSERT INTO services (name, category, description, sac_code, tax_rate, warranty_months, price_hatchback, price_sedan, price_suv, price_luxury)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [s.name, s.category, s.description, s.sac_code, s.tax_rate, s.warranty_months, s.hatchback, s.sedan, s.suv, s.luxury]);
    }
  }

  // Check sample customers
  const checkCust = db.exec("SELECT COUNT(*) as count FROM customers");
  const custCount = checkCust[0]?.values[0]?.[0] || 0;
  if (custCount === 0) {
    db.run(`
      INSERT INTO customers (name, phone, email, address, gstin, notes)
      VALUES 
      ('Rahul Sharma', '+91 98860 11223', 'rahul.sharma@gmail.com', 'Villa 14, Prestige Ozone, Whitefield, Bangalore', '', 'Prefers WhatsApp updates only'),
      ('Vikramaditya Rao', '+91 99450 77881', 'vikram.rao@techcorp.in', 'Flat 402, Embassy Habitat, Vasanth Nagar, Bangalore', '29AAACV5544J1Z8', 'Corporate client, requires GST B2B invoice'),
      ('Ananya Deshmukh', '+91 97410 33445', 'ananya.d@outlook.com', '34, 12th Main, Indiranagar, Bangalore', '', 'Very particular about leather interior smell');
    `);

    // Sample vehicles
    db.run(`
      INSERT INTO vehicles (customer_id, reg_number, make, model, year, color, paint_type, segment, vin, odometer, notes)
      VALUES
      (1, 'KA 03 MX 8899', 'Toyota', 'Fortuner Legender', '2024', 'Super White / Black Roof', 'Metallic', 'SUV', 'MBJ11FV28901234', '14,250 km', 'Full PPF client - inspect front bumper minor stone chips'),
      (2, 'KA 01 ND 4500', 'BMW', '530d M Sport', '2023', 'Phytonic Blue', 'Metallic', 'Sedan', 'WBA530D98012355', '22,100 km', 'Graphene coating done 6 months ago - due for topup inspection'),
      (3, 'KA 04 MP 1221', 'Hyundai', 'Creta SX(O)', '2024', 'Titan Grey Matte', 'Matte/Satin', 'SUV', 'MAL12CR90881234', '6,800 km', 'Matte paint - do not use polish, only matte ceramic sealant');
    `);

    // Sample Job Cards
    const inspectNotes1 = JSON.stringify({
      scratches: 'Minor micro-scratches on left rear quarter panel',
      dents: 'None observed',
      windshield: 'Clean, no chips',
      personal_items: 'Fastag present, glovebox checked empty',
      fuel_level: '65%'
    });

    const servicesSelected1 = JSON.stringify([
      { service_id: 3, name: 'Full Body Paint Protection Film (TPU Self-Healing)', price: 125000, qty: 1, warranty_months: 60 },
      { service_id: 7, name: 'Full Glass Hydrophobic Ceramic Shield', price: 4500, qty: 1, warranty_months: 12 }
    ]);

    db.run(`
      INSERT INTO job_cards (job_number, customer_id, vehicle_id, status, assigned_tech, fuel_level, odometer, inspection_notes, services_selected, estimated_delivery, total_estimated, advance_amount, notes)
      VALUES
      ('JOB-2026-001', 1, 1, 'in_progress', 'Karthik & Team', '65%', '14,250 km', ?, ?, '2026-11-13', 129500, 50000, 'Customer requested special attention around rear spoiler PPF wrap edges'),
      ('JOB-2026-002', 3, 3, 'quality_check', 'Suresh Kumar', '40%', '6,800 km', '{"scratches":"None","dents":"None","valuable_removed":true}', '[{"service_id":5,"name":"Interior Deep Spa & Leather Rejuvenation","price":5500,"qty":1}]', '2026-11-11', 5500, 5500, 'Interior ozone treatment complete, curing in bay 2');
    `, [inspectNotes1, servicesSelected1]);

    // Sample Invoice
    const invItems = JSON.stringify([
      { description: 'Graphene Matrix Coating 10H (5-Year Warranty)', sac: '9987', qty: 1, rate: 34000, taxRate: 18, amount: 34000 },
      { description: 'Full Glass Hydrophobic Ceramic Shield', sac: '9987', qty: 1, rate: 3500, taxRate: 18, amount: 3500 }
    ]);

    db.run(`
      INSERT INTO invoices (invoice_number, invoice_date, customer_id, vehicle_id, type, items, subtotal, tax_amount, cgst_amount, sgst_amount, grand_total, advance_paid, balance_due, payment_status, payment_mode, payment_ref, notes)
      VALUES
      ('INV-2026-001', '2026-05-10', 2, 2, 'tax_invoice', ?, 37500, 6750, 3375, 3375, 44250, 44250, 0, 'paid', 'UPI', 'UPI/HDFC/6129881239', 'Full 5-Year Graphene Warranty issued with 6-month checkup cycle.');
    `, [invItems]);

    // Sample Warranty Reminder
    db.run(`
      INSERT INTO warranties_reminders (customer_id, vehicle_id, invoice_id, title, service_type, warranty_expiry, next_followup_date, status, notes)
      VALUES
      (2, 2, 1, 'Graphene 10H - 6-Month Maintenance Top-up Wash Due', 'Ceramic Coating', '2031-05-10', '2026-11-12', 'pending', 'Customer is due for complimentary 6-month ceramic gloss inspection & hydrophobic topup wash.');
    `);
  }

  // Check & Seed Car Accessories
  const checkAcc = db.exec("SELECT COUNT(*) as count FROM accessories");
  if (!checkAcc[0]?.values[0]?.[0]) {
    db.run(`
      INSERT INTO accessories (name, category, description, hsn_sac_code, tax_rate, cost_price, selling_price, stock_quantity, min_stock_alert, warranty_months, brand)
      VALUES
      ('7D Custom Diamond-Stitch Floor Mats', 'Floor Mats & Protection', 'Dual-layer wire coil + waterproof diamond leatherette tailored specifically to vehicle cabin contour.', '8708', 18, 3200, 6499, 12, 3, 24, 'Apex Armour'),
      ('4K Dual-Channel Dashcam with Hardwired Parking Mode', 'Electronics & Dashcams', 'Front 4K + Rear 1080p, Sony Starvis night vision, supercapacitor, 24-hr G-sensor parking recording.', '8525', 18, 6800, 12999, 8, 2, 12, '70mai / DDPAI Pro'),
      ('Graphene Hydrophobic Top-Up Detailer (500ml)', 'Care & Sprays', 'Spray-on ceramic booster that revives contact angle, gloss, and hydrophobic water-beading on coated surfaces.', '3405', 18, 650, 1499, 35, 8, 24, 'CeramicPro Lab'),
      ('1200 GSM Twisted Loop Microfiber Car Drying Towel (60x90cm)', 'Microfiber & Towels', 'Scratch-free edgeless super absorbent towel capable of drying an entire full-size SUV in a single pass without wringing.', '6307', 18, 420, 999, 45, 10, 6, 'PureFiber Ultra'),
      ('German Leather Rejuvenation & Balm Conditioner Kit', 'Interior Luxury', 'pH-neutral foaming leather shampoo, restorative lanolin balm conditioner, and horsehair bristle cleaning brush.', '3405', 18, 950, 2199, 16, 4, 12, 'KochChemie / Colourlock'),
      ('Solar Alloy Rotary Car Perfume & Aromatherapy Diffuser', 'Interior Luxury', 'Machined aircraft-grade aluminum alloy with solar-powered turbine bearing and organic essential scent ring.', '3307', 18, 550, 1299, 22, 5, 6, 'Zenith Drive'),
      ('Self-Healing TPU Door Edge & Cup Guard Kit (8 Pcs)', 'Floor Mats & Protection', 'Pre-cut 200-micron optical TPU protection film to prevent ring scratches in door cups and parking wall chips.', '3919', 18, 600, 1499, 20, 5, 36, 'Apex Shield TPU'),
      ('Custom Magnetic Snap-On Window Sunshades (Set of 4)', 'Floor Mats & Protection', 'High-density laser-measured heat and UV blocking mesh curtains with magnetic window frame snaps.', '8708', 18, 900, 1999, 14, 3, 12, 'AutoShade Pro'),
      ('15W MagSafe Auto-Clamping Fast Wireless Car Charger', 'Electronics & Dashcams', 'Smart infrared motorized grip, Qi fast-charging certification, and anti-vibration air vent hook.', '8504', 18, 1100, 2499, 18, 4, 12, 'Anker / Baseus Turbo'),
      ('Carbon Fiber Protective Key Fob Shell Case', 'Interior Luxury', 'Real twill weave look lightweight ABS shell protecting key remote from accidental drops and scuffs.', '3926', 18, 350, 899, 28, 6, 12, 'Apex Carbon');
    `);
  }

  // Check & Seed Ad Campaigns
  const checkAds = db.exec("SELECT COUNT(*) as count FROM ad_campaigns");
  if (!checkAds[0]?.values[0]?.[0]) {
    db.run(`
      INSERT INTO ad_campaigns (campaign_name, platform, status, target_audience, featured_service, daily_budget, total_spend, start_date, end_date, impressions, clicks, leads_generated, conversions, revenue_generated, ad_copy)
      VALUES
      ('Monsoon 9H Ceramic Festival Offer', 'Instagram & Facebook', 'active', 'Car Owners & New Car Buyers (Bangalore East, 15km Radius)', 'Ceramic Coating 9H (3-Year Warranty)', 600, 8400, '2026-10-15', '2026-11-20', 44200, 1920, 56, 12, 312000, '🌧️ Beat the Acid Rain & Water Spots! Protect your car with Japanese 9H Multi-Layer Ceramic Coating. Get Free Glass Hydrophobic Shield worth ₹4,500. Limited booking slots available this week!'),
      ('Luxury SUV Self-Healing TPU PPF Special', 'Google Search Ads', 'active', 'High Intent Searches: Fortuner PPF, Creta PPF, BMW Detailing near me', 'Full Body Paint Protection Film (TPU Self-Healing)', 1000, 15500, '2026-10-01', '2026-11-30', 21400, 1080, 42, 7, 785000, '🛡️ Stop Highway Stone Chips & Scratches Permanently. 185-Micron TPU Film with Instant Heat Self-Healing & 5-Year Nationwide Warranty. Book a free paint thickness test today.'),
      ('VIP Interior Leather Restoration & Ozone Spa', 'WhatsApp Direct Ads', 'active', 'Past Studio Clients + Premium Sedan Owners', 'Interior Deep Spa & Leather Rejuvenation', 400, 4200, '2026-11-01', '2026-11-15', 10800, 710, 31, 9, 49500, '✨ Breathe Fresh in a Sterile Cabin! Complete interior steam extraction, German leather conditioning, and medical-grade Ozone sanitization to eliminate bacteria and AC odor. Tap to schedule doorstep pickup!');
    `);
  }

  // Check & Seed Expenses
  const checkExp = db.exec("SELECT COUNT(*) as count FROM expenses");
  if (!checkExp[0]?.values[0]?.[0]) {
    db.run(`
      INSERT INTO expenses (title, category, amount, date, payment_mode, vendor_name, receipt_ref, notes)
      VALUES
      ('Studio Detailing Bay Monthly Lease', 'Rent & Studio Lease', 65000, '2026-11-01', 'Bank Transfer', 'Marathahalli Commercial Real Estate', 'TXN-RENT-NOV26', 'Monthly studio lease covering 4 detailing bays and reception lounge.'),
      ('Detailing Staff & Certified PPF Installers Payroll', 'Staff Salaries & Detailer Wages', 85000, '2026-11-05', 'Bank Transfer', 'Studio Staff (5 Technicians)', 'SAL-NOV-2026', 'Salaries for 2 senior PPF installers and 3 detailing specialists.'),
      ('Ceramic Pro 9H Coating & Graphene Bottle Consumables', 'Ceramic & PPF Chemicals / Raw Materials', 34000, '2026-10-28', 'UPI', 'Nanotech Chemicals Distributor', 'INV-CHEM-9921', 'Stock purchase of 10x 50ml Japanese ceramic bottles and prep washes.'),
      ('3-Phase Electricity, Industrial Compressor & Pressure Pumps', 'Electricity & Power Utilities', 13800, '2026-11-02', 'Bank Transfer', 'BESCOM Power Corp', 'BESCOM-ELEC-4412', 'High power consumption for infrared curing lamps and rotary polishers.'),
      ('Meta Sponsored Ads & Google Search Ads Spend', 'Ad Campaigns & Social Media Marketing', 28100, '2026-11-08', 'Credit Card', 'Meta Ads & Google Ads India', 'META-ADS-BILL-102', 'Paid ad spend across Instagram and Google Search detailing campaigns.'),
      ('Rupes BigFoot Polisher Servicing & Foam Pad Replacements', 'Equipment & Polisher Maintenance', 6200, '2026-11-06', 'UPI', 'Car Care Tools & Equipments Bangalore', 'RCP-PADS-004', 'Pack of 12 wool pads, finishing foam pads, and grease overhaul.');
    `);
  }
}

// Helper methods
export function query(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function queryOne(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function run(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  saveDb();
  const lastId = queryOne('SELECT last_insert_rowid() as id');
  return { lastInsertRowid: lastId ? lastId.id : null };
}

export default {
  initDb,
  query,
  queryOne,
  run,
  saveDb
};
