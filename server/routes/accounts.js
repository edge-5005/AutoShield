import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get Profit & Loss Financial Summary (Automatic calculation from live invoices & expenses)
router.get('/summary', (req, res) => {
  try {
    // 1. Revenue from Invoices
    const invoices = db.query('SELECT * FROM invoices');
    let totalInvoicedRevenue = 0;
    let totalCollectedRevenue = 0;
    let totalTaxCollected = 0;
    let totalPendingReceivables = 0;

    let revenueByServiceType = {
      'Ceramic Coating': 0,
      'Paint Protection Film (PPF)': 0,
      'Interior Detailing & Leather': 0,
      'Wash & Exterior Polish': 0,
      'Accessories & Products': 0,
      'Other': 0
    };

    invoices.forEach(inv => {
      totalInvoicedRevenue += inv.subtotal || 0;
      totalTaxCollected += inv.tax_amount || 0;
      totalCollectedRevenue += inv.advance_paid || 0;
      if (inv.payment_status === 'paid') {
        totalCollectedRevenue += (inv.grand_total - (inv.advance_paid || 0));
      } else {
        totalPendingReceivables += inv.balance_due || 0;
      }

      // Parse invoice items to categorize revenue
      try {
        const items = JSON.parse(inv.items || '[]');
        items.forEach(it => {
          const desc = (it.description || '').toLowerCase();
          const amt = it.amount || 0;
          if (desc.includes('ceramic') || desc.includes('graphene')) {
            revenueByServiceType['Ceramic Coating'] += amt;
          } else if (desc.includes('ppf') || desc.includes('film')) {
            revenueByServiceType['Paint Protection Film (PPF)'] += amt;
          } else if (desc.includes('interior') || desc.includes('leather') || desc.includes('spa')) {
            revenueByServiceType['Interior Detailing & Leather'] += amt;
          } else if (desc.includes('wash') || desc.includes('polish') || desc.includes('rubbing')) {
            revenueByServiceType['Wash & Exterior Polish'] += amt;
          } else if (desc.includes('mat') || desc.includes('cam') || desc.includes('towel') || desc.includes('perfume') || desc.includes('charger')) {
            revenueByServiceType['Accessories & Products'] += amt;
          } else {
            revenueByServiceType['Other'] += amt;
          }
        });
      } catch (e) {
        // ignore JSON parse error
      }
    });

    // 2. Expenses by Category
    const expenses = db.query('SELECT * FROM expenses ORDER BY date DESC');
    let totalOperatingExpenses = 0;
    const expensesByCategory = {};

    expenses.forEach(exp => {
      totalOperatingExpenses += exp.amount || 0;
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
    });

    // 3. Estimated Cost of Goods Sold (Chemicals, coatings, films & accessories COGS)
    // In detailing industry, chemical/PPF raw materials typically cost ~18-22% of service revenue
    const estimatedMaterialCogs = Math.round(totalInvoicedRevenue * 0.18);
    const grossProfit = totalInvoicedRevenue - estimatedMaterialCogs;
    const grossMarginPct = totalInvoicedRevenue > 0 ? ((grossProfit / totalInvoicedRevenue) * 100).toFixed(1) : 0;

    const netProfit = grossProfit - totalOperatingExpenses;
    const netProfitMarginPct = totalInvoicedRevenue > 0 ? ((netProfit / totalInvoicedRevenue) * 100).toFixed(1) : 0;

    res.json({
      revenue: {
        total_invoiced: totalInvoicedRevenue,
        total_collected: totalCollectedRevenue,
        pending_receivables: totalPendingReceivables,
        tax_collected: totalTaxCollected,
        breakdown_by_service: revenueByServiceType
      },
      cogs: {
        estimated_material_cost: estimatedMaterialCogs,
        gross_profit: grossProfit,
        gross_margin_pct: parseFloat(grossMarginPct)
      },
      expenses: {
        total_operating_expenses: totalOperatingExpenses,
        breakdown_by_category: expensesByCategory,
        recent_expenses: expenses.slice(0, 10)
      },
      net_financials: {
        net_profit: netProfit,
        net_profit_margin_pct: parseFloat(netProfitMarginPct),
        is_profitable: netProfit >= 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual P&L Simulation & Analysis
router.post('/manual-simulation', (req, res) => {
  try {
    const {
      manual_revenue = 250000,
      material_cost_pct = 20,
      rent_expense = 65000,
      salaries_expense = 85000,
      marketing_ad_expense = 25000,
      utility_expense = 15000,
      other_expenses = 10000,
      tax_gst_rate = 18
    } = req.body;

    const cogs = Math.round(manual_revenue * (material_cost_pct / 100));
    const grossProfit = manual_revenue - cogs;
    const totalFixedOverheads = rent_expense + salaries_expense + marketing_ad_expense + utility_expense + other_expenses;
    const netProfitBeforeTax = grossProfit - totalFixedOverheads;
    const estimatedGstOutflow = Math.round((manual_revenue * (tax_gst_rate / 100)) - (cogs * 0.18));
    const netMarginPct = manual_revenue > 0 ? ((netProfitBeforeTax / manual_revenue) * 100).toFixed(1) : 0;

    // Break-even revenue calculation
    const grossMarginRatio = (100 - material_cost_pct) / 100;
    const breakevenRevenue = grossMarginRatio > 0 ? Math.round(totalFixedOverheads / grossMarginRatio) : 0;

    res.json({
      simulation: {
        projected_revenue: manual_revenue,
        cogs,
        gross_profit: grossProfit,
        total_overheads: totalFixedOverheads,
        net_profit: netProfitBeforeTax,
        net_margin_pct: parseFloat(netMarginPct),
        estimated_gst_liability: estimatedGstOutflow,
        breakeven_revenue: breakevenRevenue,
        is_profitable: netProfitBeforeTax >= 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Expenses CRUD
router.get('/expenses', (req, res) => {
  try {
    const expenses = db.query('SELECT * FROM expenses ORDER BY date DESC, id DESC');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/expenses', (req, res) => {
  try {
    const {
      title, category, amount, date,
      payment_mode = 'Bank Transfer', vendor_name,
      receipt_ref, notes, is_recurring = 0
    } = req.body;

    if (!title || !category || !amount || !date) {
      return res.status(400).json({ error: 'Title, Category, Amount, and Date are required' });
    }

    const result = db.run(`
      INSERT INTO expenses (title, category, amount, date, payment_mode, vendor_name, receipt_ref, notes, is_recurring)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, category, parseFloat(amount), date,
      payment_mode, vendor_name || '', receipt_ref || '',
      notes || '', is_recurring ? 1 : 0
    ]);

    const created = db.queryOne('SELECT * FROM expenses WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, category, amount, date,
      payment_mode, vendor_name, receipt_ref,
      notes, is_recurring
    } = req.body;

    db.run(`
      UPDATE expenses
      SET title = ?, category = ?, amount = ?, date = ?,
          payment_mode = ?, vendor_name = ?, receipt_ref = ?,
          notes = ?, is_recurring = ?
      WHERE id = ?
    `, [
      title, category, parseFloat(amount), date,
      payment_mode, vendor_name, receipt_ref,
      notes, is_recurring ? 1 : 0, id
    ]);

    const updated = db.queryOne('SELECT * FROM expenses WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/expenses/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM expenses WHERE id = ?', [id]);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
