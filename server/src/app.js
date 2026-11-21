import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './config/database.js';
import masterRoutes from './routes/masterRoutes.js';
import harvestRoutes from './routes/harvestRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();
const port = Number(process.env.PORT || 4000);

const clientOrigin = process.env.CLIENT_ORIGIN;
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (clientOrigin && origin === clientOrigin) return callback(null, true);
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
      return callback(null, false);
    },
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: 'connected' }));
app.use('/api', masterRoutes);
app.use('/api/harvest-records', harvestRoutes);
app.use('/api', reportRoutes);

app.use((req, res) => res.status(404).json({ message: `Endpoint tidak ditemukan: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Panen API berjalan di http://localhost:${port}`);
  console.log(`SQLite database: ${db.name}`);
});
