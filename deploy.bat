@echo off
echo 🚀 Client Portal 一键部署脚本
echo ================================

REM 检查 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 请先安装 Node.js
    pause
    exit /b 1
)

echo 📦 安装部署工具...

REM 安装 Railway CLI
echo 安装 Railway CLI...
npm install -g @railway/cli

REM 安装 Vercel CLI  
echo 安装 Vercel CLI...
npm install -g vercel

echo ✅ 工具安装完成

echo.
echo 🚂 开始部署后端到 Railway...
echo 请在浏览器中完成登录...

REM Railway 部署
railway login
railway init
railway up

echo.
echo ⚡ 开始部署前端到 Vercel...
echo 请在浏览器中完成登录...

REM Vercel 部署
cd client
vercel login
vercel --prod

echo.
echo 🎉 部署完成！
echo ================================
echo 请查看上方输出获取部署 URL
echo 登录信息: admin / admin123
pause