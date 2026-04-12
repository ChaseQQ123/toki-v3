# 📱 TOKI 手机测试完整指南

## 快速导航

- [Android 测试](./TESTING-ANDROID.md)
- [iPhone 测试](./TESTING-IOS.md)

---

## 🚀 最快测试方式（推荐）

### Android (华为等)
```bash
# 1. 华为应用市场下载 Expo Go
# 2. npm start
# 3. 扫码连接
```

### iPhone
```bash
# 1. App Store 下载 Expo Go
# 2. npm start
# 3. 相机扫码或 Expo Go 内扫码
```

---

## 📋 测试方式对比

| 方式 | Android | iPhone | 时间 | 推荐度 |
|------|---------|--------|------|--------|
| Expo Go | ✅ | ✅ | **3分钟** | ⭐⭐⭐⭐⭐ |
| APK/IPA安装 | ✅ | ✅ | 10分钟 | ⭐⭐⭐⭐ |
| 模拟器 | Android Studio | Xcode | 5分钟 | ⭐⭐⭐ |
| TestFlight | ❌ | ✅ | 15分钟 | ⭐⭐⭐ |

---

## 🎯 核心功能测试

### 基础功能
- [ ] 对话界面
- [ ] 记忆系统
- [ ] 记忆统计
- [ ] Token计费

### 高级功能
- [ ] 语音输入
- [ ] 语音合成
- [ ] 图像生成
- [ ] 图像识别

---

## 📱 测试脚本

### Android
```bash
./test-android.sh
```

### iPhone
```bash
./test-ios.sh
```

### 通用
```bash
npm start
```

---

## ❓ 常见问题

### 找不到 Expo Go？
- **Android**: 华为应用市场 或 https://expo.dev/expo-go.apk
- **iPhone**: App Store 搜索 "Expo Go"

### 无法扫码连接？
- 确保手机和电脑同一WiFi
- 尝试隧道模式: `npm start --tunnel`
- 关闭 VPN/代理

### APP 加载失败？
- 检查网络连接
- 重启 Expo Go
- 清除缓存

---

**推荐使用 Expo Go，最快最简单！** 🚀