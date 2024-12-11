require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { auth } = require('express-oauth2-jwt-bearer');

const app = express();
const port = process.env.PORT || 3001;

// Auth0 configuration
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256'
});

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(helmet());
app.use(express.json());

// Debug logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Public routes (if any)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes - use jwtCheck middleware
app.use('/api', jwtCheck);

app.get('/api/authorized', (req, res) => {
  res.json({ 
    message: 'Secured Resource',
    user: req.auth
  });
});

// Protected test endpoint
app.get("/api/test", (req, res) => {
  const userEmail = req.auth?.payload?.email;
  res.json({ 
    status: "ok",
    email: userEmail 
  });
});

// Log environment variables during startup (excluding secrets)
console.log('Starting server with config:', {
  port: port,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  audience: process.env.AUTH0_AUDIENCE
});

app.listen(port, () => console.log(`Auth server running on ${port}`));