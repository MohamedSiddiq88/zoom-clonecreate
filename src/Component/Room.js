import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Peer from 'peerjs';
import io from 'socket.io-client';
import Chat from './Chat';

const socket = io('https://zoom-clone-server-sigma.vercel.app/');

function Room() {
  const { roomId } = useParams();
  const [peerId, setPeerId] = useState('');
  const remoteVideoRefs = useRef({});
  const currentUserVideoRef = useRef(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [screenSharingUser, setScreenSharingUser] = useState('');
  const peerInstance = useRef(null);

  useEffect(() => {
    const initializePeer = async () => {
      const peer = new Peer();

      peer.on('open', (id) => {
        setPeerId(id);
        socket.emit('join-conference', roomId, id);
        setConnectedUsers((prevConnectedUsers) => [...prevConnectedUsers, id]);
      });

      peer.on('call', (call) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((mediaStream) => {
            const remotePeerId = call.peer;
            remoteVideoRefs.current[remotePeerId] = remoteVideoRefs.current[remotePeerId] || React.createRef();

            if (!connectedUsers.includes(remotePeerId)) {
              setConnectedUsers((prevConnectedUsers) => [...prevConnectedUsers, remotePeerId]);
            }

            currentUserVideoRef.current.srcObject = mediaStream;
            playVideo(currentUserVideoRef.current);

            call.answer(mediaStream);
            call.on('stream', (remoteStream) => {
              remoteVideoRefs.current[remotePeerId].current.srcObject = remoteStream;
              playVideo(remoteVideoRefs.current[remotePeerId].current);
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

  const playVideo = (videoElement) => {
    videoElement.play()
      .then(() => {
        console.log('Video playback started');
      })
      .catch((error) => {
        console.error('Error starting video playback:', error);
      });
  };

  const startScreenSharing = () => {
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then((mediaStream) => {
        const videoTrack = mediaStream.getVideoTracks()[0];
        const audioTrack = mediaStream.getAudioTracks()[0];
        currentUserVideoRef.current.srcObject = mediaStream;
        playVideo(currentUserVideoRef.current);
        connectedUsers.forEach((user) => {
          if (user !== peerId) {
            const call = peerInstance.current.call(user, mediaStream);
            call.on('stream', (remoteStream) => {
              remoteVideoRefs.current[user].current.srcObject = remoteStream;
              playVideo(remoteVideoRefs.current[user].current);
            });
          }
        });
        socket.emit('screen-sharing', roomId, peerId, true);
        setScreenSharingUser(peerId);
      })
      .catch((error) => {
        console.error('Error accessing screen sharing:', error);
        alert('Failed to access screen sharing. Please ensure you have the necessary permissions.');
      });
  };

  const stopScreenSharing = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        playVideo(currentUserVideoRef.current);
        connectedUsers.forEach((user) => {
          if (user !== peerId) {
            const call = peerInstance.current.call(user, mediaStream);
            call.on('stream', (remoteStream) => {
              remoteVideoRefs.current[user].current.srcObject = remoteStream;
              playVideo(remoteVideoRefs.current[user].current);
            });
          }
        });
        socket.emit('screen-sharing', roomId, peerId, false);
        setScreenSharingUser('');
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
        alert('Failed to access media devices. Please ensure you have a camera and microphone available and grant permission to access them.');
      });
  };

  const call = (remotePeerId) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        const stream = screenSharingUser ? mediaStream : currentUserVideoRef.current.srcObject;
        const call = peerInstance.current.call(remotePeerId, stream);
        remoteVideoRefs.current[remotePeerId] = remoteVideoRefs.current[remotePeerId] || React.createRef();

        if (!connectedUsers.includes(remotePeerId)) {
          setConnectedUsers((prevConnectedUsers) => [...prevConnectedUsers, remotePeerId]);
        }

        currentUserVideoRef.current.srcObject = mediaStream;
        playVideo(currentUserVideoRef.current);

        call.on('stream', (remoteStream) => {
          remoteVideoRefs.current[remotePeerId].current.srcObject = remoteStream;
          playVideo(remoteVideoRefs.current[remotePeerId].current);
        });
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
        alert('Failed to access media devices. Please ensure you have a camera and microphone available and grant permission to access them.');
      });
  };

  useEffect(() => {
    const handleNewUser = (userId) => {
      if (userId !== peerId) {
        if (!connectedUsers.includes(userId)) {
          call(userId);
        }
      }
    };

    const handleUserDisconnected = (userId) => {
      if (remoteVideoRefs.current[userId]) {
        delete remoteVideoRefs.current[userId];
      }

      setConnectedUsers((prevConnectedUsers) => prevConnectedUsers.filter((user) => user !== userId));
    };

    const handleScreenSharing = (userId, screenSharing) => {
      if (screenSharing) {
        setScreenSharingUser(userId);
      } else if (userId === screenSharingUser) {
        setScreenSharingUser('');
      }
    };

    socket.on('new-user', handleNewUser);
    socket.on('user-disconnected', handleUserDisconnected);
    socket.on('screen-sharing', handleScreenSharing);

    return () => {
      socket.off('new-user', handleNewUser);
      socket.off('user-disconnected', handleUserDisconnected);
      socket.off('screen-sharing', handleScreenSharing);
    };
  }, [connectedUsers, peerId, screenSharingUser]);

  return (
    <div className='container-fluid'>
	<div className='row'>
		<div className='col-8'>
			<h2>Current room ID is {roomId}</h2>
      <h3>Connected Users: {peerId}</h3>
     

      <h3>Connected Users:</h3>
      <ul>
        {connectedUsers.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
      <div className='video-container'>
        <video ref={currentUserVideoRef} style={{ width: '300px', height: '200px' }} autoPlay muted />
      
        {connectedUsers.map((user) => user !== peerId && (
          <video
            key={user}
            ref={remoteVideoRefs.current[user]}
            style={{ width: '300px', height: '200px' }}
            autoPlay
            onCanPlay={() => playVideo(remoteVideoRefs.current[user].current)}
          />
        ))}
      </div>
      <div>
        {screenSharingUser ? (
          <button onClick={stopScreenSharing}>Stop Screen Sharing</button>
        ) : (
          <button onClick={startScreenSharing}>Start Screen Sharing</button>
        )}
      </div>
		</div>

		<div className='col-4'>
			 <Chat socket={socket} roomId={roomId} peerId={peerId} />
		</div>
	</div>

      
    </div>
  );


}

export default Room;
