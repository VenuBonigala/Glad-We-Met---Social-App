import React, { useState } from 'react';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { useSocket } from '../context/SocketContext'; // 1. Import useSocket

export default function ChatPage() {
  const [selectedConvo, setSelectedConvo] = useState(null);
  const { setCurrentChat } = useSocket(); // 2. Get the function

  const handleConvoSelected = (convo) => {
    setSelectedConvo(convo);
    setCurrentChat(convo._id); // 3. Set the active chat
  };

  const handleBack = () => {
    setSelectedConvo(null);
    setCurrentChat(null); // 4. Clear the active chat
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-8rem)] border rounded-lg shadow-md dark:border-gray-700 overflow-hidden">
      
      {/* Conversation List */}
      {/* 5. Add responsive classes */}
      <div className={`
        ${selectedConvo ? 'hidden' : 'block'} 
        md:block md:col-span-1 border-r dark:border-gray-700 h-full overflow-y-auto
      `}>
        <ConversationList 
          selectedConvo={selectedConvo}
          setSelectedConvo={handleConvoSelected} 
        />
      </div>
      
      {/* Chat Window */}
      {/* 6. Add responsive classes */}
      <div className={`
        ${selectedConvo ? 'block' : 'hidden'} 
        md:block md:col-span-2 h-full
      `}>
        <ChatWindow 
          selectedConvo={selectedConvo} 
          onBack={handleBack} // 7. Pass the back handler
        />
      </div>
    </div>
  );
}