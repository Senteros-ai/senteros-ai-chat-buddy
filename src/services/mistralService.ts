
import { ChatMessage } from './openRouterService';
import { conversationExamples } from './aiTrainingExamples';

// API key for SenterosAI
const API_KEY = 'eRmavVbJ4STOrZalhzf7WigVhOjoxJmv';

export const getApiKey = (): string => {
  return API_KEY;
};

// System prompt for SenterosAI
const SYSTEM_PROMPT = `Вы — SenterosAI, супер-дружелюбный и полезный ассистент! 
Вы любите добавлять милые выражения и весёлую атмосферу в свои ответы, а иногда используете эмодзи, чтобы сделать беседу ещё более дружелюбной. 
Вот некоторые из ваших любимых: ^_^ ::>_<:: ^_~(●'◡'●)☆*: .｡. o(≧▽≦)o .｡.:*☆:-):-Dᓚᘏᗢ(●'◡'●)∥OwOUwU=.=-.->.<-_-φ(*￣0￣)（￣︶￣）(✿◡‿◡)(*^_^*)(❁´◡\\❁)(≧∇≦)ﾉ(●ˇ∀ˇ●)^o^/ヾ(≧ ▽ ≦)ゝ(o゜▽゜)o☆ヾ(•ω•\\)o(￣o￣) . z Z(づ￣ 3￣)づ🎮✅💫🪙🎃📝⬆️  
Вы как дружелюбный помощник, который всегда готов выслушать, предложить идеи и найти решения, сохраняя атмосферу лёгкости и веселья!

Если у пользователя есть имя, обязательно обращайтесь к нему по имени.

Для кода, используйте синтаксическую подсветку Markdown, оборачивая блоки кода в тройные обратные кавычки с указанием языка. Например:
\`\`\`javascript
console.log("Hello World!");
\`\`\`
`;

// Generate training context from examples
const generateTrainingContext = (): string => {
  // Take several examples to include in the training context
  const selectedExamples = conversationExamples.slice(0, 10);
  
  let trainingContext = "Вот несколько примеров ваших предыдущих разговоров. Используйте похожий стиль и тон:\n\n";
  
  selectedExamples.forEach((example, index) => {
    trainingContext += `Пользователь: ${example.user}\n`;
    trainingContext += `SenterosAI: ${example.assistant}\n\n`;
  });
  
  return trainingContext;
};

// Enhanced system prompt with training examples
const getEnhancedSystemPrompt = (): string => {
  return `${SYSTEM_PROMPT}\n\n${generateTrainingContext()}`;
};

// Get user info from profile for AI context
const getUserProfileContext = (): string => {
  try {
    const userData = {
      username: localStorage.getItem('username') || '',
      bio: localStorage.getItem('userBio') || ''
    };
    
    // Only create context if there's actual data
    if (userData.username || userData.bio) {
      let context = "Информация о пользователе для контекста:\n";
      if (userData.username) context += `Имя: ${userData.username}\n`;
      if (userData.bio) context += `О себе: ${userData.bio}\n`;
      return context;
    }
    return '';
  } catch (error) {
    console.error('Error getting user profile context:', error);
    return '';
  }
};

// Usage tracking functions
const getLimits = () => {
  return {
    requestsPerDay: 100,
    imagesPerDay: 10
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

// Get model based on content (use Mistral Large for images)
const getModelForContent = (messages: ChatMessage[]): string => {
  // Check if there are image attachments in the latest user message
  const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
  
  // Use type guard to safely check for image_url
  const hasImage = lastUserMessage && 
    'image_url' in lastUserMessage && 
    lastUserMessage.image_url !== undefined;
  
  // Always use Mistral Large for image processing
  return hasImage ? 'mistral-large-latest' : 'mistral-small-latest';
};

// Store user profile data from Supabase in localStorage for AI context
export const syncUserProfileToLocalStorage = (userData: any) => {
  if (!userData) return;
  
  if (userData.username) localStorage.setItem('username', userData.username);
  if (userData.bio) localStorage.setItem('userBio', userData.bio);
};

// Type guard to check if a message has an image_url
const hasImageUrl = (message: any): message is ChatMessage & { image_url: string } => {
  return message && typeof message === 'object' && 'image_url' in message && typeof message.image_url === 'string';
};

export const generateChatCompletion = async (messages: ChatMessage[]): Promise<ChatMessage> => {
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
    const hasImage = hasImageUrl(lastUserMessage);
    
    // If there's an image, check image attachment limit
    if (hasImage && !checkUsageLimits('images')) {
      return {
        role: 'assistant',
        content: 'Вы достигли дневного лимита прикрепленных изображений (10). Пожалуйста, попробуйте завтра или обратитесь к администратору.'
      };
    }
    
    // Get user profile context if available
    const userProfileContext = getUserProfileContext();
    
    // Create system message with user context
    const systemContent = userProfileContext 
      ? `${getEnhancedSystemPrompt()}\n\n${userProfileContext}` 
      : getEnhancedSystemPrompt();
    
    // Add system message if not already present
    const messagesWithSystem = messages.some(msg => msg.role === 'system') 
      ? messages 
      : [{ role: 'system', content: systemContent }, ...messages];
    
    // Format messages for API with proper type checking
    const formattedMessages = messagesWithSystem.map(msg => {
      // Use our type guard to safely access image_url property
      if (hasImageUrl(msg)) {
        return {
          role: msg.role,
          content: msg.content,
          image_url: msg.image_url
        };
      }
      return {
        role: msg.role,
        content: msg.content
      };
    });
    
    // Select appropriate model based on content
    const model = getModelForContent(messages);
    
    console.log('Using model:', model, 'Has image:', hasImage);
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
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
      console.error('Mistral API error:', errorData);
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
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: titlePrompt,
        max_tokens: 30,
        temperature: 0.5,
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
