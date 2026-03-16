const fs = require('fs');
const path = require('path');

// 复制目录的函数
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log('Source directory does not exist:', src);
    return;
  }
  
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

// 复制文件的函数
function copyFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  } else {
    console.log(`Source file not found: ${src}`);
  }
}

// 构建前端
if (fs.existsSync('client/dist')) {
  console.log('Copying frontend files to root...');
  
  // 复制index.html到根目录
  copyFile('client/dist/index.html', 'index.html');
  
  // 复制assets目录到根目录
  if (fs.existsSync('client/dist/assets')) {
    copyDir('client/dist/assets', 'assets');
    console.log('Assets copied to root!');
  }
  
  // 复制api-test.html到根目录
  copyFile('client/dist/api-test.html', 'api-test.html');
  
  console.log('Frontend files copied to root!');
} else {
  console.log('client/dist not found. Build may have failed.');
}

// 确保api目录存在
if (!fs.existsSync('api')) {
  console.log('API directory not found, creating...');
  fs.mkdirSync('api');
}

console.log('Build completed!');