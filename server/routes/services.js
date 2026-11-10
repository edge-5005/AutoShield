import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all services
router.get('/', (req, res) => {
  try {
    const services = db.query(`SELECT * FROM services ORDER BY category ASC, name ASC`);
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add service
router.post('/', (req, res) => {
  try {
    const { name, category, description, sac_code, tax_rate, warranty_months, price_hatchback, price_sedan, price_suv, price_luxury } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and Category are required' });
    }

    const result = db.run(`
      INSERT INTO services (name, category, description, sac_code, tax_rate, warranty_months, price_hatchback, price_sedan, price_suv, price_luxury)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name,
      category,
      description || '',
      sac_code || '9987',
      Number(tax_rate) || 18,
      Number(warranty_months) || 0,
      Number(price_hatchback) || 0,
      Number(price_sedan) || 0,
      Number(price_suv) || 0,
      Number(price_luxury) || 0
    ]);

    res.status(201).json({ id: result.lastInsertRowid, message: 'Service added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update service
router.put('/:id', (req, res) => {
  try {
    const { name, category, description, sac_code, tax_rate, warranty_months, price_hatchback, price_sedan, price_suv, price_luxury, is_active } = req.body;
    db.run(`
      UPDATE services
      SET name = ?, category = ?, description = ?, sac_code = ?, tax_rate = ?, warranty_months = ?, 
          price_hatchback = ?, price_sedan = ?, price_suv = ?, price_luxury = ?, is_active = ?
      WHERE id = ?
    `, [
      name,
      category,
      description || '',
      sac_code || '9987',
      Number(tax_rate) || 18,
      Number(warranty_months) || 0,
      Number(price_hatchback) || 0,
      Number(price_sedan) || 0,
      Number(price_suv) || 0,
      Number(price_luxury) || 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      req.params.id
    ]);

    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete service
router.delete('/:id', (req, res) => {
  try {
    db.run('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
