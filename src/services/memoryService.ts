
export interface MemoryItem {
  id: string;
  content: string;
  type: 'personal' | 'preference' | 'fact' | 'context';
  timestamp: number;
  importance: 'high' | 'medium' | 'low';
}

export interface MemorySuggestion {
  content: string;
  type: MemoryItem['type'];
  importance: MemoryItem['importance'];
  confidence: number; // 0-1
}

class MemoryService {
  private memoryKey = 'senterosai_memory';

  // Получить все воспоминания
  getMemories(): MemoryItem[] {
    try {
      const stored = localStorage.getItem(this.memoryKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading memories:', error);
      return [];
    }
  }

  // Добавить воспоминание
  addMemory(content: string, type: MemoryItem['type'], importance: MemoryItem['importance'] = 'medium'): void {
    const memories = this.getMemories();
    const newMemory: MemoryItem = {
      id: Date.now().toString(),
      content: content.trim(),
      type,
      importance,
      timestamp: Date.now()
    };

    // Проверяем на дубликаты
    const isDuplicate = memories.some(memory => 
      memory.content.toLowerCase() === content.toLowerCase().trim()
    );

    if (!isDuplicate) {
      memories.push(newMemory);
      // Ограничиваем количество воспоминаний (максимум 100)
      if (memories.length > 100) {
        memories.sort((a, b) => {
          // Сортируем по важности, затем по времени
          const importanceOrder = { high: 3, medium: 2, low: 1 };
          if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
            return importanceOrder[b.importance] - importanceOrder[a.importance];
          }
          return b.timestamp - a.timestamp;
        });
        memories.splice(80); // Оставляем только 80 самых важных/новых
      }
      
      localStorage.setItem(this.memoryKey, JSON.stringify(memories));
    }
  }

  // Удалить воспоминание
  removeMemory(id: string): void {
    const memories = this.getMemories().filter(memory => memory.id !== id);
    localStorage.setItem(this.memoryKey, JSON.stringify(memories));
  }

  // Анализ сообщения на предмет важной информации
  analyzeMessage(message: string): MemorySuggestion[] {
    const suggestions: MemorySuggestion[] = [];
    const text = message.toLowerCase();

    // Паттерны для извлечения информации
    const patterns = [
      // Имя
      {
        regex: /(?:меня зовут|я|мое имя|называй меня|зови меня)\s+([а-яё\w]+)/gi,
        type: 'personal' as const,
        importance: 'high' as const,
        template: (match: string) => `Имя пользователя: ${match}`
      },
      // Возраст
      {
        regex: /(?:мне|у меня)\s+(\d{1,2})\s+(?:лет|года|год)/gi,
        type: 'personal' as const,
        importance: 'medium' as const,
        template: (match: string) => `Возраст: ${match} лет`
      },
      // Профессия/работа
      {
        regex: /(?:я работаю|моя работа|я\s+(?:программист|дизайнер|учитель|врач|инженер|студент|школьник|разработчик))/gi,
        type: 'personal' as const,
        importance: 'medium' as const,
        template: (match: string) => `Профессия/статус: ${match}`
      },
      // Предпочтения
      {
        regex: /(?:я люблю|мне нравится|я предпочитаю|моё хобби)\s+([^.!?]+)/gi,
        type: 'preference' as const,
        importance: 'medium' as const,
        template: (match: string) => `Предпочтения: ${match}`
      },
      // Местоположение
      {
        regex: /(?:я из|живу в|нахожусь в)\s+([а-яё\w\s]+)(?:[.!?]|$)/gi,
        type: 'personal' as const,
        importance: 'medium' as const,
        template: (match: string) => `Местоположение: ${match}`
      }
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(message)) !== null) {
        const extracted = match[1]?.trim();
        if (extracted && extracted.length > 1 && extracted.length < 50) {
          suggestions.push({
            content: pattern.template(extracted),
            type: pattern.type,
            importance: pattern.importance,
            confidence: 0.8
          });
        }
      }
    });

    return suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.content === suggestion.content)
    );
  }

  // Получить контекст памяти для ИИ
  getMemoryContext(): string {
    const memories = this.getMemories();
    if (memories.length === 0) return '';

    // Группируем по типам
    const grouped = memories.reduce((acc, memory) => {
      if (!acc[memory.type]) acc[memory.type] = [];
      acc[memory.type].push(memory.content);
      return acc;
    }, {} as Record<string, string[]>);

    const sections = [];
    
    if (grouped.personal) {
      sections.push(`Личная информация: ${grouped.personal.join(', ')}`);
    }
    if (grouped.preference) {
      sections.push(`Предпочтения: ${grouped.preference.join(', ')}`);
    }
    if (grouped.fact) {
      sections.push(`Важные факты: ${grouped.fact.join(', ')}`);
    }
    if (grouped.context) {
      sections.push(`Контекст: ${grouped.context.join(', ')}`);
    }

    return sections.length > 0 
      ? `\n\nИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ:\n${sections.join('\n')}`
      : '';
  }

  // Очистить всю память
  clearMemory(): void {
    localStorage.removeItem(this.memoryKey);
  }
}

export const memoryService = new MemoryService();
