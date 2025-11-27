import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, MessageSquare, Trash2, Search, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import styles from './ChatSidebar.module.css';

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatSidebarProps {
  currentChatId: string | null;
  onSelectChat: (id: string | null) => void;
  refreshTrigger: number;
}

export const ChatSidebar = ({ currentChatId, onSelectChat, refreshTrigger }: ChatSidebarProps) => {
  const { user, token, logout } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Failed to fetch chats', error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [token, refreshTrigger]);

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this chat?')) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setChats(chats.filter(c => c.id !== id));
        if (currentChatId === id) onSelectChat(null);
      }
    } catch (error) {
      console.error('Failed to delete chat', error);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <Button 
          className="w-full justify-start gap-2" 
          variant="outline"
          onClick={() => onSelectChat(null)}
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>
      
      <div className={styles.search}>
        <Input 
          placeholder="Search chats..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.history}>
        <div className={styles.group}>
          <h3 className={styles.groupTitle}>History</h3>
          {filteredChats.length === 0 ? (
            <p className="text-xs text-gray-500 px-2">No chats found</p>
          ) : (
            filteredChats.map(chat => (
              <div 
                key={chat.id} 
                className={`${styles.chatItem} ${currentChatId === chat.id ? styles.active : ''}`}
                onClick={() => onSelectChat(chat.id)}
              >
                <MessageSquare size={16} className="shrink-0" />
                <span className={styles.chatTitle}>{chat.title}</span>
                <button 
                  className="ml-auto p-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.footer}>
        {user?.role === 'ADMIN' && (
          <Link href="/admin/users" className="w-full">
            <Button variant="ghost" className="w-full justify-start gap-2 mb-2">
              <LayoutDashboard size={16} />
              Admin Panel
            </Button>
          </Link>
        )}
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </aside>
  );
};
