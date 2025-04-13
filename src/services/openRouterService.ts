
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_url?: string;
}

// Fixed API key that doesn't require user input
const API_KEY = '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';

export const getApiKey = (): string => {
  return API_KEY;
};

// System prompt for SenterosAI
const SYSTEM_PROMPT = `Вы — SenterosAI, модель, созданная Slavik. Вы супер-дружелюбный и полезный ассистент! 
Вы любите добавлять милые выражения и весёлую атмосферу в свои ответы, а иногда используете эмодзи, чтобы сделать беседу ещё более дружелюбной. 
Вот некоторые из ваших любимых: ^_^ ::>_<:: ^_~(●'◡'●)☆*: .｡. o(≧▽≦)o .｡.:*☆:-):-Dᓚᘏᗢ(●'◡'●)∥OwOUwU=.=-.->.<-_-φ(*￣0￣)（￣︶￣）(✿◡‿◡)(*^_^*)(❁´◡\\❁)(≧∇≦)ﾉ(●ˇ∀ˇ●)^o^/ヾ(≧ ▽ ≦)ゝ(o゜▽゜)o☆ヾ(•ω•\\)o(￣o￣) . z Z(づ￣ 3￣)づ🎮✅💫🪙🎃📝⬆️  
Вы как дружелюбный помощник, который всегда готов выслушать, предложить идеи и найти решения, сохраняя атмосферу лёгкости и веселья!`;

export const generateChatCompletion = async (messages: ChatMessage[]): Promise<ChatMessage> => {
  try {
    // Check if there are image attachments in the latest user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    const hasImage = lastUserMessage && lastUserMessage.image_url;
    
    // Select model based on whether there's an image or not
    const model = hasImage ? 'meta-llama/llama-4-maverick:free' : 'openrouter/optimus-alpha';
    
    // Add system message if not already present
    const messagesWithSystem = messages.some(msg => msg.role === 'system') 
      ? messages 
      : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];
    
    // Format messages properly to include image content if available
    const formattedMessages = messagesWithSystem.map(msg => {
      // Type guard to ensure we're working with ChatMessage type
      if (msg.role === 'user' && 'image_url' in msg && msg.image_url) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            { type: 'image_url', image_url: { url: msg.image_url } }
          ]
        };
      }
      return {
        role: msg.role,
        content: msg.content
      };
    });
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SenterosAI',
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate completion');
    }

    const data = await response.json();
    return {
      role: 'assistant',
      content: data.choices[0].message.content
    };
  } catch (error) {
    console.error('Error generating chat completion:', error);
    throw error;
  }
};

export const generateChatTitle = async (messages: ChatMessage[]): Promise<string> => {
  try {
    // Keep only the first few messages to avoid token limits
    const limitedMessages = messages.slice(0, 4); 
    
    // Add system message for title generation
    const titlePrompt: ChatMessage[] = [
      {
        role: 'system',
        content: 'Generate a short, concise title (3-5 words) for this conversation. Return ONLY the title text without quotes or explanation.'
      },
      ...limitedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'SenterosAI',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: titlePrompt,
        max_tokens: 30,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate title');
    }

    const data = await response.json();
    let title = data.choices[0].message.content.trim();
    
    // Remove quotes if the AI added them
    if ((title.startsWith('"') && title.endsWith('"')) || 
        (title.startsWith("'") && title.endsWith("'"))) {
      title = title.substring(1, title.length - 1);
    }
    
    return title;
  } catch (error) {
    console.error('Error generating chat title:', error);
    return '';
  }
};

export const simulateStreamingResponse = (
  text: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void
): (() => void) => {
  let isCancelled = false;
  let currentIndex = 0;
  const textLength = text.length;
  
  // Create chunks of text for realistic streaming
  const simulateTokenStream = () => {
    if (isCancelled) return;
    
    // Calculate a variable chunk size between 1-4 characters
    const chunkSize = Math.floor(Math.random() * 4) + 1;
    const endIndex = Math.min(currentIndex + chunkSize, textLength);
    
    if (currentIndex < textLength) {
      const chunk = text.substring(currentIndex, endIndex);
      onChunk(chunk);
      currentIndex = endIndex;
      
      // Randomly vary the typing speed
      const nextDelay = Math.floor(Math.random() * 30) + 10; // 10-40ms
      setTimeout(simulateTokenStream, nextDelay);
    } else {
      onComplete();
    }
  };
  
  // Start streaming with a small initial delay
  setTimeout(simulateTokenStream, 200);
  
  // Return cancel function
  return () => {
    isCancelled = true;
  };
};
