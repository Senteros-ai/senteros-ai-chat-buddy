
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

export const generateChatCompletion = async (messages: ChatMessage[]): Promise<ChatMessage> => {
  try {
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
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          // OpenRouter API doesn't support image_url directly, so we don't include it in the API call
        })),
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
