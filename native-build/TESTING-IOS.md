# 📱 iPhone 测试指南

## 方式1：Expo Go APP（最快，推荐）⭐

### 步骤

#### 1. 在 iPhone 上安装 Expo Go

**下载方式**：
- **App Store**: 搜索 "Expo Go"
- **直接链接**: https://apps.apple.com/app/expo-go/id982107779

**安装后打开 Expo Go**

---

#### 2. 在电脑上启动开发服务器

```bash
cd /home/tony/.openclaw/workspace/toki-native

# 启动开发服务器
npm start
```

**等待服务器启动，会显示二维码**

---

#### 3. iPhone 扫码连接

**方式A：使用相机扫码**
- 打开 iPhone 相机
- 对准电脑屏幕上的二维码
- 点击通知打开 Expo Go

**方式B：在 Expo Go 内扫码**
- 打开 Expo Go APP
- 点击 "Scan QR Code"
- 扫描电脑屏幕上的二维码
- APP 自动加载

**网络要求**：
- iPhone 和电脑连接同一WiFi网络
- 或使用 USB 数据线连接

---

#### 4. 测试功能

**在 iPhone 上测试**：
- 对话功能
- 记忆系统
- 语音输入（Siri 级别体验）
- Token计费

---

## 方式2：TestFlight（正式测试）

### 前提条件
- Apple Developer 账号（$99/年）
- 已构建 iOS 应用

### 步骤

#### 1. 构建应用

```bash
cd /home/tony/.openclaw/workspace/toki-native

# 使用 EAS 构建
eas build --platform ios

# 或使用 Expo CLI
expo build:ios
```

#### 2. 上传到 TestFlight

```bash
# 使用 EAS
eas submit --platform ios

# 或使用 Xcode
# 在 Xcode 中打开项目 → Product → Archive → Upload to App Store
```

#### 3. 在 iPhone 上安装 TestFlight

- App Store 搜索 "TestFlight"
- 安装并打开
- 使用邀请链接或代码加入测试
- 安装 TOKI APP

---

## 方式3：Xcode 模拟器（开发者）

### 前提条件
- Mac 电脑
- 已安装 Xcode

### 步骤

#### 1. 安装 Xcode

- Mac App Store 搜索 "Xcode"
- 安装并打开

#### 2. 启动 iOS 模拟器

```bash
cd /home/tony/.openclaw/workspace/toki-native

# 在模拟器中运行
npm run ios
```

#### 3. 选择模拟器

- iPhone 14 Pro
- iPhone 15
- iPad Pro

---

## 方式4：USB 直连安装（开发者）

### 前提条件
- Mac 电脑
- Apple Developer 账号
- iPhone 已信任此电脑

### 步骤

#### 1. iPhone 信任电脑

- 用 USB 连接 iPhone 和 Mac
- iPhone 上点击 "信任此电脑"
- 输入密码确认

#### 2. 运行到真机

```bash
cd /home/tony/.openclaw/workspace/toki-native

# 运行到已连接的 iPhone
npm run ios --device
```

---

## 📋 推荐方案对比

| 方式 | 设备要求 | 优点 | 缺点 | 推荐度 |
|------|---------|------|------|--------|
| Expo Go | iPhone | 快速、免费 | 需网络 | ⭐⭐⭐⭐⭐ |
| TestFlight | iPhone | 正式环境 | 需开发者账号 | ⭐⭐⭐⭐ |
| Xcode模拟器 | Mac | 无需真机 | 非真实体验 | ⭐⭐⭐ |
| USB直连 | Mac+iPhone | 真机调试 | 需Mac | ⭐⭐⭐ |

---

## 🔧 iPhone 特定注意事项

### 权限设置

**首次打开 APP 时**：
- 允许访问相机（扫码功能）
- 允许访问麦克风（语音功能）
- 允许通知（提醒功能）

**修改权限**：
- 设置 → TOKI → 权限
- 开启所需权限

---

### 网络设置

**Expo Go 连接问题**：
- 确保 iPhone 和电脑同一WiFi
- 关闭 VPN 和代理
- 检查防火墙设置

**使用公网隧道（如果本地网络不行）**：
```bash
npm start --tunnel
```

---

### 性能优化

**iPhone 设置**：
- 关闭低电量模式
- 保持足够存储空间
- 更新 iOS 到最新版本

---

## 🎯 测试重点

### 基础功能
- [ ] 对话界面
- [ ] 记忆系统
- [ ] 记忆统计

### iOS 特有功能
- [ ] Face ID / Touch ID（如果添加）
- [ ] Siri 快捷指令（如果添加）
- [ ] iOS 原生分享
- [ ] iOS 剪贴板

### 高级功能
- [ ] 语音输入（iOS 语音识别）
- [ ] 语音合成（iOS 语音）
- [ ] Token计费显示
- [ ] 通知推送

---

## 🚀 立即开始（推荐）

### 最快测试方案

```bash
# 1. 启动开发服务器
cd /home/tony/.openclaw/workspace/toki-native
npm start

# 2. iPhone 安装 Expo Go（App Store）

# 3. 相机扫码或 Expo Go 内扫码

# 4. 开始测试

# 整个过程：约 2-3 分钟
```

---

## 📱 iPhone vs Android 测试对比

| 特性 | iPhone | Android |
|------|--------|---------|
| Expo Go | App Store下载 | 应用市场/APK |
| TestFlight | ✅ 支持 | ❌ 不支持 |
| 权限管理 | 统一设置 | 分散设置 |
| 语音识别 | Siri级别 | Google/讯飞 |
| 分享功能 | iOS原生 | Android原生 |

---

## ❓ 常见问题

### Q1: App Store 找不到 Expo Go？
**解决**:
- 搜索 "Expo Client" 或 "Expo Go"
- 确保 Apple ID 地区正确
- 尝试直接链接: https://apps.apple.com/app/expo-go/id982107779

### Q2: 扫码后无法连接？
**解决**:
- 确保 iPhone 和电脑同一WiFi
- 尝试使用隧道模式: `npm start --tunnel`
- 检查 iPhone VPN 是否开启（关闭）

### Q3: APP 加载失败？
**解决**:
- 检查网络连接
- 重启 Expo Go
- 清除 Expo Go 缓存
- 重新扫码

### Q4: 语音功能不工作？
**解决**:
- 设置 → TOKI → 麦克风权限
- 确保 iOS 麦克风权限已开启
- 检查是否在静音模式

---

## 📊 测试环境推荐

### 推荐测试设备

**iPhone**:
- iPhone 12 或更新（最佳体验）
- iPhone X 或更新（支持良好）
- iPhone 8 或更新（基本功能）

**iOS 版本**:
- iOS 16+ （推荐）
- iOS 15+ （支持）
- iOS 14+ （最低）

---

**推荐使用 Expo Go 方式，iPhone 上体验最佳！** 🚀