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
import { useAppLanguage } from '@/hooks/useAppLanguage';
import YandexAdManager from '@/components/YandexAdManager';

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
  const [theme, setTheme] = useState<Theme>('system');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSaveAd, setShowSaveAd] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { language, languages, setLanguage, texts } = useAppLanguage();

  // Load settings from localStorage and user profile
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
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
    setShowSaveAd(true);
  };

  const handleSaveAdClosed = () => {
    setShowSaveAd(false);
    // Actually save the settings after ad is shown
    localStorage.setItem('language', language);
    localStorage.setItem('theme', theme);
    
    toast({
      title: texts.settingsSaved,
      description: texts.settingsSavedDesc,
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
        title: texts.profileUpdated,
        description: texts.profileUpdatedDesc,
      });
    } catch (error: any) {
      toast({
        title: texts.error,
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
        title: texts.avatarUploaded,
        description: texts.dontForgetToSave,
      });
    } catch (error: any) {
      toast({
        title: texts.uploadError,
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

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <YandexAdManager trigger={showSaveAd} onClose={handleSaveAdClosed} />
      
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
            <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
              <SelectTrigger id="language">
                <SelectValue placeholder={texts.selectLanguage} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
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
