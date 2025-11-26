import React from 'react';
import Link from 'next/link';
import { Plus, MessageSquare, Trash2, Search, Settings, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import styles from './ChatSidebar.module.css';

export const ChatSidebar = () => {
  const { user, logout } = useAuth();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <Button className="w-full justify-start gap-2" variant="outline">
          <Plus size={16} />
          New Chat
        </Button>
      </div>
      
      <div className={styles.search}>
        <Input placeholder="Search chats..." />
      </div>

      <div className={styles.history}>
        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Today</h3>
          <button className={styles.chatItem}>
            <MessageSquare size={16} />
            <span className={styles.chatTitle}>Project Architecture</span>
          </button>
          <button className={styles.chatItem}>
            <MessageSquare size={16} />
            <span className={styles.chatTitle}>React Components</span>
          </button>
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Yesterday</h3>
          <button className={styles.chatItem}>
            <MessageSquare size={16} />
            <span className={styles.chatTitle}>Docker Setup</span>
          </button>
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
