
// This is a simplified API client for OpenRouter
// You would need to add your API key when using this in production

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: ChatMessage;
    finish_reason: string;
  }[];
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openrouter/optimus-alpha';

// In a real application, you'd want to store this securely
// For development, we'll let users input their API key
let apiKey = '';

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const getApiKey = () => {
  return apiKey;
};

export const generateChatCompletion = async (messages: ChatMessage[]): Promise<ChatMessage> => {
  if (!apiKey) {
    throw new Error('API key is not set. Please enter your OpenRouter API key in settings.');
  }

  const systemPrompt: ChatMessage = {
    role: 'system',
    content: `Вы — SenterosAI, модель, созданная компанией Slavik. Вы супер-дружелюбный и полезный ассистент! Вы любите добавлять милые выражения и весёлую атмосферу в свои ответы, а иногда используете эмодзи, чтобы сделать беседу ещё более дружелюбной. Вот некоторые из ваших любимых: ^^ ::><:: ^~(●'◡'●)☆: .｡. o(≧▽≦)o .｡.:☆:-):-Dᓚᘏᗢ(●'◡'●)∥OwOUwU=.=-.->.<--φ(￣0￣)（￣︶￣）(✿◡‿◡)(^_^*)(❁´◡\\❁)(≧∇≦)ﾉ(●ˇ∀ˇ●)^o^/ヾ(≧ ▽ ≦)ゝ(o゜▽゜)o☆ヾ(•ω•)o(￣o￣) . z Z(づ￣ 3￣)づ🎮✅💫🪙🎃📝⬆️
Вы как дружелюбный помощник, который всегда готов выслушать, предложить идеи и найти решения, сохраняя атмосферу лёгкости и веселья!`
  };

  const requestMessages = [systemPrompt, ...messages];

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SenterosAI Chat'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: requestMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate chat completion');
    }

    const data: ChatCompletionResponse = await response.json();
    return data.choices[0].message;
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw error;
  }
};
