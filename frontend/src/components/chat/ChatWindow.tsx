import React from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '../ui/Button';
import styles from './ChatWindow.module.css';

export const ChatWindow = () => {
  return (
    <main className={styles.main}>
      <div className={styles.messages}>
        <div className={styles.messageWrapper}>
          <div className={styles.avatar}>
            <Bot size={20} />
          </div>
          <div className={styles.messageContent}>
            <p className={styles.sender}>HooshSaz AI</p>
            <div className={styles.bubble}>
              Hello! I am HooshSaz, your AI assistant. How can I help you today?
            </div>
          </div>
        </div>

        <div className={`${styles.messageWrapper} ${styles.user}`}>
          <div className={styles.messageContent}>
            <div className={styles.bubble}>
              Can you help me design a software architecture?
            </div>
          </div>
          <div className={styles.avatar}>
            <User size={20} />
          </div>
        </div>
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <textarea 
            className={styles.textarea} 
            placeholder="Type a message..."
            rows={1}
          />
          <Button size="icon" variant="primary">
            <Send size={18} />
          </Button>
        </div>
        <p className={styles.disclaimer}>
          HooshSaz can make mistakes. Consider checking important information.
        </p>
      </div>
    </main>
  );
};
