import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const totalCustomers = db.queryOne('SELECT COUNT(*) as count FROM customers')?.count || 0;
    const totalVehicles = db.queryOne('SELECT COUNT(*) as count FROM vehicles')?.count || 0;
    const activeJobs = db.queryOne("SELECT COUNT(*) as count FROM job_cards WHERE status NOT IN ('delivered', 'cancelled')")?.count || 0;
    
    // Revenue calculations
    const revenueRow = db.queryOne("SELECT SUM(grand_total) as total, SUM(advance_paid) as collected, SUM(balance_due) as pending FROM invoices WHERE type = 'tax_invoice'");
    const totalRevenue = revenueRow?.total || 0;
    const totalCollected = revenueRow?.collected || 0;
    const totalPending = revenueRow?.pending || 0;

    // Jobs by status pipeline
    const jobsByStatus = {
      received: db.queryOne("SELECT COUNT(*) as count FROM job_cards WHERE status = 'received'")?.count || 0,
      in_progress: db.queryOne("SELECT COUNT(*) as count FROM job_cards WHERE status = 'in_progress'")?.count || 0,
      quality_check: db.queryOne("SELECT COUNT(*) as count FROM job_cards WHERE status = 'quality_check'")?.count || 0,
      ready: db.queryOne("SELECT COUNT(*) as count FROM job_cards WHERE status = 'ready'")?.count || 0,
      delivered: db.queryOne("SELECT COUNT(*) as count FROM job_cards WHERE status = 'delivered'")?.count || 0,
    };

    // Pending reminders (ceramic / PPF checkups due)
    const upcomingReminders = db.query(`
      SELECT wr.*, c.name as customer_name, c.phone as customer_phone, v.reg_number, v.make, v.model
      FROM warranties_reminders wr
      JOIN customers c ON wr.customer_id = c.id
      JOIN vehicles v ON wr.vehicle_id = v.id
      WHERE wr.status = 'pending'
      ORDER BY wr.next_followup_date ASC
      LIMIT 5
    `);

    // Recent active jobs
    const recentJobs = db.query(`
      SELECT j.*, c.name as customer_name, c.phone as customer_phone, v.reg_number, v.make, v.model, v.segment
      FROM job_cards j
      JOIN customers c ON j.customer_id = c.id
      JOIN vehicles v ON j.vehicle_id = v.id
      ORDER BY j.created_at DESC
      LIMIT 5
    `);

    // Recent invoices
    const recentInvoices = db.query(`
      SELECT i.*, c.name as customer_name, v.reg_number, v.make, v.model
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      JOIN vehicles v ON i.vehicle_id = v.id
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    res.json({
      metrics: {
        totalCustomers,
        totalVehicles,
        activeJobs,
        totalRevenue,
        totalCollected,
        totalPending,
      },
      jobsByStatus,
      upcomingReminders,
      recentJobs,
      recentInvoices
    });
  } catch (error) {
    console.error('Error in dashboard route:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
