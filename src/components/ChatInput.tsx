
import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, StopCircle, X, Image } from "lucide-react";
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string, imageFile?: File) => void;
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const language = localStorage.getItem('language') || 'ru';
  const isRussian = language === 'ru';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedImage) {
      onSendMessage(message, selectedImage || undefined);
      setMessage('');
      setSelectedImage(null);
      setPreviewUrl(null);
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

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        toast({
          title: isRussian ? "Ошибка" : "Error",
          description: isRussian ? "Пожалуйста, выберите изображение" : "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: isRussian ? "Ошибка" : "Error",
          description: isRussian ? "Размер файла не должен превышать 5MB" : "File size should not exceed 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t bg-card p-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        {previewUrl && (
          <div className="relative mb-2 inline-block">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="h-20 w-auto rounded-md object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow-md hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
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
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              <Image className="h-5 w-5" />
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          
          <Button 
            type={isGenerating ? "button" : "submit"}
            onClick={isGenerating ? onStopGeneration : undefined}
            disabled={((!message.trim() && !selectedImage)) || disabled}
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
