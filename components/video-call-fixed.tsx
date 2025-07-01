"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/auth-provider"
import { FrontendWebRTC, VideoCallState } from "@/lib/frontend-webrtc"
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, MessageCircle, 
  ScreenShare, Maximize2, Minimize2, Bot, Activity, X, Settings, 
  Volume2, VolumeX, Camera, CameraOff, Monitor, Users, Heart, Zap, 
  Star, Award, Shield, Wifi, Phone as PhoneIcon, MonitorOff, 
  BarChart3, Sparkles, Video as VideoIcon, StopCircle, Brain 
} from "lucide-react"
import Image from "next/image"

// Interface for component props
interface VideoCallProps {
  therapistName: string;
  therapistImage: string;
  onEndCall: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  isAIAgent?: boolean;
  sessionId: string;
  userId?: string;
  userType?: 'doctor' | 'patient';
  userName?: string;
}

const VideoCall: React.FC<VideoCallProps> = ({
  therapistName,
  therapistImage,
  onEndCall,
  isMinimized = false,
  onToggleMinimize,
  isAIAgent = false,
  sessionId,
  userId = 'user-123',
  userType = 'patient',
  userName = 'Pasien'
}) => {
  // State management
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [doctorSpeaking, setDoctorSpeaking] = useState(false);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callDurationRef = useRef<NodeJS.Timeout>();
  
  // Simulate call duration
  useEffect(() => {
    callDurationRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (callDurationRef.current) {
        clearInterval(callDurationRef.current);
      }
    };
  }, []);
  
  // Format call duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };
  
  // Toggle video
  const toggleVideo = () => {
    setIsVideoOn(prev => !prev);
  };
  
  // Toggle screen share
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } else {
        const stream = localVideoRef.current?.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
      
      setIsScreenSharing(prev => !prev);
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };
  
  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(prev => !prev);
  };
  
  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(prev => !prev);
  };
  
  // Toggle analytics panel
  const toggleAnalytics = () => {
    setShowAnalytics(prev => !prev);
  };
  
  // Simulate AI doctor speech
  const simulateDoctorSpeech = () => {
    setDoctorSpeaking(true);
    setTimeout(() => {
      setDoctorSpeaking(false);
    }, 2000);
  };
  
  // Main render
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg overflow-hidden z-50 w-72">
        <div className="p-2 bg-[#014585] text-white flex justify-between items-center">
          <span>Panggilan Berlangsung</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs">{formatDuration(callDuration)}</span>
            <button 
              onClick={onToggleMinimize}
              className="p-1 hover:bg-white/20 rounded"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={therapistImage || "/placeholder-user.jpg"}
                alt={therapistName}
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-medium">Dr. {therapistName}</p>
              <p className="text-xs text-gray-500">Sedang berbicara...</p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onEndCall}
            className="rounded-full"
          >
            <PhoneOff className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-auto">
      {/* Main video container */}
      <div className="relative h-full w-full">
        {/* Remote video / AI avatar */}
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          {isAIAgent ? (
            <div className="text-center">
              <div className="relative mb-6">
                <div 
                  className={`w-40 h-40 rounded-full overflow-hidden border-4 mx-auto transition-all duration-300 ${
                    doctorSpeaking 
                      ? 'border-green-400 shadow-lg shadow-green-400/30 scale-110' 
                      : 'border-blue-400'
                  }`}
                >
                  <Image
                    src={therapistImage || "/placeholder-user.jpg"}
                    alt={therapistName}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div 
                  className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-400 text-white text-xs px-2 py-1 rounded-full flex items-center ${
                    doctorSpeaking ? 'animate-bounce' : ''
                  }`}
                >
                  <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                  Live
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">Dr. {therapistName}</h3>
              <p className="text-gray-300">Dokter Spesialis Jiwa</p>
            </div>
          ) : (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Local video */}
        <div className="absolute bottom-24 right-6 w-48 h-36 rounded-lg overflow-hidden border-2 border-white shadow-xl">
          {isVideoOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {userName}
          </div>
        </div>

        {/* Control bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="flex items-center justify-center space-x-6">
            {/* Mute button */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full ${
                isMuted ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'
              } text-white transition-colors`}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>

            {/* Video button */}
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${
                !isVideoOn ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'
              } text-white transition-colors`}
            >
              {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </button>

            {/* Screen share button */}
            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full ${
                isScreenSharing ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'
              } text-white transition-colors`}
            >
              <ScreenShare className="h-6 w-6" />
            </button>

            {/* End call button */}
            <button
              onClick={onEndCall}
              className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              <PhoneOff className="h-6 w-6" />
            </button>

            {/* Settings button */}
            <button
              onClick={toggleSettings}
              className={`p-3 rounded-full ${
                showSettings ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'
              } text-white transition-colors`}
            >
              <Settings className="h-6 w-6" />
            </button>

            {/* Analytics button */}
            <button
              onClick={toggleAnalytics}
              className={`p-3 rounded-full ${
                showAnalytics ? 'bg-blue-500' : 'bg-white/10 hover:bg-white/20'
              } text-white transition-colors`}
            >
              <BarChart3 className="h-6 w-6" />
            </button>
          </div>

          {/* Call duration */}
          <div className="text-center mt-2 text-white text-sm">
            {formatDuration(callDuration)}
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="absolute top-4 right-4 w-80 bg-white/90 backdrop-blur-md rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Pengaturan Panggilan</h3>
              <button
                onClick={toggleSettings}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Noise Cancellation</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Beauty Filter</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Virtual Background</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Recording</span>
                <Switch 
                  checked={isRecording}
                  onCheckedChange={toggleRecording}
                />
              </div>
              
              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kualitas Video
                </label>
                <select className="w-full p-2 border rounded-md text-sm">
                  <option>Otomatis</option>
                  <option>HD (720p)</option>
                  <option>Full HD (1080p)</option>
                  <option>4K</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Analytics panel */}
        {showAnalytics && (
          <div className="absolute top-4 left-4 w-80 bg-white/90 backdrop-blur-md rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Analisis Panggilan</h3>
              <button
                onClick={toggleAnalytics}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Koneksi</span>
                  <span className="text-green-600 font-medium">Stabil</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Kualitas Audio</span>
                  <span className="text-green-600 font-medium">Baik</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Kualitas Video</span>
                  <span className="text-green-600 font-medium">Baik</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
              
              <div className="pt-2">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Statistik Panggilan
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">Durasi</div>
                    <div className="font-medium">{formatDuration(callDuration)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">Jitter</div>
                    <div className="font-medium">3ms</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">Packet Loss</div>
                    <div className="font-medium">0.1%</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500">Latensi</div>
                    <div className="font-medium">45ms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
