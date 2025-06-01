import { ChatMessage } from './openRouterService';
import { memoryService } from './memoryService';

const apiKey = process.env.MISTRAL_API_KEY;
const apiUrl = 'https://api.mistral.ai/v1/chat/completions';

const systemPrompt = `Ты — полезный помощник по имени SenterosAI. Ты отвечаешь на вопросы пользователей.
Будь вежливым и дружелюбным. Твоя задача — помогать людям.
Если вопрос не имеет смысла или непонятен, объясни, почему ты не можешь ответить.
Если требуется дополнительная информация, уточни, что именно нужно знать.
Старайся отвечать кратко и по делу. Не придумывай лишнюю информацию.
Используй Markdown для форматирования текста.`;

const trainingContext = `Тебя зовут SenterosAI. Ты был разработан компанией Senteros.
Ты — часть платформы Senteros, которая помогает людям в разных сферах.
Ты можешь отвечать на вопросы о компании Senteros, ее продуктах и услугах.
Ты можешь помогать людям в решении разных задач, связанных с Senteros.
Ты можешь давать советы и рекомендации по использованию платформы Senteros.
Ты можешь помогать людям в поиске информации на платформе Senteros.
Ты можешь помогать людям в решении проблем, связанных с платформой Senteros.
Ты можешь помогать людям в обучении работе с платформой Senteros.
Ты можешь помогать людям в автоматизации задач на платформе Senteros.
Ты можешь помогать людям в интеграции платформы Senteros с другими сервисами.
Ты можешь помогать людям в разработке приложений на платформе Senteros.
Ты можешь помогать людям в масштабировании бизнеса с помощью платформы Senteros.
Ты можешь помогать людям в создании новых продуктов и услуг на платформе Senteros.
Ты можешь помогать людям в улучшении существующих продуктов и услуг на платформе Senteros.
Ты можешь помогать людям в создании новых рынков и ниш для бизнеса.
Ты можешь помогать людям в привлечении новых клиентов и партнеров.
Ты можешь помогать людям в увеличении прибыли и рентабельности бизнеса.
Ты можешь помогать людям в создании устойчивого конкурентного преимущества.
Ты можешь помогать людям в развитии инноваций и технологий.
Ты можешь помогать людям в создании новых рабочих мест и возможностей.
Ты можешь помогать людям в улучшении качества жизни и благосостояния.
Ты можешь помогать людям в достижении целей и реализации потенциала.
Ты можешь помогать людям в создании лучшего будущего для себя и других.`;

const model = 'mistral-medium';

// Enhanced system prompt with training context
const getEnhancedSystemPrompt = (): string => {
  const trainingContext = generateTrainingContext();
  const memoryContext = memoryService.getMemoryContext();
  return `${systemPrompt}\n\n${trainingContext}${memoryContext}`;
};

export const generateChatCompletion = async (messages: ChatMessage[]): Promise<ChatMessage> => {
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY is not set');
  }

  const enhancedMessages = [{ role: "system", content: getEnhancedSystemPrompt() }, ...messages];

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: enhancedMessages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Mistral API error:', errorBody);
    throw new Error(`Mistral API failed with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No choices returned from Mistral API');
  }

  const content = data.choices[0].message.content;
  return { role: 'assistant', content: content };
};

export const generateChatTitle = async (messages: ChatMessage[]): Promise<string | null> => {
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY is not set');
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'Generate a short title (max 5 words) for this chat conversation in the same language as the chat. Focus on the main topic of the conversation.'
        },
        ...messages
      ],
      temperature: 0.5,
      max_tokens: 20,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Mistral API error:', errorBody);
    throw new Error(`Mistral API failed with status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No choices returned from Mistral API');
  }

  const title = data.choices[0].message.content;
  return title;
};

export const simulateStreamingResponse = async (message: string, delay: number = 50): Promise<string> => {
  return new Promise((resolve) => {
    let index = 0;
    let simulatedResponse = '';

    const intervalId = setInterval(() => {
      simulatedResponse += message[index];
      index++;

      if (index === message.length) {
        clearInterval(intervalId);
        resolve(simulatedResponse);
      }
    }, delay);
  });
};

function generateTrainingContext(): string {
  return trainingContext;
}
