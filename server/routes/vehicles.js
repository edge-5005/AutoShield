import express from 'express';
import db from '../db.js';
import { STATE_NAMES, RTO_DIRECTORY, POPULAR_CARS } from '../data/carCatalog.js';

const router = express.Router();

// Get vehicle catalog list for autocomplete / smart dropdowns
router.get('/catalog', (req, res) => {
  res.json({
    models: POPULAR_CARS,
    rtos: RTO_DIRECTORY,
    states: STATE_NAMES
  });
});

// Auto-fetch vehicle specifications from Number Plate
router.post('/lookup', async (req, res) => {
  try {
    const { query = '' } = req.body;
    const cleanQuery = query.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!cleanQuery || cleanQuery.length < 3) {
      return res.status(400).json({ error: 'Valid registration number plate is required' });
    }

    // 1. Check local DB first: has this car visited our detailing shop before?
    const existing = db.queryOne(`
      SELECT v.*, c.name as customer_name, c.phone as customer_phone
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
      WHERE REPLACE(REPLACE(UPPER(v.reg_number), ' ', ''), '-', '') = ?
    `, [cleanQuery]);

    if (existing) {
      return res.json({
        found: true,
        source: 'Studio Client Garage (Previous Record Found)',
        data: {
          reg_number: existing.reg_number,
          make: existing.make,
          model: existing.model,
          year: existing.year,
          color: existing.color,
          paint_type: existing.paint_type,
          segment: existing.segment,
          odometer: existing.odometer,
          customer_name: existing.customer_name,
          customer_phone: existing.customer_phone,
          customer_id: existing.customer_id
        }
      });
    }

    // 2. Format plate number nicely e.g. "TN 02 AB 1234"
    let formattedPlate = cleanQuery;
    let stateCode = cleanQuery.substring(0, 2);
    let districtCode = cleanQuery.substring(2, 4);

    if (cleanQuery.length >= 8 && cleanQuery.length <= 11) {
      const remaining = cleanQuery.substring(4);
      formattedPlate = `${stateCode} ${districtCode} ${remaining}`;
    }

    // Identify State & RTO office
    const rtoPrefix = `${stateCode}${districtCode}`;
    const rtoEntry = RTO_DIRECTORY[rtoPrefix];
    const stateName = STATE_NAMES[stateCode] || 'India';
    const rtoName = rtoEntry ? `${rtoEntry.rto}, ${rtoEntry.state}` : `${stateName} State RTO (Code ${rtoPrefix})`;

    // 3. Check if user configured an optional live RapidAPI / RC key in studio settings
    const settings = db.queryOne('SELECT * FROM settings WHERE id = 1');
    const apiKey = settings?.rc_api_key || process.env.RAPIDAPI_KEY;

    if (apiKey) {
      try {
        const rcRes = await fetch('https://rto-vehicle-information-india.p.rapidapi.com/api/v1/rc/vehicleinfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'rto-vehicle-information-india.p.rapidapi.com'
          },
          body: JSON.stringify({ reg_no: cleanQuery }),
          signal: AbortSignal.timeout(6000)
        });

        if (rcRes.ok) {
          const rcData = await rcRes.json();
          if (rcData && (rcData.maker_model || rcData.maker_description)) {
            const rawModel = rcData.maker_model || rcData.maker_description || '';
            const rawMake = rcData.maker_description || rawModel.split(' ')[0] || 'Unknown';
            const rawColor = rcData.color || '';
            const rawYear = rcData.registration_date ? rcData.registration_date.split('-')[0] : '';

            // Detect segment
            let segment = 'Sedan';
            const mLower = rawModel.toLowerCase();
            if (mLower.includes('fortuner') || mLower.includes('creta') || mLower.includes('thar') || mLower.includes('suv') || mLower.includes('scorpio') || mLower.includes('xuv') || mLower.includes('safari') || mLower.includes('harrier')) {
              segment = 'SUV';
            } else if (mLower.includes('swift') || mLower.includes('i20') || mLower.includes('baleno') || mLower.includes('altroz') || mLower.includes('hatch')) {
              segment = 'Hatchback';
            } else if (mLower.includes('bmw') || mLower.includes('mercedes') || mLower.includes('audi') || mLower.includes('defender') || mLower.includes('porsche')) {
              segment = 'Luxury';
            }

            return res.json({
              found: true,
              source: `Live VAHAN RC Database (${rtoName})`,
              data: {
                reg_number: formattedPlate,
                make: rawMake,
                model: rawModel,
                year: rawYear,
                color: rawColor,
                segment,
                paint_type: 'Metallic',
                rto_location: rtoName,
                owner_name: rcData.owner_name || ''
              }
            });
          }
        }
      } catch (err) {
        console.warn('Live RC API call error:', err.message);
      }
    }

    // 4. Honest RTO Verification Mode:
    // When no live VAHAN API key is configured, verify RTO & format plate honestly without guessing fake car models
    return res.json({
      found: false,
      source: `RTO Verified: ${rtoName}`,
      isRtoOnly: true,
      message: `RTO Verified: ${rtoName}. Tap your car model below or type to auto-fill.`,
      data: {
        reg_number: formattedPlate,
        rto_location: rtoName,
        state: stateName,
        paint_type: 'Metallic',
        segment: 'Sedan',
        year: new Date().getFullYear().toString(),
        quickPicks: [
          { make: 'Toyota', model: 'Fortuner Legender', segment: 'SUV', color: 'Super White / Black Roof' },
          { make: 'Hyundai', model: 'Creta', segment: 'SUV', color: 'Abyss Black Pearl' },
          { make: 'Mahindra', model: 'Thar Roxx', segment: 'SUV', color: 'Stealth Black' },
          { make: 'Mahindra', model: 'XUV700', segment: 'SUV', color: 'Midnight Black' },
          { make: 'Toyota', model: 'Innova Hycross', segment: 'SUV', color: 'Pearl White' },
          { make: 'BMW', model: '3 Series (330Li / M340i)', segment: 'Sedan', color: 'Portimao Blue Metallic' },
          { make: 'Mercedes-Benz', model: 'C-Class', segment: 'Sedan', color: 'Obsidian Black' },
          { make: 'Tata', model: 'Nexon', segment: 'SUV', color: 'Daytona Grey' },
          { make: 'Maruti Suzuki', model: 'Swift', segment: 'Hatchback', color: 'Solid Fire Red' },
          { make: 'Honda', model: 'City', segment: 'Sedan', color: 'Platinum White Pearl' },
          { make: 'Volkswagen', model: 'Virtus', segment: 'Sedan', color: 'Candy White' },
          { make: 'Kia', model: 'Seltos', segment: 'SUV', color: 'Gravity Grey' }
        ]
      }
    });

  } catch (error) {
    console.error('Vehicle lookup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all vehicles with owner information
router.get('/', (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT v.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
    `;
    const params = [];

    if (search) {
      sql += ` WHERE v.reg_number LIKE ? OR v.make LIKE ? OR v.model LIKE ? OR c.name LIKE ? OR c.phone LIKE ?`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    sql += ` ORDER BY v.created_at DESC`;
    const vehicles = db.query(sql, params);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single vehicle with full history
router.get('/:id', (req, res) => {
  try {
    const vehicle = db.queryOne(`
      SELECT v.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email, c.address as customer_address, c.gstin as customer_gstin
      FROM vehicles v
      JOIN customers c ON v.customer_id = c.id
      WHERE v.id = ?
    `, [req.params.id]);

    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const jobCards = db.query(`
      SELECT * FROM job_cards WHERE vehicle_id = ? ORDER BY created_at DESC
    `, [vehicle.id]);

    const invoices = db.query(`
      SELECT * FROM invoices WHERE vehicle_id = ? ORDER BY created_at DESC
    `, [vehicle.id]);

    const reminders = db.query(`
      SELECT * FROM warranties_reminders WHERE vehicle_id = ? ORDER BY next_followup_date ASC
    `, [vehicle.id]);

    res.json({
      ...vehicle,
      jobCards,
      invoices,
      reminders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new vehicle for customer
router.post('/', (req, res) => {
  try {
    const { customer_id, reg_number, make, model, year, color, paint_type, segment, vin, odometer, notes } = req.body;
    if (!customer_id || !reg_number || !make) {
      return res.status(400).json({ error: 'Customer ID, Registration Number, and Make are required' });
    }

    const reg = reg_number.trim().toUpperCase();
    const existing = db.queryOne('SELECT id FROM vehicles WHERE reg_number = ?', [reg]);
    if (existing) {
      return res.status(400).json({ error: `Vehicle with registration ${reg} already exists` });
    }

    const result = db.run(`
      INSERT INTO vehicles (customer_id, reg_number, make, model, year, color, paint_type, segment, vin, odometer, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      customer_id,
      reg,
      make,
      model || '',
      year || '',
      color || '',
      paint_type || 'Metallic',
      segment || 'Sedan',
      vin || '',
      odometer || '',
      notes || ''
    ]);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Vehicle added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vehicle
router.put('/:id', (req, res) => {
  try {
    const { reg_number, make, model, year, color, paint_type, segment, vin, odometer, notes } = req.body;
    const reg = reg_number.trim().toUpperCase();

    db.run(`
      UPDATE vehicles
      SET reg_number = ?, make = ?, model = ?, year = ?, color = ?, paint_type = ?, segment = ?, vin = ?, odometer = ?, notes = ?
      WHERE id = ?
    `, [reg, make, model || '', year || '', color || '', paint_type || 'Metallic', segment || 'Sedan', vin || '', odometer || '', notes || '', req.params.id]);

    res.json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete vehicle
router.delete('/:id', (req, res) => {
  try {
    db.run('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Vehicle removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
