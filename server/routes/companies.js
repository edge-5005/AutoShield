import express from 'express';
import db from '../db.js';

const router = express.Router();

// List all studio companies
router.get('/', (req, res) => {
  try {
    const companies = db.query(`
      SELECT id, name, slug, tagline, phone, email, address, gstin, state_name, bays_count, logo_url, created_at
      FROM companies
      ORDER BY id ASC
    `);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get company profile by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const company = db.queryOne(`
      SELECT id, name, slug, tagline, phone, email, address, gstin, state_code, state_name, bays_count, logo_url, created_at
      FROM companies
      WHERE id = ? OR slug = ?
    `, [id, id]);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register new customer studio company
router.post('/register', (req, res) => {
  try {
    const {
      name,
      tagline = 'Automotive Detailing & Paint Protection Studio',
      phone = '',
      email = '',
      address = '',
      gstin = '',
      state_name = 'Karnataka',
      state_code = '29',
      bays_count = 4,
      admin_pin = '1234',
      front_office_pin = '0000',
      logo_url = ''
    } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Company / Studio Name is required (minimum 2 characters)' });
    }

    // Generate unique slug
    let baseSlug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!baseSlug) baseSlug = 'studio';
    let slug = baseSlug;
    let counter = 1;

    while (db.queryOne('SELECT id FROM companies WHERE slug = ?', [slug])) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const result = db.run(`
      INSERT INTO companies (name, slug, tagline, phone, email, address, gstin, state_code, state_name, bays_count, admin_pin, front_office_pin, logo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name.trim(),
      slug,
      tagline,
      phone,
      email,
      address,
      gstin.toUpperCase(),
      state_code,
      state_name,
      Number(bays_count) || 4,
      admin_pin || '1234',
      front_office_pin || '0000',
      logo_url || ''
    ]);

    const createdCompany = db.queryOne('SELECT id, name, slug, tagline, phone, email, address, gstin, state_name, bays_count, logo_url FROM companies WHERE id = ?', [result.lastInsertRowid]);

    // Update settings table with the active company info
    db.run(`
      UPDATE settings
      SET studio_name = ?, tagline = ?, phone = ?, email = ?, address = ?, gstin = ?, state_name = ?, logo_url = ?
      WHERE id = 1
    `, [name.trim(), tagline, phone, email, address, gstin.toUpperCase(), state_name, logo_url || '']);

    res.status(201).json({
      message: 'Company profile created successfully!',
      company: createdCompany,
      credentials: {
        admin_pin: admin_pin || '1234',
        front_office_pin: front_office_pin || '0000'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login / Verify role PIN for a company
router.post('/login', (req, res) => {
  try {
    const { company_id = 1, role = 'admin', pin = '' } = req.body;

    const company = db.queryOne('SELECT * FROM companies WHERE id = ?', [company_id]);
    if (!company) {
      return res.status(404).json({ error: 'Studio Company not found' });
    }

    if (role === 'admin') {
      const expectedPin = company.admin_pin || '1234';
      if (pin && pin !== expectedPin) {
        return res.status(401).json({ error: 'Incorrect Admin PIN. Default is 1234.' });
      }
      return res.json({
        success: true,
        role: 'admin',
        roleTitle: 'Studio Owner / General Manager (Full Access)',
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          tagline: company.tagline,
          phone: company.phone,
          email: company.email,
          address: company.address,
          gstin: company.gstin,
          bays_count: company.bays_count,
          logo_url: company.logo_url
        }
      });
    } else if (role === 'front_office') {
      const expectedPin = company.front_office_pin || '0000';
      if (pin && pin !== expectedPin) {
        return res.status(401).json({ error: 'Incorrect Front Office PIN. Default is 0000.' });
      }
      return res.json({
        success: true,
        role: 'front_office',
        roleTitle: 'Front Office Reception & Detailing Bays (Operational Access)',
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          tagline: company.tagline,
          phone: company.phone,
          email: company.email,
          address: company.address,
          gstin: company.gstin,
          bays_count: company.bays_count,
          logo_url: company.logo_url
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid role specified' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update company profile
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, tagline, phone, email, address, gstin,
      state_name, bays_count, admin_pin, front_office_pin, logo_url
    } = req.body;

    db.run(`
      UPDATE companies
      SET name = ?, tagline = ?, phone = ?, email = ?, address = ?,
          gstin = ?, state_name = ?, bays_count = ?, admin_pin = ?,
          front_office_pin = ?, logo_url = ?
      WHERE id = ?
    `, [
      name, tagline, phone, email, address,
      gstin, state_name, Number(bays_count) || 4,
      admin_pin || '1234', front_office_pin || '0000',
      logo_url || '', id
    ]);

    // Also update settings table if it's the active company
    db.run(`
      UPDATE settings
      SET studio_name = ?, tagline = ?, phone = ?, email = ?, address = ?, gstin = ?, state_name = ?, logo_url = ?
      WHERE id = 1
    `, [name, tagline, phone, email, address, gstin, state_name, logo_url || '']);

    const updated = db.queryOne('SELECT * FROM companies WHERE id = ?', [id]);
    res.json({ message: 'Company profile updated successfully', company: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
