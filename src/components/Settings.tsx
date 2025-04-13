import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Upload, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

type Language = 'ru' | 'en';
type Theme = 'light' | 'dark' | 'system';

// Helper function to ensure avatar bucket exists
const ensureAvatarBucketExists = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  
  if (!buckets?.find(bucket => bucket.name === 'avatars')) {
    try {
      await supabase.storage.createBucket('avatars', { public: true });
      console.log('Created avatars bucket');
    } catch (error: any) {
      console.error('Error creating avatars bucket:', error.message);
      // If bucket already exists (race condition), that's fine
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  }
};

const Settings = () => {
  const [language, setLanguage] = useState<Language>('ru');
  const [theme, setTheme] = useState<Theme>('system');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  // Load settings from localStorage and user profile
  useEffect(() => {
    const savedLanguage = (localStorage.getItem('language') as Language) || 'ru';
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';

    setLanguage(savedLanguage);
    setTheme(savedTheme);
    
    if (user) {
      setUsername(user.user_metadata?.username || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

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

  const handleUpdateProfile = async () => {
    try {
      if (!user) return;
      
      const { error } = await supabase.auth.updateUser({
        data: {
          username: username,
          avatar_url: avatarUrl
        }
      });
      
      if (error) throw error;
      
      toast({
        title: language === 'ru' ? "Профиль обновлен" : "Profile updated",
        description: language === 'ru' 
          ? "Ваш профиль был успешно обновлен" 
          : "Your profile has been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: language === 'ru' ? "Ошибка" : "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      setIsUploading(true);
      
      // Ensure the avatars bucket exists before uploading
      await ensureAvatarBucketExists();
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setAvatarUrl(data.publicUrl);
      
      toast({
        title: language === 'ru' ? "Аватар загружен" : "Avatar uploaded",
        description: language === 'ru' 
          ? "Не забудьте сохранить изменения" 
          : "Don't forget to save changes",
      });
    } catch (error: any) {
      toast({
        title: language === 'ru' ? "Ошибка загрузки" : "Upload error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
    appearance: language === 'ru' ? 'Внешний вид' : 'Appearance',
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
    profile: language === 'ru' ? 'Профиль' : 'Profile',
    manageProfile: language === 'ru' ? 'Управление профилем' : 'Manage your profile',
    username: language === 'ru' ? 'Имя пользователя' : 'Username',
    enterUsername: language === 'ru' ? 'Введите имя пользователя' : 'Enter username',
    avatar: language === 'ru' ? 'Аватар' : 'Avatar',
    uploadAvatar: language === 'ru' ? 'Загрузить аватар' : 'Upload avatar',
    updateProfile: language === 'ru' ? 'Обновить профиль' : 'Update profile',
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
          <CardTitle>{texts.profile}</CardTitle>
          <CardDescription>
            {texts.manageProfile}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={username} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {username ? username.charAt(0).toUpperCase() : <User />}
                  </AvatarFallback>
                )}
              </Avatar>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full cursor-pointer">
                <Upload className="h-4 w-4" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="username">{texts.username}</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder={texts.enterUsername}
              />
            </div>
          </div>
          <Button onClick={handleUpdateProfile} className="w-full" disabled={isUploading}>
            {texts.updateProfile}
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{texts.appearance}</CardTitle>
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
