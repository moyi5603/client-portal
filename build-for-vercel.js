const fs = require('fs');
const path = require('path');

// Copy client/dist contents to root for Vercel
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy client/dist to root
if (fs.existsSync('client/dist')) {
  console.log('Copying client/dist to root...');
  copyDir('client/dist', './');
  console.log('Copy completed!');
} else {
  console.log('client/dist not found. Please run build first.');
}