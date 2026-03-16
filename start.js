// Railway startup script
console.log('🚀 Starting Client Portal Backend...');
console.log('📍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', process.env.PORT || 3003);

// Set default port if not provided
if (!process.env.PORT) {
  process.env.PORT = '3003';
}

// Start the server
require('child_process').spawn('npx', ['tsx', 'src/server/index.ts'], {
  stdio: 'inherit',
  env: process.env
});