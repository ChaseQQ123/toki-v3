#!/bin/bash

# 华为手机测试脚本

echo "📱 TOKI Native - 华为手机测试"
echo "================================"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
  echo "❌ 未找到 node_modules"
  echo "请先运行: npm install"
  exit 1
fi

echo "✅ 依赖已安装"
echo ""

echo "📱 测试方式:"
echo "  [1] Expo Go（推荐） - 扫码测试"
echo "  [2] 构建 APK - 独立安装"
echo "  [3] 本地预览 - 网页版"
echo ""

read -p "请选择 (1-3, 默认1): " choice

case ${choice:-1} in
  1)
    echo ""
    echo "🚀 启动 Expo Go 方式..."
    echo ""
    echo "📋 操作步骤:"
    echo "  1. 在华为手机上安装 Expo Go APP"
    echo "     - 华为应用市场搜索: Expo Go"
    echo "     - 或下载: https://expo.dev/expo-go.apk"
    echo ""
    echo "  2. 启动开发服务器（扫描二维码）"
    echo ""
    echo "  3. 手机扫码连接，开始测试"
    echo ""
    echo "⏳ 启动服务器..."
    echo ""
    
    # 启动 Expo
    npm start
    
    ;;
    
  2)
    echo ""
    echo "🚀 构建 APK 方式..."
    echo ""
    echo "📋 操作步骤:"
    echo "  1. 构建 APK 文件（约 5-10 分钟）"
    echo "  2. 下载 APK 到电脑"
    echo "  3. 传输到华为手机"
    echo "  4. 安装并测试"
    echo ""
    echo "⚠️ 注意:"
    echo "  - 华为手机需允许安装未知来源"
    echo "  - 设置 → 安全 → 允许未知来源"
    echo ""
    
    read -p "开始构建？(y/n): " confirm
    if [ "$confirm" = "y" ]; then
      echo "⏳ 开始构建 APK..."
      
      # 使用 Expo 构建
      if command -v expo &> /dev/null; then
        expo build:android
      else
        echo "❌ 未找到 Expo CLI"
        echo "请安装: npm install -g expo-cli"
      fi
    fi
    
    ;;
    
  3)
    echo ""
    echo "🚀 网页预览方式..."
    echo ""
    echo "📋 操作步骤:"
    echo "  1. 在浏览器中预览 APP"
    echo "  2. 测试基础功能"
    echo ""
    echo "⚠️ 注意:"
    echo "  - 部分功能在浏览器中不可用（如语音）"
    echo ""
    
    npm start --web
    
    ;;
    
  *)
    echo "❌ 无效选择"
    exit 1
    ;;
esac