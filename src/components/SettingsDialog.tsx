
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const { toast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' || 'system';
    const savedLanguage = localStorage.getItem('language') as 'ru' | 'en' || 'ru';
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
  }, [open]);

  const handleSaveSettings = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('language', language);
    
    // Применить тему
    applyTheme(theme);
    
    toast({
      title: language === 'ru' ? 'Настройки сохранены' : 'Settings saved',
      description: language === 'ru' 
        ? 'Ваши настройки были успешно сохранены' 
        : 'Your settings have been successfully saved',
    });
    
    onOpenChange(false);
  };

  const applyTheme = (selectedTheme: string) => {
    if (selectedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
      document.documentElement.classList.toggle('dark', selectedTheme === 'dark');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {language === 'ru' ? 'Настройки' : 'Settings'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ru' 
              ? 'Настройте внешний вид SenterosAI' 
              : 'Configure your SenterosAI appearance'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme" className="col-span-4">
              {language === 'ru' ? 'Тема' : 'Theme'}
            </Label>
            <Select value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
              <SelectTrigger id="theme" className="col-span-4">
                <SelectValue placeholder={language === 'ru' ? 'Выберите тему' : 'Select theme'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{language === 'ru' ? 'Светлая' : 'Light'}</SelectItem>
                <SelectItem value="dark">{language === 'ru' ? 'Темная' : 'Dark'}</SelectItem>
                <SelectItem value="system">{language === 'ru' ? 'Системная' : 'System'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="col-span-4">
              {language === 'ru' ? 'Язык' : 'Language'}
            </Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as 'ru' | 'en')}>
              <SelectTrigger id="language" className="col-span-4">
                <SelectValue placeholder={language === 'ru' ? 'Выберите язык' : 'Select language'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveSettings}>
            {language === 'ru' ? 'Сохранить изменения' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
