import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Peer from 'peerjs';
import io from 'socket.io-client';

const socket = io('localhost:3001/');

function VideoCall() {
  const { roomId } = useParams();
  const [peerId, setPeerId] = useState('');
  const remoteVideoRefs = useRef({});
  const videoGrid = useRef(null);
  const peerInstance = useRef(null);

  useEffect(() => {
    const initializePeer = async () => {
      const peer = new Peer();

      peer.on('open', (id) => {
        setPeerId(id);
        socket.emit('join-conference', roomId, id);
      });

      peer.on('call', (call) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((mediaStream) => {
            const remotePeerId = call.peer;
            remoteVideoRefs.current[remotePeerId] = remoteVideoRefs.current[remotePeerId] || [];

            call.answer(mediaStream);
            call.on('stream', (remoteStream) => {
              remoteVideoRefs.current[remotePeerId].push(remoteStream);

              const videoElement = document.createElement('video');
              videoElement.srcObject = remoteStream;
              videoElement.autoPlay = true;
              videoElement.playsInline = true;
              videoGrid.current.appendChild(videoElement);
            });
          })
          .catch((error) => {
            console.error('Error accessing media devices:', error);
            alert('Failed to access media devices. Please ensure you have a camera and microphone available and grant permission to access them.');
          });
      });

      peerInstance.current = peer;
    };

    initializePeer();
  }, [roomId]);

  useEffect(() => {
    const handleNewUser = (userId) => {
      if (userId !== peerId) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((mediaStream) => {
            const call = peerInstance.current.call(userId, mediaStream);
            remoteVideoRefs.current[userId] = remoteVideoRefs.current[userId] || [];

            call.on('stream', (remoteStream) => {
              remoteVideoRefs.current[userId].push(remoteStream);

              const videoElement = document.createElement('video');
              videoElement.srcObject = remoteStream;
              videoElement.autoPlay = true;
              videoElement.playsInline = true;
              videoGrid.current.appendChild(videoElement);
            });
          })
          .catch((error) => {
            console.error('Error accessing media devices:', error);
            alert('Failed to access media devices. Please ensure you have a camera and microphone available and grant permission to access them.');
          });
      }
    };

    const handleUserDisconnected = (userId) => {
      if (remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId].forEach((remoteStream) => {
          const videoElements = document.querySelectorAll('video');
          videoElements.forEach((videoElement) => {
            if (videoElement.srcObject === remoteStream) {
              videoElement.remove();
            }
          });
        });

        delete remoteVideoRefs.current[userId];
      }
    };

    socket.on('new-user', handleNewUser);
    socket.on('user-disconnected', handleUserDisconnected);

    return () => {
      socket.off('new-user', handleNewUser);
      socket.off('user-disconnected', handleUserDisconnected);
    };
  }, [peerId]);

  return (
    <div>
      <h1>Room ID: {roomId}</h1>
      <div ref={videoGrid}></div>
    </div>
  );
}

export default VideoCall;
