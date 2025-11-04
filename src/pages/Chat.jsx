import React from 'react';
import Chat from '../components/Chat';

// Página wrapper para o componente de Chat
export default function ChatPage() {
  const contentWrapperStyle = {
    width: '100%',
    maxWidth: '1200px'
  };
  return (
    <div style={contentWrapperStyle}>
      <Chat />
    </div>
  );
}
