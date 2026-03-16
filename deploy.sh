#!/bin/bash

echo "🚀 Client Portal 一键部署脚本"
echo "================================"

# 检查是否安装了必要的CLI工具
echo "📦 检查依赖..."

# 检查 Railway CLI
if ! command -v railway &> /dev/null; then
    echo "⚠️  Railway CLI 未安装，正在安装..."
    npm install -g @railway/cli
fi

# 检查 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

echo "✅ 依赖检查完成"

# 部署后端到 Railway
echo ""
echo "🚂 部署后端到 Railway..."
echo "请在浏览器中完成 Railway 登录..."
railway login

echo "🔧 初始化 Railway 项目..."
railway init

echo "🚀 部署后端..."
railway up

echo "📋 获取 Railway URL..."
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url')
echo "后端 URL: $RAILWAY_URL"

# 部署前端到 Vercel
echo ""
echo "⚡ 部署前端到 Vercel..."
echo "请在浏览器中完成 Vercel 登录..."

cd client
vercel login

echo "🔧 设置环境变量..."
vercel env add VITE_API_URL production "${RAILWAY_URL}/api"

echo "🚀 部署前端..."
vercel --prod

echo ""
echo "🎉 部署完成！"
echo "================================"
echo "后端 URL: $RAILWAY_URL"
echo "前端 URL: 请查看 Vercel 输出"
echo "登录信息: admin / admin123"