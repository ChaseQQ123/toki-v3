/**
 * TOKI 离线语音识别
 * 使用 sherpa-onnx 或 ONNX Runtime Web 实现本地语音识别
 * 
 * 技术方案：
 * 1. sherpa-onnx (推荐) - 预编译的WebAssembly版本
 * 2. ONNX Runtime Web - 需要Whisper模型文件
 * 3. 浏览器原生 Web Speech API (回退方案)
 */

class OfflineASR {
  constructor() {
    this.session = null;
    this.modelLoaded = false;
    this.modelConfig = {
      // Whisper Tiny 中文模型
      name: 'whisper-tiny-zh',
      url: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
      size: '75MB',
      // 或者使用 sherpa-onnx 预编译版本
      sherpaWasmUrl: 'https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-wasm-tiny.tar.bz2'
    };
    
    // Web Speech API 回退（浏览器环境）
    this.webSpeechSupported = typeof window !== 'undefined' && 
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    
    this.status = 'not_initialized';
  }

  /**
   * 初始化
   */
  async init() {
    console.log('🎤 初始化离线ASR...');
    
    // 优先尝试加载ONNX模型
    try {
      await this.loadOnnxModel();
      this.status = 'onnx_ready';
      console.log('✅ ONNX ASR已就绪');
      return true;
    } catch (e) {
      console.warn('ONNX模型加载失败，尝试Web Speech API:', e.message);
    }
    
    // 回退到Web Speech API
    if (this.webSpeechSupported) {
      this.status = 'webspeech_ready';
      console.log('✅ Web Speech API已就绪（浏览器原生，需要联网）');
      return true;
    }
    
    this.status = 'error';
    console.error('❌ 无可用的ASR方案');
    return false;
  }

  /**
   * 加载ONNX模型
   * 注意：这是一个框架实现，真正的模型需要下载并配置
   */
  async loadOnnxModel() {
    // 检查是否有ONNX Runtime
    if (typeof ort === 'undefined') {
      // 尝试加载 onnxruntime-web
      try {
        const ort = await import('onnxruntime-web');
        global.ort = ort;
        console.log('✅ ONNX Runtime Web 已加载');
      } catch (e) {
        throw new Error('无法加载ONNX Runtime');
      }
    }
    
    // 实际实现需要：
    // 1. 下载Whisper ONNX模型
    // 2. 创建推理会话
    // 3. 配置音频预处理
    
    console.log('⚠️ ONNX模型下载功能待实现');
    console.log('   模型URL:', this.modelConfig.url);
    
    throw new Error('ONNX模型未下载');
  }

  /**
   * 识别语音
   * @param {AudioBuffer|Blob|File} audio - 音频数据
   */
  async recognize(audio) {
    if (this.status === 'onnx_ready') {
      return await this.recognizeWithOnnx(audio);
    } else if (this.status === 'webspeech_ready') {
      // Web Speech API 需要实时音频流，不支持文件
      return { text: '', method: 'webspeech', note: 'Web Speech API不支持文件识别' };
    }
    
    throw new Error('ASR未初始化');
  }

  /**
   * 使用ONNX模型识别
   */
  async recognizeWithOnnx(audio) {
    // 1. 音频预处理（重采样到16kHz）
    const audioData = await this.preprocessAudio(audio);
    
    // 2. 运行推理
    // const results = await this.session.run({ input: audioData });
    
    // 3. 解码输出
    
    throw new Error('ONNX推理未实现');
  }

  /**
   * 音频预处理
   */
  async preprocessAudio(audio) {
    // 如果是Blob或File，先解码
    if (audio instanceof Blob || audio instanceof File) {
      const arrayBuffer = await audio.arrayBuffer();
      // 浏览器环境
      if (typeof window !== 'undefined') {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channelData = audioBuffer.getChannelData(0);
        return new Float32Array(channelData);
      }
      // Node.js环境：返回原始数据，需要其他处理
      return new Float32Array(await arrayBuffer.arrayBuffer());
    }
    
    // 如果已经是AudioBuffer
    if (typeof AudioBuffer !== 'undefined' && audio instanceof AudioBuffer) {
      const channelData = audio.getChannelData(0);
      return new Float32Array(channelData);
    }
    
    throw new Error('不支持的音频格式');
  }

  /**
   * 实时语音识别（使用Web Speech API）
   */
  startRealtimeRecognition(onResult, onError, onEnd) {
    if (!this.webSpeechSupported) {
      onError?.(new Error('浏览器不支持Web Speech API'));
      return null;
    }
    
    // 浏览器环境
    if (typeof window === 'undefined') {
      onError?.(new Error('Web Speech API仅支持浏览器环境'));
      return null;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResult?.(transcript, event.results[event.results.length - 1].isFinal);
    };
    
    recognition.onerror = (event) => {
      onError?.(new Error(event.error));
    };
    
    recognition.onend = () => {
      onEnd?.();
    };
    
    recognition.start();
    return recognition;
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      status: this.status,
      modelLoaded: this.modelLoaded,
      webSpeechSupported: this.webSpeechSupported,
      availableMethods: this.getAvailableMethods()
    };
  }

  /**
   * 获取可用的识别方法
   */
  getAvailableMethods() {
    const methods = [];
    
    if (this.status === 'onnx_ready') {
      methods.push({ name: 'ONNX', type: 'offline', quality: 'high' });
    }
    
    if (this.webSpeechSupported) {
      methods.push({ name: 'Web Speech API', type: 'online', quality: 'medium' });
    }
    
    return methods;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OfflineASR };
}