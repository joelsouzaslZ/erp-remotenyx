#!/usr/bin/env node

/**
 * ERP Remotenyx - Startup Script
 * This script ensures everything is configured before starting the system
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ERP Remotenyx - Starting System');
console.log('=' .repeat(50) + '\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Running setup...\n');
  const setup = require('./auto-setup.js');
  setup.main().then(() => {
    console.log('\n✅ Setup complete! Starting system...\n');
    startSystem();
  }).catch(err => {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  });
} else {
  console.log('✅ Configuration file found');
  startSystem();
}

function startSystem() {
  console.log('\n🔄 Starting backend server...');
  const serverProcess = spawn('npm', ['run', 'server'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  let clientProcess = null;
  let cleanupRegistered = false;

  // Handle cleanup
  const cleanup = () => {
    if (!cleanupRegistered) {
      cleanupRegistered = true;
      console.log('\n\n🛑 Shutting down...');
      serverProcess.kill();
      if (clientProcess) {
        clientProcess.kill();
      }
      process.exit(0);
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Wait for server to be ready before starting client
  const SERVER_STARTUP_DELAY = process.env.SERVER_STARTUP_DELAY || 3000;
  setTimeout(() => {
    console.log('\n🔄 Starting frontend client...');
    clientProcess = spawn('npm', ['run', 'client'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });
  }, parseInt(SERVER_STARTUP_DELAY));

  serverProcess.on('error', (err) => {
    console.error('❌ Error starting server:', err.message);
    process.exit(1);
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0 && !cleanupRegistered) {
      console.error('❌ Server exited with code:', code);
      process.exit(code);
    }
  });
}
