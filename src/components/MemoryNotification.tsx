
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Check, X } from "lucide-react";

interface MemoryNotificationProps {
  content: string;
  onConfirm: () => void;
  onReject: () => void;
  language: 'ru' | 'en';
}

const MemoryNotification: React.FC<MemoryNotificationProps> = ({
  content,
  onConfirm,
  onReject,
  language
}) => {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              {language === 'ru' ? 'Запомнить информацию?' : 'Remember this information?'}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              "{content}"
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onConfirm}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="h-4 w-4 mr-1" />
                {language === 'ru' ? 'Да' : 'Yes'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onReject}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900"
              >
                <X className="h-4 w-4 mr-1" />
                {language === 'ru' ? 'Нет' : 'No'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemoryNotification;
