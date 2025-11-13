import { Router } from 'express';
import axios from 'axios';
import { getAdmin } from '../firebase/admin.js';

const router = Router();

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const admin = getAdmin();
    const userRecord = await admin.auth().createUser({ email, password, displayName });

    return res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /auth/login
// Uses Firebase Identity Toolkit REST API to sign in with email/password to get an ID token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'FIREBASE_API_KEY not configured' });

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const { data } = await axios.post(url, { email, password, returnSecureToken: true });

    // data contains idToken, refreshToken, localId, etc.
    return res.json({ idToken: data.idToken, refreshToken: data.refreshToken, uid: data.localId });
  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    const code = err.response?.status || 400;
    return res.status(code).json({ error: msg });
  }
});

// GET /auth/me -> verify current token and return decoded claims
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

    const admin = getAdmin();
    const decoded = await admin.auth().verifyIdToken(token);
    return res.json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token', details: err.message });
  }
});

export default router;
