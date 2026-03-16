// Simple Railway startup script
console.log('🚀 Starting Client Portal Backend...');

// Set port
const PORT = process.env.PORT || 3003;
process.env.PORT = PORT;

console.log('🔌 Port:', PORT);
console.log('📍 Environment:', process.env.NODE_ENV || 'development');

// Start server directly
try {
  require('./src/server/index.ts');
} catch (error) {
  console.error('❌ Failed to start with TypeScript, trying with tsx...');
  const { spawn } = require('child_process');
  
  const server = spawn('npx', ['tsx', 'src/server/index.ts'], {
    stdio: 'inherit',
    env: process.env
  });
  
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
  });
}