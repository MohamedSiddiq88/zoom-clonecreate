//App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Room from './Component/Room';
import RoomJoin from './Component/RoomJoin';
import Chat from './Component/Chat';
// import ScreenShare from './Component/ScreenSharing';
import ScreenSharing from './Component/ScreenSharing';
// import Room from './Room';
// import VideoCall from './VideoCall';

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<RoomJoin />} />
      <Route path="/room/:roomId" element={<Room />} />
      <Route path="/room/:roomId/chat" element={<Chat />} />
      <Route path="/room/:roomId/share" element={<ScreenSharing />} />

    </Routes>
    </>
  );
}

export default App;