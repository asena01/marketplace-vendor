#!/usr/bin/env node
/**
 * Main Backend Startup Script
 * This script starts the Express backend server with all routes loaded
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'backend/functions/.env') });

console.log('🚀 Starting MarketHub Backend Server...');
console.log(`📁 Working directory: ${process.cwd()}`);
console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 PORT: ${process.env.PORT || 5001}`);

// Import and run the backend server
import(path.join(__dirname, 'backend/functions/server.js'))
  .then(() => {
    console.log('✅ Backend server module loaded successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start backend:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
