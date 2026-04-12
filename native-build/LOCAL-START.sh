#!/bin/bash

# TOKI Native 本地启动脚本
# 请在本地电脑上运行此脚本

echo "🦞 TOKI Native - 本地启动"
echo "=========================="
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
  echo "❌ 未安装 Node.js"
  echo "请先安装 Node.js: https://nodejs.org/"
  exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo ""

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
  echo "❌ 请在 toki-native 目录下运行此脚本"
  exit 1
fi

# 安装依赖
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖（首次运行需要几分钟）..."
  npm install --legacy-peer-deps
  echo ""
fi

echo "✅ 依赖已就绪"
echo ""

echo "📱 准备启动开发服务器..."
echo ""
echo "📋 操作步骤:"
echo "  1. 等待服务器启动（约10-30秒）"
echo "  2. 扫描屏幕上显示的二维码"
echo "     Android: 在 Expo Go 中扫码"
echo "     iPhone: 相机扫码或 Expo Go 内扫码"
echo "  3. APP 自动加载到手机"
echo ""
echo "⏳ 启动服务器..."
echo ""

# 启动 Expo
npm start