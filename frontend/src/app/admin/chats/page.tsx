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
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} max-w-2xl h-[80vh] flex flex-col`}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h2 className="text-xl font-bold truncate pr-4">{selectedChat.title}</h2>
              <button onClick={closeChatModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              {!chatDetails ? (
                <div className="text-center py-10">Loading messages...</div>
              ) : (
                chatDetails.messages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white dark:bg-gray-800 border dark:border-gray-700'
                    }`}>
                      <p className="text-xs opacity-70 mb-1">{msg.role === 'user' ? 'User' : 'AI'}</p>
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
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
