import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all customers (with vehicle counts)
router.get('/', (req, res) => {
  try {
    const customers = db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM vehicles WHERE customer_id = c.id) as vehicle_count,
        (SELECT COUNT(*) FROM job_cards WHERE customer_id = c.id) as job_count,
        (SELECT SUM(grand_total) FROM invoices WHERE customer_id = c.id AND type = 'tax_invoice') as total_spend
      FROM customers c
      ORDER BY c.created_at DESC
    `);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer with vehicles, jobs, invoices
router.get('/:id', (req, res) => {
  try {
    const customer = db.queryOne('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const vehicles = db.query('SELECT * FROM vehicles WHERE customer_id = ? ORDER BY created_at DESC', [customer.id]);
    const jobCards = db.query(`
      SELECT j.*, v.reg_number, v.make, v.model
      FROM job_cards j
      JOIN vehicles v ON j.vehicle_id = v.id
      WHERE j.customer_id = ?
      ORDER BY j.created_at DESC
    `, [customer.id]);

    const invoices = db.query(`
      SELECT i.*, v.reg_number, v.make, v.model
      FROM invoices i
      JOIN vehicles v ON i.vehicle_id = v.id
      WHERE i.customer_id = ?
      ORDER BY i.created_at DESC
    `, [customer.id]);

    const reminders = db.query(`
      SELECT wr.*, v.reg_number, v.make, v.model
      FROM warranties_reminders wr
      JOIN vehicles v ON wr.vehicle_id = v.id
      WHERE wr.customer_id = ?
      ORDER BY wr.next_followup_date ASC
    `, [customer.id]);

    res.json({
      ...customer,
      vehicles,
      jobCards,
      invoices,
      reminders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer (with optional initial vehicle)
router.post('/', (req, res) => {
  try {
    const { name, phone, email, address, gstin, notes, vehicle } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone are required' });
    }

    const { lastInsertRowid: customerId } = db.run(`
      INSERT INTO customers (name, phone, email, address, gstin, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, phone, email || '', address || '', gstin || '', notes || '']);

    let vehicleId = null;
    if (vehicle && vehicle.reg_number && vehicle.make) {
      const reg = vehicle.reg_number.trim().toUpperCase();
      const vResult = db.run(`
        INSERT INTO vehicles (customer_id, reg_number, make, model, year, color, paint_type, segment, vin, odometer, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        customerId,
        reg,
        vehicle.make,
        vehicle.model || '',
        vehicle.year || '',
        vehicle.color || '',
        vehicle.paint_type || 'Metallic',
        vehicle.segment || 'Sedan',
        vehicle.vin || '',
        vehicle.odometer || '',
        vehicle.notes || ''
      ]);
      vehicleId = vResult.lastInsertRowid;
    }

    res.status(201).json({ id: customerId, vehicleId, message: 'Customer created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', (req, res) => {
  try {
    const { name, phone, email, address, gstin, notes } = req.body;
    db.run(`
      UPDATE customers 
      SET name = ?, phone = ?, email = ?, address = ?, gstin = ?, notes = ?
      WHERE id = ?
    `, [name, phone, email || '', address || '', gstin || '', notes || '', req.params.id]);

    res.json({ message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', (req, res) => {
  try {
    db.run('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
