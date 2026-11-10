import express from 'express';
import db from '../db.js';

const router = express.Router();

// List all ad campaigns with live KPI calculations
router.get('/', (req, res) => {
  try {
    const campaigns = db.query('SELECT * FROM ad_campaigns ORDER BY created_at DESC');

    const calculated = campaigns.map(c => {
      const ctr = c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(2) : 0;
      const cpc = c.clicks > 0 ? (c.total_spend / c.clicks).toFixed(2) : 0;
      const cpl = c.leads_generated > 0 ? (c.total_spend / c.leads_generated).toFixed(2) : 0;
      const convRate = c.leads_generated > 0 ? ((c.conversions / c.leads_generated) * 100).toFixed(1) : 0;
      const roas = c.total_spend > 0 ? (c.revenue_generated / c.total_spend).toFixed(2) : 0;

      return {
        ...c,
        ctr: parseFloat(ctr),
        cpc: parseFloat(cpc),
        cpl: parseFloat(cpl),
        conversion_rate: parseFloat(convRate),
        roas: parseFloat(roas)
      };
    });

    res.json(calculated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aggregate executive analytics report
router.get('/analytics', (req, res) => {
  try {
    const campaigns = db.query('SELECT * FROM ad_campaigns');

    let totalSpend = 0;
    let totalRevenue = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalLeads = 0;
    let totalConversions = 0;

    const byPlatform = {};

    campaigns.forEach(c => {
      totalSpend += c.total_spend || 0;
      totalRevenue += c.revenue_generated || 0;
      totalImpressions += c.impressions || 0;
      totalClicks += c.clicks || 0;
      totalLeads += c.leads_generated || 0;
      totalConversions += c.conversions || 0;

      if (!byPlatform[c.platform]) {
        byPlatform[c.platform] = { spend: 0, revenue: 0, leads: 0, conversions: 0, clicks: 0 };
      }
      byPlatform[c.platform].spend += c.total_spend || 0;
      byPlatform[c.platform].revenue += c.revenue_generated || 0;
      byPlatform[c.platform].leads += c.leads_generated || 0;
      byPlatform[c.platform].conversions += c.conversions || 0;
      byPlatform[c.platform].clicks += c.clicks || 0;
    });

    const blendedRoas = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : 0;
    const avgCpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : 0;
    const avgCpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : 0;
    const overallConvRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : 0;

    res.json({
      summary: {
        total_campaigns: campaigns.length,
        total_spend: totalSpend,
        total_revenue: totalRevenue,
        net_ad_profit: totalRevenue - totalSpend,
        blended_roas: parseFloat(blendedRoas),
        total_impressions: totalImpressions,
        total_clicks: totalClicks,
        total_leads: totalLeads,
        total_conversions: totalConversions,
        avg_cpl: parseFloat(avgCpl),
        avg_cpc: parseFloat(avgCpc),
        overall_conversion_rate: parseFloat(overallConvRate)
      },
      by_platform: byPlatform
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create campaign
router.post('/', (req, res) => {
  try {
    const {
      campaign_name, platform, status = 'active', target_audience,
      featured_service, daily_budget = 500, total_spend = 0,
      start_date, end_date, impressions = 0, clicks = 0,
      leads_generated = 0, conversions = 0, revenue_generated = 0,
      ad_copy, cta_url
    } = req.body;

    if (!campaign_name || !platform) {
      return res.status(400).json({ error: 'Campaign Name and Platform are required' });
    }

    const result = db.run(`
      INSERT INTO ad_campaigns (campaign_name, platform, status, target_audience, featured_service, daily_budget, total_spend, start_date, end_date, impressions, clicks, leads_generated, conversions, revenue_generated, ad_copy, cta_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      campaign_name, platform, status, target_audience || '',
      featured_service || '', daily_budget, total_spend,
      start_date || new Date().toISOString().split('T')[0],
      end_date || '', impressions, clicks, leads_generated,
      conversions, revenue_generated, ad_copy || '', cta_url || ''
    ]);

    const created = db.queryOne('SELECT * FROM ad_campaigns WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update campaign
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      campaign_name, platform, status, target_audience,
      featured_service, daily_budget, total_spend,
      start_date, end_date, impressions, clicks,
      leads_generated, conversions, revenue_generated,
      ad_copy, cta_url
    } = req.body;

    db.run(`
      UPDATE ad_campaigns
      SET campaign_name = ?, platform = ?, status = ?, target_audience = ?,
          featured_service = ?, daily_budget = ?, total_spend = ?,
          start_date = ?, end_date = ?, impressions = ?, clicks = ?,
          leads_generated = ?, conversions = ?, revenue_generated = ?,
          ad_copy = ?, cta_url = ?
      WHERE id = ?
    `, [
      campaign_name, platform, status, target_audience,
      featured_service, daily_budget, total_spend,
      start_date, end_date, impressions, clicks,
      leads_generated, conversions, revenue_generated,
      ad_copy, cta_url, id
    ]);

    const updated = db.queryOne('SELECT * FROM ad_campaigns WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete campaign
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.run('DELETE FROM ad_campaigns WHERE id = ?', [id]);
    res.json({ message: 'Ad campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
