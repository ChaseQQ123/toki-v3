#!/bin/bash

# iPhone 测试脚本

echo "📱 TOKI Native - iPhone 测试"
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
echo "  [2] iOS 模拟器（需 Mac）"
echo "  [3] TestFlight（需开发者账号）"
echo "  [4] 本地预览 - 网页版"
echo ""

read -p "请选择 (1-4, 默认1): " choice

case ${choice:-1} in
  1)
    echo ""
    echo "🚀 启动 Expo Go 方式..."
    echo ""
    echo "📋 操作步骤:"
    echo "  1. 在 iPhone 上安装 Expo Go"
    echo "     - App Store 搜索: Expo Go"
    echo "     - 直接链接: https://apps.apple.com/app/expo-go/id982107779"
    echo ""
    echo "  2. 启动开发服务器"
    echo ""
    echo "  3. iPhone 扫码连接"
    echo "     - 方式A: 相机扫码（自动打开 Expo Go）"
    echo "     - 方式B: Expo Go 内点击 Scan QR Code"
    echo ""
    echo "  4. 开始测试"
    echo ""
    echo "⏳ 启动服务器..."
    echo ""
    
    # 启动 Expo
    npm start
    
    ;;
    
  2)
    echo ""
    echo "🚀 iOS 模拟器方式..."
    echo ""
    
    # 检查是否在 Mac 上
    if [[ "$OSTYPE" != "darwin"* ]]; then
      echo "❌ iOS 模拟器仅支持 Mac 电脑"
      echo ""
      echo "替代方案:"
      echo "  - 使用 Expo Go（iPhone 真机）"
      echo "  - 使用网页预览"
      exit 1
    fi
    
    # 检查 Xcode
    if ! command -v xcodebuild &> /dev/null; then
      echo "❌ 未安装 Xcode"
      echo "请从 Mac App Store 安装 Xcode"
      exit 1
    fi
    
    echo "✅ Xcode 已安装"
    echo ""
    echo "⏳ 启动 iOS 模拟器..."
    
    npm run ios
    
    ;;
    
  3)
    echo ""
    echo "🚀 TestFlight 方式..."
    echo ""
    echo "📋 操作步骤:"
    echo "  1. 构建 iOS 应用"
    echo "  2. 上传到 TestFlight"
    echo "  3. 在 iPhone 上安装 TestFlight"
    echo "  4. 加入测试并安装 APP"
    echo ""
    echo "⚠️ 注意:"
    echo "  - 需要 Apple Developer 账号（$99/年）"
    echo "  - 构建时间约 10-15 分钟"
    echo ""
    
    read -p "是否已安装 EAS CLI？(y/n): " eas_installed
    
    if [ "$eas_installed" = "y" ]; then
      echo "⏳ 开始构建..."
      eas build --platform ios
    else
      echo ""
      echo "请先安装 EAS CLI:"
      echo "npm install -g eas-cli"
      echo ""
      echo "然后登录 Apple ID:"
      echo "eas login"
    fi
    
    ;;
    
  4)
    echo ""
    echo "🚀 网页预览方式..."
    echo ""
    echo "📋 说明:"
    echo "  - 在浏览器中预览 APP"
    echo "  - 部分功能不可用（如语音、推送）"
    echo ""
    
    npm start --web
    
    ;;
    
  *)
    echo "❌ 无效选择"
    exit 1
    ;;
esac