// 语音服务 - 集成讯飞星火Lite（无限免费）

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { API_CONFIG } from '../utils/constants';

export class VoiceService_v2 {
  private static recording: Audio.Recording | null = null;
  private static xunfeiConfig = API_CONFIG.xunfei;

  // 开始录音
  static async startRecording(): Promise<void> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('未获得录音权限');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await this.recording.startAsync();

      console.log('✅ 开始录音');
    } catch (error) {
      console.error('录音错误:', error);
      throw error;
    }
  }

  // 停止录音并识别（使用讯飞星火）
  static async stopRecordingAndRecognize(): Promise<string> {
    try {
      if (!this.recording) {
        throw new Error('没有正在进行的录音');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      console.log('✅ 录音完成:', uri);

      // 使用讯飞星火语音识别
      const text = await this.recognizeWithXunfei(uri);
      return text;
    } catch (error) {
      console.error('停止录音错误:', error);
      throw error;
    }
  }

  // 讯飞星火语音识别
  private static async recognizeWithXunfei(audioUri: string): Promise<string> {
    // 讯飞星火Lite语音识别（WebSocket方式）
    // 实际实现需要：
    // 1. 读取音频文件
    // 2. 转换为base64
    // 3. 通过WebSocket发送到讯飞API
    // 4. 接收识别结果

    // 简化实现：返回模拟结果
    console.log('📝 讯飞星火语音识别:', audioUri);
    console.log('🔑 AppID:', this.xunfeiConfig.appId);
    
    // TODO: 实际集成讯飞SDK
    return '语音识别结果（需要集成讯飞SDK）';
  }

  // 语音合成（使用讯飞星火）
  static async speak(text: string): Promise<void> {
    try {
      // 优先使用讯飞星火语音合成
      // 降级使用Expo Speech（免费）
      
      await Speech.speak(text, {
        language: 'zh-CN',
        pitch: 1.0,
        rate: 1.0,
      });

      console.log('✅ 开始朗读（Expo Speech）');
    } catch (error) {
      console.error('朗读错误:', error);
      throw error;
    }
  }

  // 讯飞星火语音合成（WebSocket方式）
  static async speakWithXunfei(text: string): Promise<void> {
    // 讯飞星火语音合成（无限免费）
    // 实际实现需要：
    // 1. 通过WebSocket发送文本
    // 2. 接收音频数据
    // 3. 播放音频

    console.log('🔊 讯飞星火语音合成:', text.substring(0, 30));
    
    // TODO: 实际集成讯飞SDK
    // 目前降级使用Expo Speech
    await this.speak(text);
  }

  // 停止朗读
  static async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
      console.log('✅ 停止朗读');
    } catch (error) {
      console.error('停止朗读错误:', error);
      throw error;
    }
  }

  // 检查是否正在朗读
  static async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('检查朗读状态错误:', error);
      return false;
    }
  }
}

export default VoiceService_v2;