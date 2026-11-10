import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';

import dashboardRoutes from './routes/dashboard.js';
import customerRoutes from './routes/customers.js';
import vehicleRoutes from './routes/vehicles.js';
import serviceRoutes from './routes/services.js';
import jobRoutes from './routes/jobs.js';
import invoiceRoutes from './routes/invoices.js';
import reminderRoutes from './routes/reminders.js';
import settingsRoutes from './routes/settings.js';
import accessoryRoutes from './routes/accessories.js';
import adRoutes from './routes/ads.js';
import accountRoutes from './routes/accounts.js';
import companyRoutes from './routes/companies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Ensure SQLite DB is initialized before processing queries
app.use(async (req, res, next) => {
  try {
    await initDb();
    next();
  } catch (err) {
    console.error('Database initialization middleware error:', err);
    res.status(500).json({ error: 'Database initialization failed', details: err.message });
  }
});

// API Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/accessories', accessoryRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/companies', companyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'AutoShield Pro Detailing CRM API',
    timestamp: new Date().toISOString()
  });
});

// Serve static assets from public folder (accessories, images, etc.)
const publicPath = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Serve frontend in local standalone production server
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    const indexHtml = path.join(distPath, 'index.html');
    res.sendFile(indexHtml);
  });
}

export default app;
