import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import LandingPage from './components/LandingPage';
import LobbyScreen from './components/LobbyScreen';
import ChatWindow from './components/ChatWindow';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ChatProvider>
        <div className="w-full min-h-screen">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/lobby/:sessionId" element={<LobbyScreen />} />
            <Route path="/chat/:roomId" element={<ChatWindow />} />
          </Routes>
        </div>
      </ChatProvider>
    </BrowserRouter>
  );
};

export default App;
