import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const JoinRoom = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');

  const handleJoin = () => {
    navigate(`/room/${roomId}`);
  };

  const generateRoomId = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
  };

  return (
    <div>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
      />
      <button onClick={handleJoin}>Join Room</button>
      <button onClick={generateRoomId}>Generate Room ID</button>
    </div>
  );
};

export default JoinRoom;
