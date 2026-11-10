import express from 'express';
import db from '../db.js';

const router = express.Router();

// List reminders
router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT wr.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
             v.reg_number, v.make, v.model, v.segment
      FROM warranties_reminders wr
      JOIN customers c ON wr.customer_id = c.id
      JOIN vehicles v ON wr.vehicle_id = v.id
    `;
    const params = [];
    if (status && status !== 'all') {
      sql += ` WHERE wr.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY wr.next_followup_date ASC`;
    const reminders = db.query(sql, params);
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update reminder status
router.put('/:id', (req, res) => {
  try {
    const { status, notes } = req.body;
    db.run(`
      UPDATE warranties_reminders
      SET status = COALESCE(?, status),
          notes = COALESCE(?, notes)
      WHERE id = ?
    `, [status, notes, req.params.id]);

    res.json({ message: 'Reminder updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add custom reminder
router.post('/', (req, res) => {
  try {
    const { customer_id, vehicle_id, invoice_id, title, service_type, warranty_expiry, next_followup_date, notes } = req.body;
    if (!customer_id || !vehicle_id || !title || !next_followup_date) {
      return res.status(400).json({ error: 'Customer, Vehicle, Title, and Follow-up Date are required' });
    }

    const result = db.run(`
      INSERT INTO warranties_reminders (customer_id, vehicle_id, invoice_id, title, service_type, warranty_expiry, next_followup_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [
      customer_id,
      vehicle_id,
      invoice_id || null,
      title,
      service_type || 'General Service',
      warranty_expiry || '',
      next_followup_date,
      notes || ''
    ]);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Reminder added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete reminder
router.delete('/:id', (req, res) => {
  try {
    db.run('DELETE FROM warranties_reminders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
