import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { loadEnv } from './config/env.js';
import authRouter from './routes/auth.js';
import { verifyFirebaseToken } from './middleware/auth.js';

dotenv.config();
loadEnv();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'disaster-mgmt-backend' });
});

app.use('/auth', authRouter);

// Example protected route
app.get('/protected', verifyFirebaseToken, (req, res) => {
  res.json({ message: 'Access granted', uid: req.user.uid });
});

// GDACS proxy route to avoid CORS / non-JSON issues in the frontend
app.get('/api/gdacs', async (req, res) => {
  const eventtype = req.query.eventtype || '';
  const url = `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtype=${encodeURIComponent(eventtype)}`;

  try {
    const resp = await fetch(url);

    if (!resp.ok) {
      return res.status(resp.status).json({
        error: `GDACS API error ${resp.status} ${resp.statusText}`,
      });
    }

    const data = await resp.json();
    return res.json(data);
  } catch (err) {
    console.error('Backend GDACS proxy error:', err);
    return res.status(500).json({ error: 'Failed to fetch data from GDACS' });
  }
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
