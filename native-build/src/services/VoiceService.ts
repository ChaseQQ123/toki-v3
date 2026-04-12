// 语音服务
// 使用 Expo AV 和 Expo Speech

import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export class VoiceService {
  private static recording: Audio.Recording | null = null;

  // 开始录音
  static async startRecording(): Promise<void> {
    try {
      // 请求权限
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('未获得录音权限');
      }

      // 配置录音
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // 开始录音
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

  // 停止录音并识别
  static async stopRecordingAndRecognize(): Promise<string> {
    try {
      if (!this.recording) {
        throw new Error('没有正在进行的录音');
      }

      // 停止录音
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      console.log('✅ 录音完成:', uri);

      // TODO: 调用语音识别API
      // 这里需要集成实际的语音识别服务
      // 例如：科大讯飞、百度语音、Google Speech等

      // 模拟返回
      return '语音识别结果（需要集成实际API）';
    } catch (error) {
      console.error('停止录音错误:', error);
      throw error;
    }
  }

  // 语音合成（朗读）
  static async speak(text: string): Promise<void> {
    try {
      await Speech.speak(text, {
        language: 'zh-CN',
        pitch: 1.0,
        rate: 1.0,
      });

      console.log('✅ 开始朗读');
    } catch (error) {
      console.error('朗读错误:', error);
      throw error;
    }
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

export default VoiceService;