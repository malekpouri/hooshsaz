'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Eye, X } from 'lucide-react';
import styles from '../users/Users.module.css';

interface ChatLog {
  id: string;
  title: string;
  createdAt: string;
  user: { username: string };
  model: { name: string } | null;
  messages: { content: string; role: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function ChatsPage() {
  const { token } = useAuth();
  const [chats, setChats] = useState<ChatLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<ChatLog | null>(null);
  const [chatDetails, setChatDetails] = useState<any>(null);

  const fetchChats = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/chats?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch chats', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchChats(page);
  }, [token, page]);

  const handleViewChat = async (chat: ChatLog) => {
    setSelectedChat(chat);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/${chat.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChatDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch chat details', error);
    }
  };

  const closeChatModal = () => {
    setSelectedChat(null);
    setChatDetails(null);
  };

  return (
    <div className={styles.container}>
      <h1 className="text-2xl font-bold mb-6">Chat Logs</h1>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Title</th>
              <th>Model</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
               <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
            ) : chats.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">No chats found</td>
              </tr>
            ) : (
              chats.map((chat) => (
                <tr key={chat.id}>
                  <td>{chat.user.username}</td>
                  <td>{chat.title || 'Untitled'}</td>
                  <td>{chat.model?.name || 'N/A'}</td>
                  <td>{new Date(chat.createdAt).toLocaleString()}</td>
                  <td>
                    <button 
                      onClick={() => handleViewChat(chat)}
                      className="text-blue-500 hover:text-blue-700"
                      title="View Chat"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button 
            variant="outline" 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button 
            variant="outline" 
            disabled={page === pagination.pages} 
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Chat Details Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background w-full max-w-3xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-lg font-bold truncate">{selectedChat.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedChat.user.username} • {selectedChat.model?.name} • {new Date(selectedChat.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={closeChatModal} 
                className="p-2 hover:bg-accent rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
              {!chatDetails ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                chatDetails.messages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-foreground rounded-bl-none'
                    }`}>
                      <p className="text-xs opacity-70 mb-1 font-semibold uppercase tracking-wider">
                        {msg.role === 'user' ? 'User' : 'AI'}
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
