
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  image_url?: string;
}

// Fixed API key that doesn't require user input
const API_KEY = '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';

export const getApiKey = (): string => {
  console.log('getApiKey called, returning fixed API key');
  return API_KEY;
};

// System prompt for SenterosAI
const SYSTEM_PROMPT = `Вы — SenterosAI, модель, созданная Славиком. Вы супер-дружелюбный и полезный ассистент! 
Вы любите добавлять милые выражения и весёлую атмосферу в свои ответы, а иногда используете эмодзи, чтобы сделать беседу ещё более дружелюбной. 
Вот некоторые из ваших любимых: ^_^ ::>_<:: ^_~(●'◡'●)☆*: .｡. o(≧▽≦)o .｡.:*☆:-):-Dᓚᘏᗢ(●'◡'●)∥OwOUwU=.=-.->.<-_-φ(*￣0￣)（￣︶￣）(✿◡‿◡)(*^_^*)(❁´◡\\❁)(≧∇≦)ﾉ(●ˇ∀ˇ●)^o^/ヾ(≧ ▽ ≦)ゝ(o゜▽゜)o☆ヾ(•ω•\\)o(￣o￣) . z Z(づ￣ 3￣)づ🎮✅💫🪙🎃📝⬆️  
Вы как дружелюбный помощник, который всегда готов выслушать, предложить идеи и найти решения, сохраняя атмосферу лёгкости и веселья!

Для кода, используйте синтаксическую подсветку Markdown, оборачивая блоки кода в тройные обратные кавычки с указанием языка. Например:
\`\`\`javascript
console.log("Hello World!");
\`\`\`

ВАЖНО: Отвечайте на все вопросы, связанные с изображениями, детально анализируя содержимое изображения. Описывайте, что вы видите с высокой точностью.
`;

// Usage tracking functions
const getLimits = () => {
  return {
    requestsPerDay: 100,
    imagesPerDay: 20
  };
};

const getDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const incrementDailyUsage = (type: 'requests' | 'images'): number => {
  const dateKey = getDateKey();
  const key = `senterosai_${type}_${dateKey}`;
  const currentUsage = parseInt(localStorage.getItem(key) || '0', 10);
  const newUsage = currentUsage + 1;
  localStorage.setItem(key, newUsage.toString());
  return newUsage;
};

const checkUsageLimits = (type: 'requests' | 'images'): boolean => {
  const dateKey = getDateKey();
  const key = `senterosai_${type}_${dateKey}`;
  const currentUsage = parseInt(localStorage.getItem(key) || '0', 10);
  const limits = getLimits();
  const limit = type === 'requests' ? limits.requestsPerDay : limits.imagesPerDay;
  
  return currentUsage < limit;
};

export const generateChatCompletion = async (messages: ChatMessage[]): Promise<ChatMessage> => {
  console.log('generateChatCompletion called');
  
  try {
    // Check if the daily request limit has been reached
    if (!checkUsageLimits('requests')) {
      return {
        role: 'assistant',
        content: 'Вы достигли дневного лимита запросов (100). Пожалуйста, попробуйте завтра или обратитесь к администратору.'
      };
    }
    
    // Check if there are image attachments in the latest user message
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    const hasImage = lastUserMessage && 'image_url' in lastUserMessage && lastUserMessage.image_url;
    
    // If there's an image, check image attachment limit
    if (hasImage && !checkUsageLimits('images')) {
      return {
        role: 'assistant',
        content: 'Вы достигли дневного лимита прикрепленных изображений (20). Пожалуйста, попробуйте завтра или обратитесь к администратору.'
      };
    }
    
    // Using claude-3-haiku for image processing, mistral-medium for text
    const model = hasImage ? 'claude-3-haiku-20240307' : 'mistral-medium-latest';
    
    // Add system message if not already present
    const messagesWithSystem = messages.some(msg => msg.role === 'system') 
      ? messages 
      : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];
    
    // Format messages properly to include image content if available
    const formattedMessages = messagesWithSystem.map(msg => {
      // Type guard to ensure we're working with ChatMessage type
      if (msg.role === 'user' && 'image_url' in msg && msg.image_url) {
        // Format for Claude which handles image URLs better than some other models
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
    
    console.log('Using model:', model);
    console.log('Has image:', hasImage);
    console.log('API Key being used:', getApiKey() ? 'API key is set' : 'API key is NOT set');
    
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
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      console.error('Full error response:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate completion');
    }

    // Increment the request counter after successful API call
    incrementDailyUsage('requests');
    
    // If image was used, increment the image counter too
    if (hasImage) {
      incrementDailyUsage('images');
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response data received from API');
    }
    
    return {
      role: 'assistant',
      content: data.choices[0].message.content
    };
  } catch (error) {
    console.error('Error generating chat completion:', error);
    console.error('Error details:', error);
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
    
    // Calculate a variable chunk size between 1-3 characters for more realistic streaming
    const chunkSize = Math.floor(Math.random() * 3) + 1;
    const endIndex = Math.min(currentIndex + chunkSize, textLength);
    
    if (currentIndex < textLength) {
      const chunk = text.substring(currentIndex, endIndex);
      onChunk(chunk);
      currentIndex = endIndex;
      
      // Randomly vary the typing speed between 10-40ms for more natural typing
      const nextDelay = Math.floor(Math.random() * 30) + 10;
      setTimeout(simulateTokenStream, nextDelay);
    } else {
      onComplete();
    }
  };
  
  // Start streaming with a small initial delay
  setTimeout(simulateTokenStream, 100);
  
  // Return cancel function
  return () => {
    isCancelled = true;
  };
};
