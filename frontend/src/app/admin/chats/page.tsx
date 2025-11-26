'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from '../users/Users.module.css'; // Reuse table styles

interface ChatLog {
  id: string;
  title: string;
  createdAt: string;
  user: { username: string };
  model: { name: string } | null;
  messages: { content: string; role: string }[];
}

export default function ChatsPage() {
  const { token } = useAuth();
  const [chats, setChats] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/chats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setChats(data);
        }
      } catch (error) {
        console.error('Failed to fetch chats', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchChats();
  }, [token]);

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
              <th>Last Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {chats.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">No chats found</td>
              </tr>
            ) : (
              chats.map((chat) => (
                <tr key={chat.id}>
                  <td>{chat.user.username}</td>
                  <td>{chat.title || 'Untitled'}</td>
                  <td>{chat.model?.name || 'N/A'}</td>
                  <td className="max-w-xs truncate">
                    {chat.messages[0]?.content || 'No messages'}
                  </td>
                  <td>{new Date(chat.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
