#!/usr/bin/env node

import dotenv from 'dotenv';
import { connectDB } from './database.js';
import express from 'express';

dotenv.config();

console.log('🧪 Testing backend startup...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

const app = express();
const PORT = process.env.PORT || 5001;

// Test basic server
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to DB
(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected');
    
    app.listen(PORT, () => {
      console.log(`✅ Test server running on http://localhost:${PORT}`);
      console.log('Try: curl http://localhost:5001/health');
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
