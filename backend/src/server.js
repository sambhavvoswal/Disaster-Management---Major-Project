import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
