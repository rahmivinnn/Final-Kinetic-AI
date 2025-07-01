'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Phone, X, Settings, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import SimpleDoctor from './SimpleDoctor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs';
import { drawKeypoints, drawSkeleton } from '@/lib/poseUtils';

// Configuration for pose detection
const DETECTION_CONFIG = {
  modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  enableSmoothing: true,
  minPoseConfidence: 0.3,
  minPartConfidence: 0.3,
  nmsRadius: 20,
  outputStride: 16,
  scale: 0.5,
};

export default function VideoConsultation() {
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [poseDetector, setPoseDetector] = useState(null);
  const [poseModel, setPoseModel] = useState('mediapipe'); // 'mediapipe' or 'openpose'
  const [isLoading, setIsLoading] = useState(false);
  const [fps, setFps] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  
  const videoRef = useRef(null);
  const localVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastFpsUpdate = useRef(0);
  const frameCount = useRef(0);

  // Initialize pose detector
  useEffect(() => {
    async function initializePoseDetector() {
      setIsLoading(true);
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        
        const detectorConfig = {
          runtime: 'tfjs',
          modelType: poseModel === 'mediapipe' ? 
            poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING :
            poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
        };

        const detector = await poseDetection.createDetector(
          poseModel === 'mediapipe' ? poseDetection.SupportedModels.MoveNet : poseDetection.SupportedModels.BlazePose,
          detectorConfig
        );
        
        setPoseDetector(detector);
      } catch (error) {
        console.error('Error initializing pose detector:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (isConnected) {
      initializePoseDetector();
    }

    return () => {
      if (poseDetector) {
        poseDetector.dispose();
      }
    };
  }, [isConnected, poseModel]);

  // Start video stream
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: !micMuted
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Start pose detection when video starts playing
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play();
          detectPose();
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  // Stop video stream
  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Toggle video on/off
  const toggleVideo = async () => {
    if (videoActive) {
      stopVideo();
    } else {
      await startVideo();
    }
    setVideoActive(!videoActive);
  };

  // Toggle microphone
  const toggleMic = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setMicMuted(!micMuted);
  };

  // End call
  const endCall = () => {
    stopVideo();
    setVideoActive(false);
    setIsConnected(false);
    setShowJoinDialog(true);
  };

  // Join call
  const joinCall = async () => {
    setShowJoinDialog(false);
    setIsConnected(true);
    await startVideo();
  };

  // Toggle between pose detection models
  const togglePoseModel = () => {
    setPoseModel(prev => prev === 'mediapipe' ? 'openpose' : 'mediapipe');
    if (poseDetector) {
      poseDetector.dispose();
      setPoseDetector(null);
    }
  };

  // Detect pose in video frames
  const detectPose = async () => {
    if (!localVideoRef.current || !canvasRef.current || !poseDetector) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const video = localVideoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    // Set canvas dimensions to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    try {
      // Draw video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Detect poses
      const poses = await poseDetector.estimatePoses(video, {
        flipHorizontal: false,
      });

      // Draw keypoints and skeleton
      if (poses.length > 0) {
        drawKeypoints(poses[0].keypoints, 0.3, ctx);
        drawSkeleton(poses[0].keypoints, 0.3, ctx);
      }
      
      // Calculate FPS
      const now = performance.now();
      frameCount.current++;
      
      if (now - lastFpsUpdate.current > 1000) {
        setFps(Math.round((frameCount.current * 1000) / (now - lastFpsUpdate.current)));
        frameCount.current = 0;
        lastFpsUpdate.current = now;
      }
      
    } catch (error) {
      console.error('Error detecting pose:', error);
    }
    
    animationFrameRef.current = requestAnimationFrame(detectPose);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Video Consultation</h3>
        {isConnected ? (
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-100 text-green-800 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            Live Now
          </div>
        ) : (
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-yellow-100 text-yellow-800 border-yellow-200">
            Offline
          </div>
        )}
      </div>
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
        {isConnected ? (
          <div className="relative w-full h-[400px]">
            <div className="relative w-full h-full">
              <video 
                ref={localVideoRef} 
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {poseModel === 'mediapipe' ? 'MediaPipe' : 'OpenPose'} | FPS: {fps}
              </div>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <RefreshCw className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-[400px] flex items-center justify-center bg-gray-50">
            <div className="text-center p-6 max-w-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                <Video className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Video Consultation</h3>
              <p className="text-black mb-6">Connect with a rehabilitation specialist for your session</p>
              <button
                onClick={() => setShowJoinDialog(true)}
                className="inline-flex items-center px-6 py-3 rounded-full text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Join Consultation
              </button>
            </div>
          </div>
        )}
        {isConnected && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4 z-10">
            <button 
              onClick={toggleMic} 
              className={`p-3 rounded-full ${micMuted ? 'bg-red-500' : 'bg-gray-800/90'} text-white hover:bg-opacity-80 transition-all`} 
              aria-label={micMuted ? 'Unmute' : 'Mute'}
              disabled={isLoading}
            >
              {micMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button 
              onClick={toggleVideo} 
              className={`p-3 rounded-full ${!videoActive ? 'bg-red-500' : 'bg-gray-800/90'} text-white hover:bg-opacity-80 transition-all`} 
              aria-label={videoActive ? 'Turn off video' : 'Turn on video'}
              disabled={isLoading}
            >
              {!videoActive ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>
            <button 
              onClick={endCall} 
              className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all" 
              aria-label="End call"
              disabled={isLoading}
            >
              <Phone className="h-5 w-5" />
            </button>
            <button 
              onClick={togglePoseModel}
              className="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all"
              aria-label="Switch pose detection model"
              disabled={isLoading}
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
          <p className="text-sm font-medium text-black">Dr. Smith</p>
          <p className="text-xs text-black">Rehabilitation Specialist</p>
        </div>
      </div>

      {/* Join Consultation Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-black">Join Video Consultation</DialogTitle>
            <DialogDescription className="text-black mt-2">
              Ready to start your video consultation? Make sure your camera and microphone are working properly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Mic className="h-4 w-4" />
                <span className="text-black">Microphone</span>
              </div>
              <div className="ml-auto">
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  micMuted ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {micMuted ? 'Muted' : 'Unmuted'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Video className="h-4 w-4" />
                <span className="text-black">Camera</span>
              </div>
              <div className="ml-auto">
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  cameraOff ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {cameraOff ? 'Off' : 'On'}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setMicMuted(!micMuted)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {micMuted ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
              {micMuted ? 'Unmute' : 'Mute'}
            </button>
            <button
              onClick={() => setCameraOff(!cameraOff)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {cameraOff ? <VideoOff className="h-4 w-4 mr-1" /> : <Video className="h-4 w-4 mr-1" />}
              {cameraOff ? 'Turn On' : 'Turn Off'}
            </button>
          </div>
          <div className="mt-6">
            <button
              onClick={joinCall}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Join Now
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
