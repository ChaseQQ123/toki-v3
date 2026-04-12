#!/bin/bash

# TOKI Native 快速启动脚本

echo "🦞 TOKI Native 快速启动"
echo "========================"

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install --legacy-peer-deps
fi

echo ""
echo "✅ 依赖已就绪"
echo ""
echo "📱 启动方式:"
echo "  1. 开发模式: npm start"
echo "  2. iOS模拟器: npm run ios"
echo "  3. Android模拟器: npm run android"
echo "  4. Web浏览器: npm run web"
echo ""
echo "🧪 运行测试: node test.js"
echo ""
echo "选择启动方式:"
echo "  [1] 开发模式 (默认)"
echo "  [2] iOS"
echo "  [3] Android"
echo "  [4] Web"
echo "  [5] 测试"
echo "  [0] 退出"
echo ""
read -p "请选择 (1-5, 默认1): " choice

case ${choice:-1} in
  1)
    echo "🚀 启动开发模式..."
    npm start
    ;;
  2)
    echo "🚀 启动iOS模拟器..."
    npm run ios
    ;;
  3)
    echo "🚀 启动Android模拟器..."
    npm run android
    ;;
  4)
    echo "🚀 启动Web浏览器..."
    npm run web
    ;;
  5)
    echo "🧪 运行测试..."
    node test.js
    ;;
  0)
    echo "👋 退出"
    exit 0
    ;;
  *)
    echo "❌ 无效选择"
    exit 1
    ;;
esac