'use client';

import { useState, useEffect } from 'react';
import VideoConsultation from '@/components/VideoConsultation';
import { IntegratedTherapySession } from '@/components/integrated-therapy-session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Activity, 
  Camera, 
  Mic, 
  Settings, 
  Play, 
  Square,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function VideoCallDemoPage() {
  const [activeDemo, setActiveDemo] = useState('video-consultation');
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [micStatus, setMicStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
  }>({ cameras: [], microphones: [] });

  // Check device availability on component mount
  useEffect(() => {
    checkDeviceAvailability();
  }, []);

  const checkDeviceAvailability = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('unavailable');
        setMicStatus('unavailable');
        return;
      }

      // Get list of available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      const microphones = devices.filter(device => device.kind === 'audioinput');
      
      setDeviceInfo({ cameras, microphones });
      
      // Test camera access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        setCameraStatus('available');
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Camera test failed:', error);
        setCameraStatus('unavailable');
      }

      // Test microphone access
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: false, 
          audio: true 
        });
        setMicStatus('available');
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Microphone test failed:', error);
        setMicStatus('unavailable');
      }

    } catch (error) {
      console.error('Device check failed:', error);
      setCameraStatus('unavailable');
      setMicStatus('unavailable');
    }
  };

  const testCamera = async () => {
    setIsTestingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
      
      // Create a temporary video element to test the stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setIsTestingCamera(false);
        alert('Camera and microphone test successful! You can now use the video call features.');
      }, 2000);
      
    } catch (error) {
      setIsTestingCamera(false);
      console.error('Camera test failed:', error);
      alert('Camera test failed: ' + error.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unavailable':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Checking...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Video Call & Pose Detection Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Experience real-time video calling with integrated pose detection using MediaPipe and OpenPose. 
            No backend required - everything runs in your browser!
          </p>
        </div>

        {/* Device Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Device Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Camera className="h-5 w-5" />
                  <span className="font-medium">Camera</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(cameraStatus)}
                  <span className="text-sm">{getStatusText(cameraStatus)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mic className="h-5 w-5" />
                  <span className="font-medium">Microphone</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(micStatus)}
                  <span className="text-sm">{getStatusText(micStatus)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <Button 
                  onClick={testCamera}
                  disabled={isTestingCamera || cameraStatus === 'unavailable'}
                  className="w-full"
                >
                  {isTestingCamera ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Test Camera
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Device Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Available Cameras ({deviceInfo.cameras.length})</h4>
                <ul className="space-y-1">
                  {deviceInfo.cameras.map((camera, index) => (
                    <li key={index} className="text-gray-600">
                      {camera.label || `Camera ${index + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Available Microphones ({deviceInfo.microphones.length})</h4>
                <ul className="space-y-1">
                  {deviceInfo.microphones.map((mic, index) => (
                    <li key={index} className="text-gray-600">
                      {mic.label || `Microphone ${index + 1}`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Tabs */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video-consultation" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span>Video Consultation</span>
            </TabsTrigger>
            <TabsTrigger value="integrated-session" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Integrated Therapy</span>
            </TabsTrigger>
          </TabsList>

          {/* Video Consultation Demo */}
          <TabsContent value="video-consultation">
            <Card>
              <CardHeader>
                <CardTitle>Video Consultation with Pose Detection</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Real Camera Access</Badge>
                  <Badge variant="secondary">MediaPipe Integration</Badge>
                  <Badge variant="secondary">OpenPose Support</Badge>
                  <Badge variant="secondary">No Backend Required</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Features:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Real-time camera and microphone access</li>
                      <li>Switch between MediaPipe and OpenPose detection models</li>
                      <li>Live pose detection with skeleton overlay</li>
                      <li>FPS monitoring and confidence scoring</li>
                      <li>Mirror mode for better user experience</li>
                    </ul>
                  </div>
                  
                  <VideoConsultation />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrated Therapy Session Demo */}
          <TabsContent value="integrated-session">
            <Card>
              <CardHeader>
                <CardTitle>Integrated Therapy Session</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Video + Pose Analysis</Badge>
                  <Badge variant="secondary">Real-time Feedback</Badge>
                  <Badge variant="secondary">Session Analytics</Badge>
                  <Badge variant="secondary">Exercise Tracking</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Advanced Features:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Combined video calling and pose estimation</li>
                      <li>Real-time movement analysis and feedback</li>
                      <li>Exercise progress tracking</li>
                      <li>Session analytics and history</li>
                      <li>AI-powered therapy recommendations</li>
                    </ul>
                  </div>
                  
                  <IntegratedTherapySession 
                    sessionType="ai-therapy"
                    therapistName="Dr. AI Assistant"
                    therapistImage="/caring-doctor.png"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Video Consultation:</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Click "Join Consultation" to start</li>
                  <li>Allow camera and microphone access when prompted</li>
                  <li>Use the purple settings button to switch between MediaPipe and OpenPose</li>
                  <li>Watch real-time pose detection with skeleton overlay</li>
                  <li>Monitor FPS and confidence scores in the top-left corner</li>
                </ol>
              </div>
              <div>
                <h4 className="font-medium mb-3">Integrated Therapy:</h4>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Navigate to different tabs (Session Control, Video Call, Pose Analysis, Analytics)</li>
                  <li>Start video call and pose analysis independently or together</li>
                  <li>Perform exercises to see real-time feedback</li>
                  <li>View session analytics and progress tracking</li>
                  <li>Check analysis history for detailed insights</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}