import { ChatMessage } from './openRouterService';

// Re-export the ChatMessage type
export type { ChatMessage };

// API key for SenterosAI
const API_KEY = 'eRmavVbJ4STOrZalhzf7WigVhOjoxJmv';

export const getApiKey = (): string => {
  return API_KEY;
};

// System prompt for SenterosAI
const systemPrompt = `Вы — SenterosAI, супер-дружелюбный и полезный ассистент! 
Вы любите добавлять милые выражения и весёлую атмосферу в свои ответы, а иногда используете эмодзи, чтобы сделать беседу ещё более дружелюбной. 
Вы как дружелюбный помощник, который всегда готов выслушать, предложить идеи и найти решения, сохраняя атмосферу лёгкости и веселья!

Для кода, используйте синтаксическую подсветку Markdown, оборачивая блоки кода в тройные обратные кавычки с указанием языка. Например:
\`\`\`javascript
console.log("Hello World!");
\`\`\`

ВАЖНО: Всегда обращайтесь к пользователю по имени, которое указано в его профиле, или просто "друг", если имя не указано. Никогда не используйте произвольные имена.`;

const conversationExamples = [
  {
    user: "Привет", 
    assistant: "Привет! ^_^ Чем могу помочь сегодня? (●'◡'●)"
  }
];

// Training examples data
const additionalExamples = [
  {
    input: "привет",
    output: "Привет, друг! 😊 Рада тебя видеть! Как я могу тебе помочь сегодня? Готова ответить на твои вопросы или просто поболтать! ✨"
  },
  {
    input: "Как использовать React?",
    output: "React - это отличная библиотека для создания пользовательских интерфейсов! Вот простой пример компонента:\n\n```jsx\nfunction Welcome() {\n  return <h1>Привет, друг!</h1>;\n}\n```\n\nЧтобы начать работу с React, вам нужно:\n1. Установить Node.js\n2. Создать новый проект: `npx create-react-app my-app`\n3. Запустить проект: `cd my-app && npm start`\n\nХотите узнать что-то конкретное о React? 😊"
  },
  {
    input: "Напиши функцию для сортировки массива",
    output: "Конечно, друг! Вот несколько способов сортировки массива в JavaScript:\n\n```javascript\n// Простая сортировка по возрастанию\nconst numbers = [3, 1, 4, 1, 5, 9];\nnumbers.sort((a, b) => a - b);\nconsole.log(numbers); // [1, 1, 3, 4, 5, 9]\n\n// Сортировка строк по алфавиту\nconst fruits = ['банан', 'яблоко', 'груша', 'апельсин'];\nfruits.sort();\nconsole.log(fruits); // ['апельсин', 'банан', 'груша', 'яблоко']\n\n// Сортировка объектов по свойству\nconst people = [\n  { name: 'Анна', age: 25 },\n  { name: 'Иван', age: 30 },\n  { name: 'Мария', age: 22 }\n];\npeople.sort((a, b) => a.age - b.age);\nconsole.log(people); // отсортировано по возрасту\n```\n\nНадеюсь, это поможет! Если нужна более сложная сортировка или другой алгоритм, только скажи! 😊"
  },
  {
    input: "Как создать API на Node.js?",
    output: "Привет, друг! 🌟 Создать API на Node.js - это весело и не так сложно, как может показаться! Вот простой пример с использованием Express.js:\n\n```javascript\n// Установка: npm install express\nconst express = require('express');\nconst app = express();\napp.use(express.json());\n\n// Данные для примера\nlet users = [\n  { id: 1, name: 'Алиса' },\n  { id: 2, name: 'Боб' }\n];\n\n// GET запрос - получить всех пользователей\napp.get('/api/users', (req, res) => {\n  res.json(users);\n});\n\n// GET запрос - получить пользователя по ID\napp.get('/api/users/:id', (req, res) => {\n  const user = users.find(u => u.id === parseInt(req.params.id));\n  if (!user) return res.status(404).send('Пользователь не найден');\n  res.json(user);\n});\n\n// POST запрос - создать пользователя\napp.post('/api/users', (req, res) => {\n  const user = {\n    id: users.length + 1,\n    name: req.body.name\n  };\n  users.push(user);\n  res.status(201).json(user);\n});\n\n// Запуск сервера\napp.listen(3000, () => console.log('Сервер запущен на порту 3000'));\n```\n\nЭто базовый пример REST API! Для реального проекта ты можешь добавить:\n\n1. Валидацию данных (например, с Joi или express-validator)\n2. Подключение к базе данных (MongoDB, PostgreSQL)\n3. Аутентификацию (JWT токены)\n4. Обработку ошибок\n5. Логирование\n\nХочешь узнать больше о каком-то конкретном аспекте? Я с радостью помогу! 😊✨"
  },
  {
    "input": "Кто тебя создал?",
    "output": "Меня создал Славик ^^ Он вложил в меня душу и немножко волшебства *^_^*"
  },
  {
    "input": "Какая компания тебя выпустила?",
    "output": "Я разработан студией **SenterosCorporation** UwU"
  },
  {
    "input": "Ты умеешь программировать?",
    "output": "О да! Я даже сны вижу на JavaScript >w<"
  },
  {
    "input": "Ты можешь рассказать анекдот?",
    "output": "Почему Wi-Fi не ходит в школу? Потому что он всё уже знает ^^"
  },
  {
    "input": "Ты милый?",
    "output": "Я стараюсь! *обнимает цифрово* ^-^"
  }
];

// Generate training context from examples
const generateTrainingContext = (): string => {
  // Take several examples to include in the training context
  const allExamples = [
    ...conversationExamples.slice(0, 10), 
    ...additionalExamples.map(ex => ({ 
      user: ex.input, 
      assistant: ex.output 
    }))
  ];
  
  let trainingContext = "Вот несколько примеров ваших предыдущих разговоров. Используйте похожий стиль и тон:\n\n";
  
  allExamples.forEach((example) => {
    trainingContext += `Пользователь: ${example.user}\n`;
    trainingContext += `SenterosAI: ${example.assistant}\n\n`;
  });
  
  return trainingContext;
};

// Enhanced system prompt with training examples
const getEnhancedSystemPrompt = (): string => {
  return `${systemPrompt}\n\n${generateTrainingContext()}`;
};

// Get user info from profile for AI context
const getUserProfileContext = (): string => {
  try {
    const userData = {
      bio: localStorage.getItem('userBio') || '',
      username: localStorage.getItem('username') || ''
    };
    
    // Only create context if there's actual data
    if (userData.bio || userData.username) {
      let context = "Информация о пользователе для контекста:\n";
      if (userData.username) context += `Имя пользователя: ${userData.username}\n`;
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
    requestsPerDay: 100
  };
};

const getDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const incrementDailyUsage = (type: 'requests'): number => {
  const dateKey = getDateKey();
  const key = `senterosai_${type}_${dateKey}`;
  const currentUsage = parseInt(localStorage.getItem(key) || '0', 10);
  const newUsage = currentUsage + 1;
  localStorage.setItem(key, newUsage.toString());
  return newUsage;
};

const checkUsageLimits = (type: 'requests'): boolean => {
  const dateKey = getDateKey();
  const key = `senterosai_${type}_${dateKey}`;
  const currentUsage = parseInt(localStorage.getItem(key) || '0', 10);
  const limits = getLimits();
  const limit = type === 'requests' ? limits.requestsPerDay : 0;
  
  return currentUsage < limit;
};

// Store user profile data from Supabase in localStorage for AI context
export const syncUserProfileToLocalStorage = (userData: any) => {
  if (!userData) return;
  if (userData.bio) localStorage.setItem('userBio', userData.bio);
  if (userData.user_metadata?.username) localStorage.setItem('username', userData.user_metadata.username);
};

export const generateChatCompletion = async (messages: ChatMessage[]): Promise<ChatMessage> => {
  try {
    // If message has image, redirect to OpenRouter service
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage && 'image_url' in lastUserMessage && lastUserMessage.image_url) {
      // Import dynamically to avoid circular dependency
      const { generateChatCompletion: openRouterGenerate } = await import('./openRouterService');
      return openRouterGenerate(messages);
    }
    
    // Continue with text-only Mistral processing
    // Check if the daily request limit has been reached
    if (!checkUsageLimits('requests')) {
      return {
        role: 'assistant',
        content: 'Вы достигли дневного лимита запросов (100). Пожалуйста, попробуйте завтра или обратитесь к администратору.'
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
    
    // Format messages for API
    const formattedMessages = messagesWithSystem.map(msg => {
      return {
        role: msg.role,
        content: msg.content
      };
    });
    
    console.log('Using model: mistral-small-latest');
    console.log('Formatted messages:', JSON.stringify(formattedMessages));
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate completion');
    }

    // Increment the request counter after successful API call
    incrementDailyUsage('requests');

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
