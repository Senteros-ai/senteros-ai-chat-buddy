
import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, ImageIcon, X } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface ChatInputProps {
  onSendMessage: (message: string, imageUrl?: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if ((!message.trim() && !imageFile) || disabled || isUploading) return;

    let imageUrl = '';
    
    if (imageFile) {
      setIsUploading(true);
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `chat-images/${fileName}`;
        
        // Upload the file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(filePath, imageFile);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data } = supabase.storage
          .from('chat-images')
          .getPublicUrl(filePath);
        
        imageUrl = data.publicUrl;
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setIsUploading(false);
        setImageFile(null);
        setImagePreview(null);
      }
    }
    
    onSendMessage(message.trim(), imageUrl || undefined);
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-t p-4 dark:border-gray-700">
      <div className="max-w-3xl mx-auto flex flex-col space-y-4">
        {imagePreview && (
          <div className="relative inline-block w-24 h-24">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
            <button 
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message SenterosAI..."
            className="min-h-[80px] resize-none pr-20"
            disabled={disabled || isUploading}
          />
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={disabled || isUploading}
            />
            <Button
              size="icon" 
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              type="button"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={(!message.trim() && !imageFile) || disabled || isUploading}
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
