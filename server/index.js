import app from './app.js';
import { initDb } from './db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('Initializing SQLite Database...');
    await initDb();
    console.log('Database initialized successfully.');

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚗 AutoShield Pro Detailing Studio CRM & Billing`);
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
