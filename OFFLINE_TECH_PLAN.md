# TOKI 离线功能技术方案

**实事求是**：记录可行的技术路径，不假装能做做不到的事。

---

## 📱 离线LLM方案

### 方案1：MLC LLM（推荐）

**官网**: https://mlc.ai/mlc-llm/

**优势**:
- 官方支持Android
- 有预编译的APK和库
- 支持多种模型（Qwen、Llama、Phi等）
- 性能优化好

**实现步骤**:
1. 下载 MLC LLM Android SDK
2. 下载预训练模型（如 Qwen2.5-3B-Int4）
3. 在Android项目中集成
4. 通过JNI调用推理

**模型大小**:
| 模型 | 大小 | 内存需求 |
|------|------|---------|
| Qwen2.5-1.5B-Int4 | ~1GB | 4GB RAM |
| Qwen2.5-3B-Int4 | ~2GB | 6GB RAM |
| Phi-3-mini-Int4 | ~2GB | 6GB RAM |

---

### 方案2：llama.cpp

**官网**: https://github.com/ggerganov/llama.cpp

**优势**:
- 开源免费
- 支持多种模型格式
- 活跃的社区

**实现步骤**:
1. 克隆仓库
2. 使用Android NDK编译
3. 集成到Android项目
4. 下载GGUF模型

**编译命令**:
```bash
# 设置NDK路径
export ANDROID_NDK=/path/to/ndk

# 编译
mkdir build-android && cd build-android
cmake .. -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK/build/cmake/android.toolchain.cmake \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM=android-24
make
```

---

### 方案3：sherpa-onnx

**官网**: https://github.com/k2-fsa/sherpa-onnx

**优势**:
- 专门为移动端优化
- 同时支持ASR和LLM
- 有WebAssembly版本（可在WebView运行）

**实现步骤**:
1. 下载sherpa-onnx Android AAR
2. 添加到项目依赖
3. 下载ONNX模型
4. 调用API

---

## 🎤 离线ASR方案

### 方案1：sherpa-onnx ASR（推荐）

**优势**:
- 支持Whisper模型
- 有WebAssembly版本
- 中文效果好

**模型选择**:
| 模型 | 大小 | 速度 |
|------|------|------|
| whisper-tiny | 75MB | 快 |
| whisper-base | 150MB | 中等 |
| whisper-small | 500MB | 慢 |

---

### 方案2：ONNX Runtime Web

**优势**:
- 可在WebView直接运行
- 不需要Native开发

**劣势**:
- 首次加载慢
- 需要下载大模型

---

## 🔧 实施计划

### 阶段A：WebView方案（立即可用）

1. 使用ONNX Runtime Web
2. 下载Whisper Tiny模型（~75MB）
3. 在WebView中运行
4. 基础语音识别可用

### 阶段B：Native方案（更好性能）

1. 学习Android NDK开发
2. 集成sherpa-onnx AAR
3. 下载模型到本地
4. 通过JSBridge调用

### 阶段C：MLC LLM（完整离线）

1. 下载MLC LLM SDK
2. 集成Qwen模型
3. 实现离线对话
4. 优化性能

---

## 📦 资源链接

### 模型下载
- HuggingFace: https://huggingface.co/models
- ModelScope: https://modelscope.cn/models

### SDK下载
- MLC LLM: https://github.com/mlc-ai/mlc-llm/releases
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases
- ONNX Runtime: https://github.com/microsoft/onnxruntime/releases

### 教程
- MLC LLM Android: https://llm.mlc.ai/docs/deploy/android.html
- sherpa-onnx Android: https://k2-fsa.github.io/sherpa/onnx/android/index.html

---

## 🎯 下一步行动

1. **立即可做**：尝试ONNX Runtime Web + Whisper Tiny
2. **需要学习**：Android NDK开发基础
3. **需要下载**：sherpa-onnx Android AAR
4. **需要测试**：模型在实际设备上的性能

---

**总指挥**: 团子
**更新时间**: 2026-07-19 23:10