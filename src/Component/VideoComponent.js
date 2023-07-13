import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Peer from 'peerjs';

const VideoComponent = ({ room }) => {
  const [roomId, setRoomId] = useState(room);

  useEffect(() => {
    const socket = io('http://localhost:3000');
    const videoGrid = document.getElementById('video-grid');
    const myPeer = new Peer(undefined, {
      path: '/peerjs',
      host: '/',
      port: '3000',
    });

    // Rest of the code...

    myPeer.on('open', (id) => {
      console.log('PeerJS connection established. ID:', id);
      socket.emit('join-room', room, id);
    });
  }, [room]);

  return (
    <div>
      <div>Room ID: {roomId}</div>
      <div id="video-grid"></div>
    </div>
  );
};

export default VideoComponent;
