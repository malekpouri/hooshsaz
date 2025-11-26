import React from 'react';
import { Plus, MessageSquare, Trash2, Search, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import styles from './ChatSidebar.module.css';

export const ChatSidebar = () => {
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
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Settings size={16} />
          Settings
        </Button>
      </div>
    </aside>
  );
};
