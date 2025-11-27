'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleChatCreated = (id: string) => {
    setCurrentChatId(id);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar 
        currentChatId={currentChatId} 
        onSelectChat={setCurrentChatId}
        refreshTrigger={refreshTrigger}
      />
      <ChatWindow 
        chatId={currentChatId}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
}
