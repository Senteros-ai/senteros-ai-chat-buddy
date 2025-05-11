
import React, { useState, useRef, KeyboardEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, StopCircle, Mic } from "lucide-react";
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopGeneration: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onStopGeneration, 
  isGenerating = false,
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const language = localStorage.getItem('language') || 'ru';
  const isRussian = language === 'ru';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter (not with Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t bg-card p-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2 items-center border rounded-md px-2 bg-background">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRussian ? "Введите сообщение..." : "Type your message..."}
              disabled={disabled}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            
            {/* Microphone button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={disabled}
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
          
          <Button 
            type={isGenerating ? "button" : "submit"}
            onClick={isGenerating ? onStopGeneration : undefined}
            disabled={(!message.trim()) || disabled}
            className={cn("shrink-0", isGenerating ? "bg-red-500 hover:bg-red-600" : "")}
          >
            {isGenerating ? (
              <>
                <StopCircle className="h-5 w-5 mr-2" />
                {isRussian ? "Остановить" : "Stop"}
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                {isRussian ? "Отправить" : "Send"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
