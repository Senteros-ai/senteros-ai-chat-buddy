
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw, Settings } from "lucide-react";

interface ChatHeaderProps {
  onNewChat: () => void;
  onSettings: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onNewChat, onSettings }) => {
  return (
    <header className="flex items-center justify-between border-b p-4 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        <img src="https://i.ibb.co/xKtY6RXz/Chat-GPT-Image-1-2025-17-16-51.png" alt="SenterosAI Logo" className="h-8 w-auto" />
        <h1 className="text-xl font-semibold">SenterosAI</h1>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onNewChat}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <Button variant="outline" size="sm" onClick={onSettings}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
