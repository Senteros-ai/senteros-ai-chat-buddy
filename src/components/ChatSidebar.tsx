
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Chat, updateChatTitle, deleteChat } from '@/services/chatService';
import { MessageSquare, Edit, Trash2, Check, X, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ChatSidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onChatUpdated: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  language: 'ru' | 'en';
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  chats, 
  currentChatId, 
  onChatSelect, 
  onNewChat,
  onChatUpdated,
  isOpen,
  onOpenChange,
  language
}) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const { toast } = useToast();

  const texts = {
    chatHistory: language === 'ru' ? 'История чатов' : 'Chat History',
    noChats: language === 'ru' ? 'Нет сохраненных чатов' : 'No saved chats',
    newChat: language === 'ru' ? 'Новый чат' : 'New Chat',
    deleteChat: language === 'ru' ? 'Удалить чат' : 'Delete Chat',
    deleteConfirm: language === 'ru' 
      ? 'Вы уверены, что хотите удалить чат? Это действие нельзя отменить.' 
      : 'Are you sure you want to delete this chat? This action cannot be undone.',
    cancel: language === 'ru' ? 'Отмена' : 'Cancel',
    delete: language === 'ru' ? 'Удалить' : 'Delete',
    success: language === 'ru' ? 'Успешно' : 'Success',
    error: language === 'ru' ? 'Ошибка' : 'Error',
    chatUpdated: language === 'ru' ? 'Название чата обновлено' : 'Chat title updated',
    chatUpdateError: language === 'ru' ? 'Не удалось обновить название чата' : 'Failed to update chat title',
    chatDeleted: language === 'ru' ? 'Чат удален' : 'Chat deleted',
    chatDeleteError: language === 'ru' ? 'Не удалось удалить чат' : 'Failed to delete chat',
  };

  const handleEdit = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setNewTitle(chat.title);
  };

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingChatId && newTitle.trim()) {
      try {
        await updateChatTitle(editingChatId, newTitle);
        setEditingChatId(null);
        onChatUpdated();
        toast({
          title: texts.success,
          description: texts.chatUpdated,
        });
      } catch (error) {
        console.error('Error updating chat title:', error);
        toast({
          title: texts.error,
          description: texts.chatUpdateError,
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  const handleDeleteClick = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (chatToDelete) {
      try {
        await deleteChat(chatToDelete.id);
        setDeleteDialogOpen(false);
        setChatToDelete(null);
        onChatUpdated();
        toast({
          title: texts.success,
          description: texts.chatDeleted,
        });
      } catch (error) {
        console.error('Error deleting chat:', error);
        toast({
          title: texts.error,
          description: texts.chatDeleteError,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">{texts.chatHistory}</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <Button 
                variant="outline" 
                className="w-full mb-2 flex items-center justify-center gap-2"
                onClick={onNewChat}
              >
                <Plus className="h-4 w-4" />
                {texts.newChat}
              </Button>
            
              {chats.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  {texts.noChats}
                </div>
              ) : (
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`
                        flex items-center justify-between p-3 rounded-md cursor-pointer
                        ${chat.id === currentChatId ? 'bg-accent' : 'hover:bg-accent/50'}
                      `}
                      onClick={() => onChatSelect(chat.id)}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <MessageSquare className="h-5 w-5 mr-2 shrink-0" />
                        {editingChatId === chat.id ? (
                          <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-7"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate">{chat.title}</span>
                        )}
                      </div>
                      {editingChatId === chat.id ? (
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleSaveEdit}
                            className="h-7 w-7"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleCancelEdit}
                            className="h-7 w-7"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleEdit(chat, e)}
                            className="h-7 w-7 opacity-50 hover:opacity-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => handleDeleteClick(chat, e)}
                            className="h-7 w-7 opacity-50 hover:opacity-100 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts.deleteChat}</DialogTitle>
            <DialogDescription>
              {texts.deleteConfirm}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {texts.cancel}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {texts.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ChatSidebar;
