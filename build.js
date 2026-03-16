const fs = require('fs');
const path = require('path');

// 确保public目录存在
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// 确保public/api目录存在
if (!fs.existsSync('public/api')) {
  fs.mkdirSync('public/api');
}

// 复制目录的函数
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log('Source directory does not exist:', src);
    return;
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 复制前端构建文件
if (fs.existsSync('client/dist')) {
  console.log('Copying client/dist to public...');
  copyDir('client/dist', 'public');
  console.log('Frontend files copied!');
} else {
  console.log('client/dist not found. Build may have failed.');
}

// 复制API文件
if (fs.existsSync('api')) {
  console.log('Copying API files to public/api...');
  copyDir('api', 'public/api');
  console.log('API files copied!');
} else {
  console.log('api directory not found.');
}

console.log('Build completed!');