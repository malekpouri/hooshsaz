'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Sparkles, Copy, Check } from 'lucide-react';
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
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChatIdRef = useRef<string | null>(chatId);

  // Update active chat ref when prop changes
  useEffect(() => {
    activeChatIdRef.current = chatId;
  }, [chatId]);

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

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!chatId && !selectedModel) {
      alert('Please select a model first');
      return;
    }

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Track which chat this stream belongs to
    let currentStreamChatId = chatId;

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

        // Check if user switched chats
        if (currentStreamChatId && activeChatIdRef.current !== currentStreamChatId) {
          console.log('User switched chats, stopping stream processing for this window.');
          break;
        }

        const chunk = new TextDecoder().decode(value, { stream: true });
        buffer += chunk;
        
        const lines = buffer.split('\n\n');
        // Keep the last part in the buffer as it might be incomplete
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'info' && data.chatId) {
                currentStreamChatId = data.chatId;
                if (!chatId) {
                  onChatCreated(data.chatId);
                }
              } else if (data.type === 'chunk') {
                // Double check before updating state
                if (currentStreamChatId && activeChatIdRef.current !== currentStreamChatId) {
                   break;
                }

                assistantMessage += data.content;
                
                if (isFirstChunk) {
                  setMessages(prev => [
                    ...prev,
                    {
                      id: 'assistant-' + Date.now(),
                      role: 'assistant',
                      content: assistantMessage
                    }
                  ]);
                  isFirstChunk = false;
                } else {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (lastIndex >= 0) {
                      newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        content: assistantMessage
                      };
                    }
                    return newMessages;
                  });
                }
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Only show error if we are still on the same chat
      if (!currentStreamChatId || activeChatIdRef.current === currentStreamChatId) {
         setMessages(prev => [...prev, { id: 'error', role: 'assistant', content: 'Error: Failed to get response.' }]);
      }
    } finally {
      if (!currentStreamChatId || activeChatIdRef.current === currentStreamChatId) {
        setIsLoading(false);
      }
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.messages}>
        {!chatId && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-6">
            <div className="bg-primary/10 p-6 rounded-full animate-pulse">
              <Sparkles size={64} className="text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Welcome to HooshSaz</h2>
              <p className="text-muted-foreground text-lg">Choose an AI model to begin your journey</p>
            </div>
            
            <div className="w-80 relative">
              <label className="block text-sm font-medium mb-3 text-foreground/80">Select AI Model</label>
              <select 
                className={styles.select}
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
                  <div className="flex justify-between items-start">
                    <p className={styles.sender}>
                      {msg.role === 'assistant' ? 'HooshSaz AI' : 'You'}
                    </p>
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
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
