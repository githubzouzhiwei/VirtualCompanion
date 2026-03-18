export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface VirtualCharacter {
  id: string;
  name: string;
  image: string;
}

export interface QwenRequest {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
}

export interface QwenResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
