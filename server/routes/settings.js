import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const settings = db.queryOne('SELECT * FROM settings WHERE id = 1');
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', (req, res) => {
  try {
    const {
      studio_name, tagline, phone, email, address, gstin,
      state_code, state_name, bank_name, account_number,
      ifsc_code, branch, upi_id, rc_api_key, terms_conditions
    } = req.body;

    db.run(`
      UPDATE settings
      SET studio_name = ?, tagline = ?, phone = ?, email = ?, address = ?,
          gstin = ?, state_code = ?, state_name = ?, bank_name = ?,
          account_number = ?, ifsc_code = ?, branch = ?, upi_id = ?,
          rc_api_key = ?, terms_conditions = ?
      WHERE id = 1
    `, [
      studio_name, tagline, phone, email, address,
      gstin, state_code, state_name, bank_name,
      account_number, ifsc_code, branch, upi_id,
      rc_api_key || '', terms_conditions
    ]);

    res.json({ message: 'Studio settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
