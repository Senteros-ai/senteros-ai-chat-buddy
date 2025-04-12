
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from '@/services/openRouterService';

export interface Chat {
  id: string;
  title: string;
  created_at: string | null;
  updated_at: string | null;
  user_id: string | null;
}

export const fetchUserChats = async (): Promise<Chat[]> => {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createChat = async (title: string, firstMessage: ChatMessage): Promise<Chat> => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) throw new Error('User not authenticated');
  
  // Create new chat
  const { data: chatData, error: chatError } = await supabase
    .from('chats')
    .insert([{ title, user_id: user.user.id }])
    .select()
    .single();
  
  if (chatError) throw chatError;
  if (!chatData) throw new Error('Failed to create chat');
  
  // Add first message to the chat
  const { error: messageError } = await supabase
    .from('messages')
    .insert([{
      chat_id: chatData.id,
      role: firstMessage.role,
      content: firstMessage.content,
    }]);
  
  if (messageError) throw messageError;
  
  return chatData;
};

export const updateChatTitle = async (chatId: string, newTitle: string): Promise<void> => {
  const { error } = await supabase
    .from('chats')
    .update({ title: newTitle, updated_at: new Date().toISOString() })
    .eq('id', chatId);
  
  if (error) throw error;
};

export const deleteChat = async (chatId: string): Promise<void> => {
  // First delete all messages associated with the chat
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('chat_id', chatId);
  
  if (messagesError) throw messagesError;
  
  // Then delete the chat
  const { error: chatError } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId);
  
  if (chatError) throw chatError;
};

export const fetchChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('timestamp', { ascending: true });
  
  if (error) throw error;
  
  // Явно приводим role к нужному типу
  return data?.map(message => ({
    role: message.role as "user" | "assistant" | "system",
    content: message.content,
  })) || [];
};

export const saveChatMessage = async (chatId: string, message: ChatMessage): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .insert([{
      chat_id: chatId,
      role: message.role,
      content: message.content,
    }]);
  
  if (error) throw error;
  
  // Update the chat's updated_at timestamp
  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId);
};
