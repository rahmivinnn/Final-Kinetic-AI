'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Minimize2, Maximize2, User } from 'lucide-react';

type HTMLVideoElement = any;
type HTMLImageElement = any;

interface VideoCallSimpleProps {
  therapistName?: string;
  therapistImage?: string;
  onEndCall?: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  isAIAgent?: boolean;
  sessionId?: string;
  userId?: string;
  userType?: 'patient' | 'therapist' | 'ai';
  userName?: string;
}

export default function VideoCallSimple({
  therapistName = "Dr. Sarah Johnson",
  therapistImage = "/caring-doctor.png",
  onEndCall = () => {},
  isMinimized = false,
  onToggleMinimize = () => {},
  isAIAgent = false,
  sessionId = "",
  userId = "user-123",
  userType = "patient",
  userName = "John Patient"
}: VideoCallSimpleProps) {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const [callDuration, setCallDuration] = React.useState(0);
  const localVideoRef = React.useRef<any>(null);
  const remoteVideoRef = React.useRef<any>(null);
  const timerRef = React.useRef<any>(null);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Toggle video
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  // Handle end call
  const handleEndCall = () => {
    onEndCall();
  };

  // Handle image error
  const handleImageError = (e: any) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = '/default-avatar.png';
  };

  // Simulate call duration timer
  React.useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setCallDuration(prev => (prev >= 3600 ? 0 : prev + 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg w-64 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
              <img 
                src={therapistImage} 
                alt={therapistName}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{therapistName}</p>
              <p className="text-xs text-gray-500">{formatDuration(callDuration)}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              size="icon"
              variant="ghost"
              onClick={onToggleMinimize}
              className="h-8 w-8"
              aria-label="Maximize call"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={handleEndCall}
              className="h-8"
              aria-label="End call"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* Remote video */}
      <div className="flex-1 bg-gray-900 flex items-center justify-center relative">
        {isAIAgent ? (
          <div className="text-center p-4">
            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-blue-400 mb-4">
              <img 
                src={therapistImage} 
                alt={therapistName}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
            <h2 className="text-2xl font-bold text-white">{therapistName}</h2>
            <p className="text-gray-300">AI Therapist</p>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gray-700 mb-4 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg">Connecting to</p>
              <p className="text-white text-xl font-medium">{therapistName}</p>
              <p className="text-gray-500 mt-2">{formatDuration(callDuration)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Local video */}
      <div className="absolute bottom-24 right-6 w-48 h-36 rounded-lg overflow-hidden border-2 border-white shadow-lg">
        {isVideoOn ? (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover bg-gray-800"
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <div className="text-white text-center p-4">
              <VideoOff className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Camera Off</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black bg-opacity-70 p-4 flex justify-center space-x-4">
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          size="icon"
          onClick={toggleMute}
          className="rounded-full h-12 w-12"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          variant={!isVideoOn ? "destructive" : "secondary"}
          size="icon"
          onClick={toggleVideo}
          className="rounded-full h-12 w-12"
          aria-label={isVideoOn ? 'Stop Video' : 'Start Video'}
        >
          {isVideoOn ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMinimize}
          className="rounded-full h-12 w-12 bg-gray-700 text-white hover:bg-gray-600"
          aria-label="Minimize call"
        >
          <Minimize2 className="h-5 w-5" />
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={handleEndCall}
          className="rounded-full h-12 w-12"
          aria-label="End call"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full px-4 font-medium">
          {formatDuration(callDuration)}
        </div>
      </div>
    </div>
  );
}
