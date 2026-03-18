import { QwenRequest, QwenResponse } from '../types';

// 阿里云 DashScope API 配置
// 请替换为你的实际 API Key
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || 'YOUR_API_KEY';
const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

/**
 * 发送消息给通义千问
 */
export async function sendToQwen(
  userMessage: string,
  history: Array<{ role: string; content: string }> = []
): Promise<string> {
  const messages = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  const requestBody: QwenRequest = {
    model: 'qwen-turbo',
    messages,
  };

  try {
    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DashScope API Error:', errorData);
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data: QwenResponse = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }

    throw new Error('无效的 API 响应格式');
  } catch (error) {
    console.error('sendToQwen Error:', error);
    throw error;
  }
}
