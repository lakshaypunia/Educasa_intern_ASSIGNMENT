import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import schoolRoutes from './src/routes/school.routes';
import { errorHandler } from './src/middleware/errorHandler';
import { testConnection } from './src/config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Request logger ───────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/', schoolRoutes);

// ─── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// ─── Global error handler (must be last) ──────────────────────
app.use(errorHandler);

// ─── Start (skipped on Vercel — serverless handles invocation) ──
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`\n[SERVER] Running on http://localhost:${PORT}`);
    console.log(`[SERVER] DB_ENV = ${process.env.DB_ENV || 'local'}\n`);
    await testConnection().catch((err) => {
      console.error('[SERVER] Failed to connect to database:', err.message);
      process.exit(1);
    });
  });
}

// Export for Vercel serverless runtime
export default app;
