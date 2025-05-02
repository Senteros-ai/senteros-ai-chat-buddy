
import React, { useState, useRef, KeyboardEvent, ChangeEvent, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperPlaneIcon, StopCircle, ImageIcon, Mic } from "lucide-react";
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string, imageUrl?: string) => void;
  onStopGeneration: () => void;
  onVoiceRecording: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  onStopGeneration, 
  onVoiceRecording,
  isGenerating, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const language = localStorage.getItem('language') || 'ru';
  const isRussian = language === 'ru';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || imageFile) {
      let imageUrl = null;

      if (imageFile) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: isRussian ? "Ошибка загрузки" : "Upload Error",
            description: isRussian ? "Не удалось загрузить изображение" : "Failed to upload image",
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      onSendMessage(message, imageUrl);
      setMessage('');
      setImageFile(null);
      setImagePreviewUrl(null);
      inputRef.current?.focus();
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    // Create a data URL for the image preview
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // For the actual implementation, we'd typically upload to a server
          // But for now we just return the data URL
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to data URL'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading the file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelection = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: isRussian ? "Слишком большой файл" : "File too large",
          description: isRussian 
            ? "Пожалуйста, выберите изображение размером менее 5МБ" 
            : "Please select an image less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Submit on Enter (not with Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t bg-card p-4">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        {imagePreviewUrl && (
          <div className="mb-3 relative">
            <img 
              src={imagePreviewUrl} 
              alt="Preview" 
              className="h-24 object-contain rounded border border-border"
            />
            <Button 
              type="button"
              size="icon"
              variant="destructive"
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 h-6 w-6"
            >
              &times;
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          {!isGenerating && (
            <Button
              type="button"
              size="icon"
              className="shrink-0" 
              variant="ghost"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled || isUploading}
            >
              <ImageIcon className="h-5 w-5" />
              <span className="sr-only">
                {isRussian ? "Прикрепить изображение" : "Attach image"}
              </span>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelection}
                disabled={disabled || isUploading}
              />
            </Button>
          )}
          
          {!isGenerating && (
            <Button
              type="button"
              size="icon"
              className="shrink-0" 
              variant="ghost"
              onClick={onVoiceRecording}
              disabled={disabled || isUploading}
            >
              <Mic className="h-5 w-5" />
              <span className="sr-only">
                {isRussian ? "Голосовой ввод" : "Voice input"}
              </span>
            </Button>
          )}
          
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRussian ? "Введите сообщение..." : "Type your message..."}
            disabled={disabled || isUploading}
            className="flex-1"
          />
          <Button 
            type={isGenerating ? "button" : "submit"}
            onClick={isGenerating ? onStopGeneration : undefined}
            disabled={(!message.trim() && !imageFile) || disabled}
            className={cn("shrink-0", isGenerating ? "bg-red-500 hover:bg-red-600" : "")}
          >
            {isGenerating ? (
              <>
                <StopCircle className="h-5 w-5 mr-2" />
                {isRussian ? "Остановить" : "Stop"}
              </>
            ) : (
              <>
                <PaperPlaneIcon className="h-5 w-5 mr-2" />
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
