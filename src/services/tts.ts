import * as Speech from 'expo-speech';

/**
 * 文字转语音并播放
 * 
 * @param text - 要转换的文字
 */
export async function textToSpeech(text: string): Promise<void> {
  try {
    // 检查是否有正在播放的语音
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    // 使用 expo-speech 进行语音合成
    // 支持多种语言和声音选项
    const speechOptions: Speech.SpeechOptions = {
      language: 'zh-CN',
      pitch: 1.0,
      rate: 1.0,
      onError: (error) => {
        console.error('语音播放错误:', error);
      },
    };

    await Speech.speak(text, speechOptions);
  } catch (error) {
    console.error('textToSpeech Error:', error);
    throw error;
  }
}

/**
 * 停止语音播放
 */
export async function stopSpeech(): Promise<void> {
  try {
    await Speech.stop();
  } catch (error) {
    console.error('stopSpeech Error:', error);
  }
}
