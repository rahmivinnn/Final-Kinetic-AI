'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { MediaStreamWithTracks, MediaTrack } from '@/types/media';
import { FrontendWebRTC } from '@/lib/frontend-webrtc';

interface VideoCallProps {
  roomId: string;
  userId: string;
  userType: 'doctor' | 'patient';
  userName: string;
  onCallEnd?: () => void;
}

interface MediaStatus {
  video: boolean;
  audio: boolean;
  screen: boolean;
}

interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  connectionQuality?: 'good' | 'fair' | 'poor';
}

interface WebSocketMessage {
  type: 'room_info' | 'peer_joined' | 'peer_left' | 'offer' | 'answer' | 'ice-candidate' | 'peer_status_changed';
  peer_id?: string;
  from_peer?: string;
  targetPeer?: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  status?: {
    video?: boolean;
    audio?: boolean;
    screen?: boolean;
  };
  peers?: Record<string, any>;
}

interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastError?: string;
}

// Helper functions for type-safe operations
const peerOperations = {
  forEachPeer: (peers: Record<string, PeerConnection>, callback: (peer: PeerConnection) => void) => {
    (Object.values(peers) as PeerConnection[]).forEach(callback);
  },
  replacePeerTrack: (peer: PeerConnection, track: MediaStreamTrack) => {
    const sender = peer.connection.getSenders().find((s: RTCRtpSender) => 
      s.track?.kind === track.kind
    );
    if (sender) {
      sender.replaceTrack(track);
    }
  }
} as const;

// ICE server configuration
const iceServers: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// Connection state update function type
type ConnectionStateUpdater = (prev: ConnectionState) => ConnectionState;
type MediaStatusUpdater = (prev: MediaStatus) => MediaStatus;

export const VideoCallHandler = ({ roomId, userId, userType, userName, onCallEnd }: VideoCallProps) => {
  const router = useRouter();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcRef = useRef<FrontendWebRTC | null>(null);
  const localStreamRef = useRef<MediaStreamWithTracks | null>(null);
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isSimulatingRemotePeer, setIsSimulatingRemotePeer] = useState(false);
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    isReconnecting: false,
    reconnectAttempts: 0,
  });
  
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>({
    video: true,
    audio: true,
    screen: false,
  });

  // Type-safe state update functions
  const updateConnectionState = (updater: ConnectionStateUpdater) => {
    setConnectionState(updater);
  };

  const updateMediaStatus = (updater: MediaStatusUpdater) => {
    setMediaStatus(updater);
  };

  // Peer operation functions with proper typing
  const updatePeerStatus = (peerId: string, status: 'good' | 'fair' | 'poor') => {
    const peer = peerConnectionsRef.current[peerId];
    if (peer) {
      peer.connectionQuality = status;
    }
  };

  const replaceVideoTrack = (track: MediaStreamTrack) => {
    peerOperations.forEachPeer(peerConnectionsRef.current, (peer) => {
      const sender = peer.connection.getSenders().find((s: RTCRtpSender) => 
        s.track?.kind === 'video'
      );
      if (sender) {
        sender.replaceTrack(track);
      }
    });
  };

  useEffect(() => {
    initializeCall();
    return () => cleanupCall();
  }, [roomId]);

  const initializeCall = async () => {
    try {
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      }) as MediaStreamWithTracks;
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize frontend WebRTC
      webrtcRef.current = new FrontendWebRTC();
      await webrtcRef.current.initialize(stream);
      
      // Save call info to localStorage
      const callInfo = {
        roomId,
        userId,
        userType,
        userName,
        startTime: new Date().toISOString(),
        status: 'active'
      };
      localStorage.setItem('kinetic_active_call', JSON.stringify(callInfo));
      
      // Simulate connection established
      updateConnectionState(prev => ({ ...prev, isConnected: true }));
      
      // Start simulating remote peer if this is a patient call
      if (userType === 'patient') {
        startRemotePeerSimulation();
      }

    } catch (err) {
      console.error('Error initializing call:', err);
      onCallEnd?.();
    }
  };

  const cleanupCall = () => {
    // Stop local stream
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks() as MediaTrack[];
      tracks.forEach((track: MediaTrack) => track.stop());
    }

    // Stop remote peer simulation
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    // Cleanup WebRTC
    if (webrtcRef.current) {
      webrtcRef.current.cleanup();
      webrtcRef.current = null;
    }
    
    // Clear call info from localStorage
    localStorage.removeItem('kinetic_active_call');
    
    setIsSimulatingRemotePeer(false);
  };

  // Frontend-only simulation functions
  const startRemotePeerSimulation = () => {
    setIsSimulatingRemotePeer(true);
    
    // Simulate remote peer joining after a delay
    setTimeout(() => {
      // Create a canvas for simulated remote video
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (ctx && remoteVideoRef.current) {
        // Create animated pattern for remote video
        let frame = 0;
        const animate = () => {
          ctx.fillStyle = `hsl(${frame % 360}, 50%, 50%)`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'white';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Simulated Remote Peer', canvas.width / 2, canvas.height / 2);
          ctx.fillText(`Frame: ${frame}`, canvas.width / 2, canvas.height / 2 + 40);
          frame++;
        };
        
        simulationIntervalRef.current = setInterval(animate, 100);
        
        // Set canvas stream as remote video
        const stream = canvas.captureStream(10);
        remoteVideoRef.current.srcObject = stream;
      }
    }, 2000);
  };

  // Media control functions for frontend-only implementation
  const toggleVideo = () => {
    if (localStreamRef.current && webrtcRef.current) {
      const enabled = webrtcRef.current.toggleVideo();
      updateMediaStatus(prev => ({ ...prev, video: enabled }));
      
      // Save preference to localStorage
      localStorage.setItem('kinetic_video_enabled', JSON.stringify(enabled));
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current && webrtcRef.current) {
      const enabled = webrtcRef.current.toggleMute();
      updateMediaStatus(prev => ({ ...prev, audio: !enabled }));
      
      // Save preference to localStorage
      localStorage.setItem('kinetic_audio_enabled', JSON.stringify(!enabled));
    }
  };

  const toggleScreenShare = async () => {
    if (webrtcRef.current) {
      try {
        const isSharing = await webrtcRef.current.toggleScreenShare();
        updateMediaStatus(prev => ({ ...prev, screen: isSharing }));
        
        // Save screen share status
        localStorage.setItem('kinetic_screen_sharing', JSON.stringify(isSharing));
      } catch (error) {
        console.error('Error toggling screen share:', error);
      }
    }
  };

  // Data channel message handler for frontend-only implementation
  const handleDataChannelMessage = (event: MessageEvent) => {
    console.log('Received message:', event.data);
    // Handle chat messages or other data channel communications
  };

  // End call function
  const endCall = () => {
    cleanupCall();
    onCallEnd?.();
  };





  return (
    <div className="video-call-container">
      <div className="video-grid">
        <div className="local-video-container">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`local-video ${mediaStatus.video ? '' : 'video-off'}`}
          />
          {!mediaStatus.video && (
            <div className="video-off-indicator">Camera Off</div>
          )}
        </div>
        <div className="remote-video-container">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
        </div>
      </div>

      <div className="controls-container">
        <button
          onClick={toggleVideo}
          className={`control-button ${mediaStatus.video ? 'active' : ''}`}
        >
          {mediaStatus.video ? 'Turn Off Camera' : 'Turn On Camera'}
        </button>
        <button
          onClick={toggleAudio}
          className={`control-button ${mediaStatus.audio ? 'active' : ''}`}
        >
          {mediaStatus.audio ? 'Mute' : 'Unmute'}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`control-button ${mediaStatus.screen ? 'active' : ''}`}
        >
          {mediaStatus.screen ? 'Stop Sharing' : 'Share Screen'}
        </button>
        <button onClick={endCall} className="control-button end-call">
          End Call
        </button>
      </div>

      <style jsx>{`
        .video-call-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .video-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1rem;
          padding: 1rem;
        }

        .local-video-container,
        .remote-video-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          background: #1a1a1a;
          border-radius: 8px;
          overflow: hidden;
        }

        .local-video,
        .remote-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-off-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          background: rgba(0, 0, 0, 0.5);
          padding: 0.5rem 1rem;
          border-radius: 4px;
        }

        .controls-container {
          display: flex;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.8);
        }

        .control-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background: #2c2c2c;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control-button:hover {
          background: #3c3c3c;
        }

        .control-button.active {
          background: #4c4c4c;
        }

        .control-button.end-call {
          background: #dc3545;
        }

        .control-button.end-call:hover {
          background: #c82333;
        }
      `}</style>
    </div>
  );
};

export default VideoCallHandler;
