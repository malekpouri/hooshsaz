import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
}
