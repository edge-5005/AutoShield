import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all job cards with customer & vehicle info
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT j.*, c.name as customer_name, c.phone as customer_phone,
             v.reg_number, v.make, v.model, v.color, v.segment, v.paint_type
      FROM job_cards j
      JOIN customers c ON j.customer_id = c.id
      JOIN vehicles v ON j.vehicle_id = v.id
    `;
    const params = [];
    if (status && status !== 'all') {
      sql += ` WHERE j.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY j.created_at DESC`;
    const jobs = db.query(sql, params);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single job card
router.get('/:id', (req, res) => {
  try {
    const job = db.queryOne(`
      SELECT j.*, 
             c.name as customer_name, c.phone as customer_phone, c.email as customer_email, c.address as customer_address, c.gstin as customer_gstin,
             v.reg_number, v.make, v.model, v.year, v.color, v.segment, v.paint_type, v.vin
      FROM job_cards j
      JOIN customers c ON j.customer_id = c.id
      JOIN vehicles v ON j.vehicle_id = v.id
      WHERE j.id = ?
    `, [req.params.id]);

    if (!job) return res.status(404).json({ error: 'Job card not found' });

    // Find linked invoices
    const linkedInvoice = db.queryOne('SELECT * FROM invoices WHERE job_card_id = ?', [job.id]);

    res.json({
      ...job,
      linkedInvoice
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new Job Card
router.post('/', (req, res) => {
  try {
    const {
      customer_id,
      vehicle_id,
      status = 'received',
      assigned_tech,
      fuel_level,
      odometer,
      inspection_notes,
      services_selected,
      estimated_delivery,
      total_estimated,
      advance_amount = 0,
      notes
    } = req.body;

    if (!customer_id || !vehicle_id) {
      return res.status(400).json({ error: 'Customer ID and Vehicle ID are required' });
    }

    // Auto generate job number: JOB-YYYY-001
    const year = new Date().getFullYear();
    const countRow = db.queryOne("SELECT COUNT(*) as count FROM job_cards");
    const nextNum = (countRow?.count || 0) + 1;
    const jobNumber = `JOB-${year}-${String(nextNum).padStart(3, '0')}`;

    const inspectStr = typeof inspection_notes === 'object' ? JSON.stringify(inspection_notes) : (inspection_notes || '{}');
    const servicesStr = typeof services_selected === 'object' ? JSON.stringify(services_selected) : (services_selected || '[]');

    const result = db.run(`
      INSERT INTO job_cards (
        job_number, customer_id, vehicle_id, status, assigned_tech,
        fuel_level, odometer, inspection_notes, services_selected,
        estimated_delivery, total_estimated, advance_amount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      jobNumber,
      customer_id,
      vehicle_id,
      status,
      assigned_tech || '',
      fuel_level || '50%',
      odometer || '',
      inspectStr,
      servicesStr,
      estimated_delivery || '',
      Number(total_estimated) || 0,
      Number(advance_amount) || 0,
      notes || ''
    ]);

    res.status(201).json({ id: result.lastInsertRowid, job_number: jobNumber, message: 'Job Card created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Job Card
router.put('/:id', (req, res) => {
  try {
    const {
      status,
      assigned_tech,
      fuel_level,
      odometer,
      inspection_notes,
      services_selected,
      estimated_delivery,
      actual_delivery,
      total_estimated,
      advance_amount,
      notes
    } = req.body;

    const inspectStr = typeof inspection_notes === 'object' ? JSON.stringify(inspection_notes) : inspection_notes;
    const servicesStr = typeof services_selected === 'object' ? JSON.stringify(services_selected) : services_selected;

    db.run(`
      UPDATE job_cards
      SET status = COALESCE(?, status),
          assigned_tech = COALESCE(?, assigned_tech),
          fuel_level = COALESCE(?, fuel_level),
          odometer = COALESCE(?, odometer),
          inspection_notes = COALESCE(?, inspection_notes),
          services_selected = COALESCE(?, services_selected),
          estimated_delivery = COALESCE(?, estimated_delivery),
          actual_delivery = COALESCE(?, actual_delivery),
          total_estimated = COALESCE(?, total_estimated),
          advance_amount = COALESCE(?, advance_amount),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      status,
      assigned_tech,
      fuel_level,
      odometer,
      inspectStr,
      servicesStr,
      estimated_delivery,
      actual_delivery,
      total_estimated !== undefined ? Number(total_estimated) : null,
      advance_amount !== undefined ? Number(advance_amount) : null,
      notes,
      req.params.id
    ]);

    res.json({ message: 'Job Card updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Job Card
router.delete('/:id', (req, res) => {
  try {
    db.run('DELETE FROM job_cards WHERE id = ?', [req.params.id]);
    res.json({ message: 'Job Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
