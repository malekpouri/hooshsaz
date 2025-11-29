'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '../ui/Button';
import styles from './ChatWindow.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  chatId: string | null;
  onChatCreated: (id: string) => void;
}

export const ChatWindow = ({ chatId, onChatCreated }: ChatWindowProps) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/models`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setModels(data);
          if (data.length > 0) setSelectedModel(data[0].name);
        }
      } catch (error) {
        console.error('Failed to fetch models', error);
      }
    };
    if (token) fetchModels();
  }, [token]);

  // Fetch Chat History
  useEffect(() => {
    const fetchChat = async () => {
      if (!chatId || !token) {
        setMessages([]);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/${chatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Failed to fetch chat', error);
      }
    };
    fetchChat();
  }, [chatId, token]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!chatId && !selectedModel) {
      alert('Please select a model first');
      return;
    }

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Optimistic update
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: userMessage }]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId,
          message: userMessage,
          model: selectedModel,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let assistantMessage = '';
      let isFirstChunk = true;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n\n');
        // Keep the last part in the buffer as it might be incomplete
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'info' && data.chatId && !chatId) {
                onChatCreated(data.chatId);
              } else if (data.type === 'chunk') {
                assistantMessage += data.content;
                
                setMessages(prev => {
                  const newMessages = [...prev];
                  if (isFirstChunk) {
                    newMessages.push({
                      id: 'assistant-' + Date.now(),
                      role: 'assistant',
                      content: assistantMessage
                    });
                    isFirstChunk = false;
                  } else {
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg.role === 'assistant') {
                      lastMsg.content = assistantMessage;
                    }
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: 'Error: Failed to get response.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.messages}>
        {!chatId && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Sparkles size={48} className="text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-foreground">Welcome to HooshSaz</h2>
              <p className="text-sm text-muted-foreground">Select an AI model to start chatting</p>
            </div>
            
            <div className="w-64">
              <label className="block text-sm font-medium mb-2">AI Model</label>
              <select 
                className="w-full p-2 rounded-md border bg-background"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                {models.map(model => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
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
                  <div className={`${styles.bubble} ${styles.markdown}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
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
            disabled={isLoading}
          />
          <Button size="icon" variant="primary" onClick={handleSend} disabled={isLoading}>
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
