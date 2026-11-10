import express from 'express';
import db from '../db.js';

const router = express.Router();

// List all invoices / estimates
router.get('/', (req, res) => {
  try {
    const { type } = req.query;
    let sql = `
      SELECT i.*, c.name as customer_name, c.phone as customer_phone,
             v.reg_number, v.make, v.model, v.segment
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      JOIN vehicles v ON i.vehicle_id = v.id
    `;
    const params = [];
    if (type && type !== 'all') {
      sql += ` WHERE i.type = ?`;
      params.push(type);
    }
    sql += ` ORDER BY i.created_at DESC`;
    const invoices = db.query(sql, params);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single invoice with full details & studio settings for printing
router.get('/:id', (req, res) => {
  try {
    const invoice = db.queryOne(`
      SELECT i.*, 
             c.name as customer_name, c.phone as customer_phone, c.email as customer_email, c.address as customer_address, c.gstin as customer_gstin,
             v.reg_number, v.make, v.model, v.year, v.color, v.paint_type, v.segment, v.vin, v.odometer
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      JOIN vehicles v ON i.vehicle_id = v.id
      WHERE i.id = ?
    `, [req.params.id]);

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const settings = db.queryOne('SELECT * FROM settings WHERE id = 1');

    res.json({
      ...invoice,
      settings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new Invoice / Estimate
router.post('/', (req, res) => {
  try {
    const {
      type = 'tax_invoice',
      invoice_date,
      job_card_id,
      customer_id,
      vehicle_id,
      items = [],
      discount = 0,
      advance_paid = 0,
      payment_mode = 'UPI',
      payment_ref = '',
      notes = '',
      terms = '',
      is_interstate = 0
    } = req.body;

    if (!customer_id || !vehicle_id) {
      return res.status(400).json({ error: 'Customer ID and Vehicle ID are required' });
    }

    const year = new Date().getFullYear();
    const countRow = db.queryOne("SELECT COUNT(*) as count FROM invoices WHERE type = ?", [type]);
    const nextNum = (countRow?.count || 0) + 1;
    const prefix = type === 'estimate' ? 'EST' : 'INV';
    const invoice_number = `${prefix}-${year}-${String(nextNum).padStart(3, '0')}`;

    // Calculate totals
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    let subtotal = 0;
    let totalTax = 0;

    parsedItems.forEach(item => {
      const rate = Number(item.rate) || 0;
      const qty = Number(item.qty) || 1;
      const taxRate = item.taxRate !== undefined ? Number(item.taxRate) : 18;
      const lineTotal = rate * qty;
      const lineTax = (lineTotal * taxRate) / 100;

      subtotal += lineTotal;
      totalTax += lineTax;
    });

    const disc = Number(discount) || 0;
    const taxableAfterDiscount = Math.max(0, subtotal - disc);
    const taxFactor = subtotal > 0 ? taxableAfterDiscount / subtotal : 1;
    const adjustedTax = totalTax * taxFactor;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (is_interstate) {
      igst = adjustedTax;
    } else {
      cgst = adjustedTax / 2;
      sgst = adjustedTax / 2;
    }

    const grand_total = Math.round(taxableAfterDiscount + adjustedTax);
    const advance = Number(advance_paid) || 0;
    const balance_due = Math.max(0, grand_total - advance);

    let payment_status = 'unpaid';
    if (balance_due === 0 && grand_total > 0) {
      payment_status = 'paid';
    } else if (advance > 0) {
      payment_status = 'partially_paid';
    }

    const itemsStr = JSON.stringify(parsedItems);

    const result = db.run(`
      INSERT INTO invoices (
        invoice_number, invoice_date, job_card_id, customer_id, vehicle_id,
        type, items, subtotal, tax_amount, cgst_amount, sgst_amount, igst_amount,
        is_interstate, discount, grand_total, advance_paid, balance_due,
        payment_status, payment_mode, payment_ref, notes, terms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      invoice_number,
      invoice_date || new Date().toISOString().split('T')[0],
      job_card_id || null,
      customer_id,
      vehicle_id,
      type,
      itemsStr,
      subtotal,
      adjustedTax,
      cgst,
      sgst,
      igst,
      is_interstate ? 1 : 0,
      disc,
      grand_total,
      advance,
      balance_due,
      payment_status,
      payment_mode,
      payment_ref,
      notes,
      terms
    ]);

    const invoiceId = result.lastInsertRowid;

    // Check if services have warranties and auto-schedule reminders for tax invoices
    if (type === 'tax_invoice') {
      for (const item of parsedItems) {
        if (item.warranty_months && Number(item.warranty_months) > 0) {
          const months = Number(item.warranty_months);
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + months);
          
          // Schedule 1st follow-up at 6 months (or half warranty)
          const followupDate = new Date();
          followupDate.setMonth(followupDate.getMonth() + Math.min(6, months));

          db.run(`
            INSERT INTO warranties_reminders (customer_id, vehicle_id, invoice_id, title, service_type, warranty_expiry, next_followup_date, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
          `, [
            customer_id,
            vehicle_id,
            invoiceId,
            `${item.description || 'Service'} - ${Math.min(6, months)} Month Maintenance Inspection`,
            item.description || 'Detall Service',
            expiryDate.toISOString().split('T')[0],
            followupDate.toISOString().split('T')[0],
            `Scheduled warranty maintenance inspection check for invoice ${invoice_number}`
          ]);
        }
      }
    }

    res.status(201).json({ id: invoiceId, invoice_number, message: 'Invoice generated successfully' });
  } catch (error) {
    console.error('Invoice create error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Record Payment towards an invoice
router.post('/:id/pay', (req, res) => {
  try {
    const { amount, payment_mode, payment_ref } = req.body;
    const inv = db.queryOne('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });

    const payAmount = Number(amount) || 0;
    const newAdvance = (inv.advance_paid || 0) + payAmount;
    const newBalance = Math.max(0, inv.grand_total - newAdvance);
    const newStatus = newBalance === 0 ? 'paid' : (newAdvance > 0 ? 'partially_paid' : 'unpaid');

    db.run(`
      UPDATE invoices
      SET advance_paid = ?, balance_due = ?, payment_status = ?, payment_mode = ?, payment_ref = ?
      WHERE id = ?
    `, [newAdvance, newBalance, newStatus, payment_mode || inv.payment_mode, payment_ref || inv.payment_ref, inv.id]);

    res.json({ message: 'Payment recorded successfully', newBalance, payment_status: newStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert Estimate to Tax Invoice
router.post('/:id/convert-to-invoice', (req, res) => {
  try {
    const est = db.queryOne("SELECT * FROM invoices WHERE id = ? AND type = 'estimate'", [req.params.id]);
    if (!est) return res.status(404).json({ error: 'Estimate not found' });

    const year = new Date().getFullYear();
    const countRow = db.queryOne("SELECT COUNT(*) as count FROM invoices WHERE type = 'tax_invoice'");
    const nextNum = (countRow?.count || 0) + 1;
    const newInvoiceNumber = `INV-${year}-${String(nextNum).padStart(3, '0')}`;

    db.run(`
      UPDATE invoices
      SET type = 'tax_invoice', invoice_number = ?, invoice_date = ?
      WHERE id = ?
    `, [newInvoiceNumber, new Date().toISOString().split('T')[0], est.id]);

    res.json({ message: 'Converted to Tax Invoice successfully', invoice_number: newInvoiceNumber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete invoice
router.delete('/:id', (req, res) => {
  try {
    db.run('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
