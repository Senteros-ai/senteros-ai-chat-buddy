
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type Language = 'ru' | 'en';
type Theme = 'light' | 'dark' | 'system';

const Settings = () => {
  const [language, setLanguage] = useState<Language>('ru');
  const [theme, setTheme] = useState<Theme>('system');
  const { toast } = useToast();
  const { signOut } = useAuth();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedLanguage = (localStorage.getItem('language') as Language) || 'ru';
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';

    setLanguage(savedLanguage);
    setTheme(savedTheme);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const handleSaveSettings = () => {
    localStorage.setItem('language', language);
    localStorage.setItem('theme', theme);
    
    toast({
      title: language === 'ru' ? "Настройки сохранены" : "Settings saved",
      description: language === 'ru' 
        ? "Ваши настройки были успешно сохранены" 
        : "Your settings have been successfully saved",
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Error is handled in the signOut function
    }
  };

  // Локализованные тексты
  const texts = {
    settings: language === 'ru' ? 'Настройки' : 'Settings',
    appSettings: language === 'ru' ? 'Настройки приложения' : 'Application Settings',
    configureApp: language === 'ru' 
      ? 'Настройте язык и тему приложения' 
      : 'Configure language and theme of the application',
    language: language === 'ru' ? 'Язык' : 'Language',
    selectLanguage: language === 'ru' ? 'Выберите язык' : 'Select language',
    theme: language === 'ru' ? 'Тема' : 'Theme',
    selectTheme: language === 'ru' ? 'Выберите тему' : 'Select theme',
    light: language === 'ru' ? 'Светлая' : 'Light',
    dark: language === 'ru' ? 'Темная' : 'Dark',
    system: language === 'ru' ? 'Системная' : 'System',
    saveSettings: language === 'ru' ? 'Сохранить настройки' : 'Save settings',
    account: language === 'ru' ? 'Аккаунт' : 'Account',
    manageAccount: language === 'ru' ? 'Управление вашим аккаунтом' : 'Manage your account',
    signOut: language === 'ru' ? 'Выйти из аккаунта' : 'Sign out',
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="flex items-center mb-6">
        <Link to="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{texts.settings}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{texts.appSettings}</CardTitle>
          <CardDescription>
            {texts.configureApp}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{texts.language}</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger id="language">
                <SelectValue placeholder={texts.selectLanguage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">{texts.theme}</Label>
            <Select value={theme} onValueChange={(value) => setTheme(value as Theme)}>
              <SelectTrigger id="theme">
                <SelectValue placeholder={texts.selectTheme} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{texts.light}</SelectItem>
                <SelectItem value="dark">{texts.dark}</SelectItem>
                <SelectItem value="system">{texts.system}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSaveSettings} className="w-full">
            {texts.saveSettings}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{texts.account}</CardTitle>
          <CardDescription>
            {texts.manageAccount}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignOut} variant="destructive" className="w-full">
            {texts.signOut}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
