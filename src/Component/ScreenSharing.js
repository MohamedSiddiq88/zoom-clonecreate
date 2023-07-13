import React, { useRef, useState } from 'react';

function ScreenSharing({ peerInstance, connectedUsers }) {
  const [isSharing, setIsSharing] = useState(false);
  const screenVideoRef = useRef();

  const startScreenSharing = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
        setIsSharing(true);

        console.log('Screen sharing started');
        console.log('Connected Users:', connectedUsers);

        // Share screen with connected users
        connectedUsers.forEach((user) => {
          const call = peerInstance.current.call(user, screenStream);
          call.on('stream', (remoteStream) => {
            console.log(`Received stream from user ${user}`);
            // Handle the received stream from connected users if necessary
          });
        });
      }
    } catch (error) {
      console.error('Error starting screen sharing:', error);
    }
  };

  const stopScreenSharing = () => {
    if (screenVideoRef.current && screenVideoRef.current.srcObject) {
      screenVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      screenVideoRef.current.srcObject = null;
      setIsSharing(false);

      console.log('Screen sharing stopped');

      // Stop sharing screen with connected users
      connectedUsers.forEach((user) => {
        const call = peerInstance.current.call(user, null);
        console.log(`Stopped sharing screen with user ${user}`);
        // Handle the call and any necessary clean-up if required
      });
    }
  };

  console.log('Render ScreenSharing');

  return (
    <div>
      <h3>Screen Sharing</h3>
      <button onClick={() => {
        console.log('Start Sharing button clicked');
        if (isSharing) {
          startScreenSharing();
        } else {
          stopScreenSharing();

        }
      }}>
        {isSharing ? 'Stop Sharing' : 'Start Sharing'}
      </button>
      <div>
        {isSharing && <video ref={screenVideoRef} style={{ width: '300px', height: '200px' }} autoPlay />}
      </div>
    </div>
  );
}

export default ScreenSharing;
