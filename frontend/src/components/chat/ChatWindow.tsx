'use client';

import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '../ui/Button';
import styles from './ChatWindow.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const ChatWindow = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages([...messages, newMessage]);
    setInput('');

    // Simulate AI response (placeholder)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I am a placeholder AI. Connect me to the backend!',
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <main className={styles.main}>
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Welcome to HooshSaz</p>
            <p className="text-sm">Start a conversation to begin.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageWrapper} ${
                msg.role === 'user' ? styles.user : ''
              }`}
            >
              <div className={styles.avatar}>
                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className={styles.messageContent}>
                <p className={styles.sender}>
                  {msg.role === 'assistant' ? 'HooshSaz AI' : 'You'}
                </p>
                <div className={styles.bubble}>{msg.content}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <textarea
            className={styles.textarea}
            placeholder="Type a message..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button size="icon" variant="primary" onClick={handleSend}>
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
