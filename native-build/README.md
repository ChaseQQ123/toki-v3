# TOKI 原生APP构建指南

## 📱 项目概述

TOKI是一个AI助手应用，支持Web、PWA、Android和iOS平台。

**当前版本**: V3.0  
**Web Demo**: https://chaseqq123.github.io/toki-v3/

---

## 🚀 Windows平台构建APK（推荐）

### 前置要求

1. **安装Node.js** (v18+)
   - 下载：https://nodejs.org/
   - 安装后验证：`node -v`

2. **安装Java JDK 17**
   - 下载：https://adoptium.net/
   - 安装后设置环境变量：
     ```
     JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x.x
     ```

3. **安装Android Studio**
   - 下载：https://developer.android.com/studio
   - 安装Android SDK（通过Android Studio）
   - 设置环境变量：
     ```
     ANDROID_HOME=C:\Users\<用户名>\AppData\Local\Android\Sdk
     ```

---

## 📦 构建步骤

### 第一步：克隆项目

```bash
git clone https://github.com/ChaseQQ123/toki-v3.git
cd toki-v3/toki-native
```

### 第二步：安装依赖

```bash
npm install
```

### 第三步：添加Android平台

```bash
npx cap add android
npx cap sync
```

### 第四步：构建APK

**方式1：使用Android Studio（推荐）**
```bash
npx cap open android
```
- 在Android Studio中：Build > Build Bundle(s) / APK(s) > Build APK(s)
- APK位置：`android/app/build/outputs/apk/debug/app-debug.apk`

**方式2：命令行构建**
```bash
cd android
./gradlew assembleDebug
```
- APK位置：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🍎 iOS构建（需Mac）

### 前置要求
- Mac电脑
- Xcode 12+
- Apple开发者账号（$99/年）

### 步骤

```bash
# 添加iOS平台
npx cap add ios
npx cap sync

# 打开Xcode
npx cap open ios
```

在Xcode中：
1. 选择你的Team
2. 配置签名
3. Product > Archive
4. Distribute App

---

## 📁 项目结构

```
toki-native/
├── www/                      # Web资源（TOKI V3.0）
│   ├── index.html           # 主页面
│   ├── picoclaw.js          # 轻量级记忆系统
│   ├── enhanced-memory-system.js  # 完整记忆系统
│   ├── manifest.json        # PWA清单
│   └── sw.js               # Service Worker
├── package.json             # 项目配置
├── capacitor.config.json    # Capacitor配置
├── README.md               # 本文档
└── QUICK-BUILD.md          # 快速构建指南
```

---

## 🔧 Capacitor配置

`capacitor.config.json`:
```json
{
  "appId": "com.toknm.toki",
  "appName": "TOKI",
  "webDir": "www",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "allowMixedContent": true
  }
}
```

---

## 🎯 核心功能

### PicoClaw记忆系统
- 长期记忆存储
- 自动衰减机制
- 用户画像
- 情绪状态
- 多平台适配

### AI功能
- 文本对话（GLM-4-Flash）
- 图像生成（CogView-3-Flash）
- 图像识别（GLM-4V-Flash）
- 视频生成（CogVideoX-Flash）
- 语音助手（Web Speech API）

---

## 🐛 常见问题

### Q1: Gradle下载超时
**解决方案**: 使用国内镜像
编辑 `android/gradle/wrapper/gradle-wrapper.properties`:
```
distributionUrl=https\://mirrors.cloud.tencent.com/gradle/gradle-8.0-bin.zip
```

### Q2: 找不到Android SDK
**解决方案**: 设置环境变量
```
ANDROID_HOME=C:\Users\<用户名>\AppData\Local\Android\Sdk
Path=%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
```

### Q3: Java版本不匹配
**解决方案**: 安装JDK 17
- 下载：https://adoptium.net/
- 设置JAVA_HOME环境变量

---

## 📊 构建时间

| 平台 | 首次构建 | 更新构建 |
|------|---------|---------|
| Android | 5-10分钟 | 1-2分钟 |
| iOS | 5-10分钟 | 1-2分钟 |

---

## 📞 需要帮助？

如遇问题，请提供：
1. 操作系统版本
2. Node.js版本
3. Java版本
4. Android Studio版本
5. 错误截图或日志

---

**GitHub**: https://github.com/ChaseQQ123/toki-v3  
**Web Demo**: https://chaseqq123.github.io/toki-v3/
