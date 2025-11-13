export function loadEnv() {
  const required = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_API_KEY'
  ];

  const missing = required.filter((k) => !process.env[k] || process.env[k].length === 0);
  if (missing.length) {
    console.warn('[env] Missing env vars:', missing.join(', '));
  }

  // Normalize private key newlines if provided with escaped \n
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY.includes('\\n')) {
    process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }
}
