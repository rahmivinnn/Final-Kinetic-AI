"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Camera,
  Video,
  Play,
  Pause,
  RefreshCw,
  Save,
  Settings,
  Download,
  Info,
  BarChart,
  Activity,
  Zap,
  Eye,
  Sliders,
  MessageSquare,
  Volume2,
  VolumeX
} from "lucide-react"

interface PoseKeypoint {
  x: number
  y: number
  confidence: number
}

interface PoseData {
  keypoints: PoseKeypoint[]
  score: number
}

interface ExerciseMetrics {
  speed: number
  range: number
  stability: number
  symmetry: number
  power: number
  endurance: number
}

interface AdvancedMetrics {
  activity: string
  emotion: string
  posture_score: number
  anomaly_detected: boolean
  symmetry_score: number
  range_of_motion: Record<string, number>
  joint_angles: Record<string, number>
}

export default function PoseEstimationPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const poseDetectionRef = useRef<any>(null)
  const sessionStartTime = useRef<number>(0)
  const [isRecording, setIsRecording] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [currentExercise, setCurrentExercise] = useState('squat')
  const [repCount, setRepCount] = useState(0)
  const [accuracy, setAccuracy] = useState(85)
  const [feedback, setFeedback] = useState('Keep your back straight')
  const [sessionTime, setSessionTime] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [poseData, setPoseData] = useState<any>(null)
  const [exercisePhase, setExercisePhase] = useState('ready')
  const [confidence, setConfidence] = useState(0)
  const [calibrationComplete, setCalibrationComplete] = useState(false)
  const [sensitivity, setSensitivity] = useState([75])
  const [realTimeMetrics, setRealTimeMetrics] = useState<ExerciseMetrics>({
    speed: 0,
    range: 0,
    stability: 0,
    symmetry: 0,
    power: 0,
    endurance: 0
  })
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics>({
    activity: 'exercise',
    emotion: 'focused',
    posture_score: 85,
    anomaly_detected: false,
    symmetry_score: 90,
    range_of_motion: {
      knee: 120,
      hip: 90,
      ankle: 30
    },
    joint_angles: {
      knee: 100,
      hip: 85,
      ankle: 25
    }
  })
  const [multiPersonMode, setMultiPersonMode] = useState(false)
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true)
  const [analysisMode, setAnalysisMode] = useState('standard')
  const [aiInsights, setAiInsights] = useState<string[]>([
    'Your squat depth has improved by 15% since last session',
    'Try to maintain more consistent tempo between repetitions',
    'Your left/right balance has improved significantly'
  ])

  useEffect(() => {
    // Cleanup function to stop camera and animation frame when component unmounts
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    // Update session time every second when recording
    let interval: NodeJS.Timeout
    
    if (isRecording) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setCameraEnabled(true)
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setCameraEnabled(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      setIsAnalyzing(false)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    } else {
      // Start recording
      setIsRecording(true)
      setIsAnalyzing(true)
      sessionStartTime.current = Date.now()
      detectPose()
    }
  }

  const detectPose = () => {
    if (videoRef.current && canvasRef.current && isAnalyzing) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx && video.readyState === 4) {
        // Set canvas size to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Simulate advanced pose detection
        simulateAdvancedPoseDetection(ctx, canvas.width, canvas.height)
      }
      
      // Continue detection loop
      animationFrameRef.current = requestAnimationFrame(detectPose)
    }
  }

  const simulateAdvancedPoseDetection = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Simulate pose landmarks
    const landmarks = generateSimulatedLandmarks(width, height)
    
    // Draw pose skeleton
    drawPoseSkeleton(ctx, landmarks)
    
    // Analyze exercise form
    const analysis = analyzeExerciseForm(landmarks)
    
    // Update metrics
    setRealTimeMetrics(analysis.metrics)
    setConfidence(analysis.confidence)
    setAccuracy(analysis.accuracy)
    setFeedback(analysis.feedback)
    
    // Update exercise phase
    setExercisePhase(analysis.phase)
    
    // Update rep count occasionally
    if (Math.random() < 0.01) {
      setRepCount(prev => prev + 1)
    }
  }

  const generateSimulatedLandmarks = (width: number, height: number) => {
    // Simulate keypoints for a person doing exercise
    // This would be replaced with actual pose detection in production
    const centerX = width / 2
    const centerY = height / 2
    
    // Add some movement to simulate exercise
    const time = Date.now() / 1000
    const yOffset = Math.sin(time * 2) * 20 // Simulate up/down movement
    
    return {
      // Basic body keypoints
      nose: { x: centerX, y: centerY - 80 + yOffset / 2, confidence: 0.9 },
      leftEye: { x: centerX - 15, y: centerY - 85 + yOffset / 2, confidence: 0.9 },
      rightEye: { x: centerX + 15, y: centerY - 85 + yOffset / 2, confidence: 0.9 },
      leftEar: { x: centerX - 30, y: centerY - 80 + yOffset / 2, confidence: 0.8 },
      rightEar: { x: centerX + 30, y: centerY - 80 + yOffset / 2, confidence: 0.8 },
      leftShoulder: { x: centerX - 50, y: centerY - 40 + yOffset / 3, confidence: 0.9 },
      rightShoulder: { x: centerX + 50, y: centerY - 40 + yOffset / 3, confidence: 0.9 },
      leftElbow: { x: centerX - 70, y: centerY + yOffset / 3, confidence: 0.8 },
      rightElbow: { x: centerX + 70, y: centerY + yOffset / 3, confidence: 0.8 },
      leftWrist: { x: centerX - 80, y: centerY + 40 + yOffset / 4, confidence: 0.8 },
      rightWrist: { x: centerX + 80, y: centerY + 40 + yOffset / 4, confidence: 0.8 },
      leftHip: { x: centerX - 40, y: centerY + 40 + yOffset, confidence: 0.9 },
      rightHip: { x: centerX + 40, y: centerY + 40 + yOffset, confidence: 0.9 },
      leftKnee: { x: centerX - 45, y: centerY + 120 + yOffset * 2, confidence: 0.8 },
      rightKnee: { x: centerX + 45, y: centerY + 120 + yOffset * 2, confidence: 0.8 },
      leftAnkle: { x: centerX - 50, y: centerY + 200 + yOffset / 2, confidence: 0.8 },
      rightAnkle: { x: centerX + 50, y: centerY + 200 + yOffset / 2, confidence: 0.8 }
    }
  }

  const drawPoseSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any) => {
    // Set drawing style
    ctx.strokeStyle = '#00ff00'
    ctx.lineWidth = 3
    ctx.fillStyle = '#ff0000'
    
    // Draw connections
    const connections = [
      ['leftShoulder', 'rightShoulder'],
      ['leftShoulder', 'leftElbow'],
      ['leftElbow', 'leftWrist'],
      ['rightShoulder', 'rightElbow'],
      ['rightElbow', 'rightWrist'],
      ['leftShoulder', 'leftHip'],
      ['rightShoulder', 'rightHip'],
      ['leftHip', 'rightHip'],
      ['leftHip', 'leftKnee'],
      ['leftKnee', 'leftAnkle'],
      ['rightHip', 'rightKnee'],
      ['rightKnee', 'rightAnkle']
    ]
    
    // Draw lines connecting keypoints
    connections.forEach(([from, to]) => {
      const fromPoint = landmarks[from]
      const toPoint = landmarks[to]
      
      if (fromPoint && toPoint && fromPoint.confidence > 0.5 && toPoint.confidence > 0.5) {
        ctx.beginPath()
        ctx.moveTo(fromPoint.x, fromPoint.y)
        ctx.lineTo(toPoint.x, toPoint.y)
        ctx.stroke()
      }
    })
    
    // Draw keypoints
    Object.values(landmarks).forEach((point: any) => {
      if (point.confidence > 0.5) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI)
        ctx.fill()
      }
    })
  }

  const analyzeExerciseForm = (landmarks: any) => {
    // This would be replaced with actual analysis in production
    // Simulate exercise form analysis
    const phase = ['preparation', 'eccentric', 'hold', 'concentric', 'rest'][Math.floor(Math.random() * 5)]
    
    // Generate random metrics that change slightly over time
    const time = Date.now() / 1000
    const metrics: ExerciseMetrics = {
      speed: 50 + Math.sin(time * 0.5) * 20,
      range: 60 + Math.sin(time * 0.3) * 15,
      stability: 70 + Math.sin(time * 0.2) * 10,
      symmetry: 80 + Math.sin(time * 0.4) * 10,
      power: 65 + Math.sin(time * 0.6) * 15,
      endurance: 75 + Math.sin(time * 0.1) * 5
    }
    
    // Simulate confidence and accuracy
    const confidence = 70 + Math.sin(time * 0.2) * 20
    const accuracy = 80 + Math.sin(time * 0.3) * 10
    
    // Generate feedback based on metrics
    const feedbackOptions = [
      'Keep your back straight',
      'Lower your hips more',
      'Good depth, maintain form',
      'Distribute weight evenly',
      'Excellent form!',
      'Try to go deeper',
      'Keep your knees aligned'
    ]
    
    const feedbackIndex = Math.floor(time % feedbackOptions.length)
    const feedback = feedbackOptions[feedbackIndex]
    
    return {
      phase,
      metrics,
      confidence,
      accuracy,
      feedback
    }
  }

  const resetSession = () => {
    setRepCount(0)
    setSessionTime(0)
    setAccuracy(85)
    setFeedback('Ready to start')
    setExercisePhase('ready')
    setRealTimeMetrics({
      speed: 0,
      range: 0,
      stability: 0,
      symmetry: 0,
      power: 0,
      endurance: 0
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Real-Time Pose Analysis</h1>
          <div className="flex items-center space-x-4">
            <Select value={currentExercise} onValueChange={setCurrentExercise}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select exercise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="squat">Squat</SelectItem>
                <SelectItem value="lunge">Lunge</SelectItem>
                <SelectItem value="pushup">Push-up</SelectItem>
                <SelectItem value="plank">Plank</SelectItem>
                <SelectItem value="deadlift">Deadlift</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetSession}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main video feed and controls */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Camera Feed</CardTitle>
                <Badge variant={exercisePhase === 'rest' ? 'outline' : 'default'} className="capitalize">
                  {exercisePhase}
                </Badge>
              </div>
              <CardDescription>
                Position yourself clearly in the frame for best results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {!cameraEnabled ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Camera className="h-16 w-16 mb-4 text-muted-foreground" />
                    <Button onClick={startCamera}>
                      Enable Camera
                    </Button>
                  </div>
                ) : (
                  <>
                    <video 
                      ref={videoRef} 
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <canvas 
                      ref={canvasRef} 
                      className="absolute inset-0 w-full h-full"
                    />
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {cameraEnabled && (
                    <Button 
                      variant={isRecording ? "destructive" : "default"}
                      onClick={toggleRecording}
                    >
                      {isRecording ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" /> Pause Analysis
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" /> Start Analysis
                        </>
                      )}
                    </Button>
                  )}
                  {cameraEnabled && (
                    <Button variant="outline" onClick={stopCamera}>
                      Stop Camera
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={voiceFeedbackEnabled}
                      onCheckedChange={setVoiceFeedbackEnabled}
                      id="voice-feedback"
                    />
                    <Label htmlFor="voice-feedback" className="cursor-pointer">
                      {voiceFeedbackEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={multiPersonMode}
                      onCheckedChange={setMultiPersonMode}
                      id="multi-person"
                    />
                    <Label htmlFor="multi-person" className="cursor-pointer text-sm">
                      Multi-person
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats and metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Real-time analysis of your exercise form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session Time</span>
                  <span className="font-mono">{formatTime(sessionTime)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Repetitions</span>
                  <span className="font-mono">{repCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Form Accuracy</span>
                  <span className="font-mono">{Math.round(accuracy)}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold">Real-time Metrics</h4>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Speed</span>
                      <span>{Math.round(realTimeMetrics.speed)}%</span>
                    </div>
                    <Progress value={realTimeMetrics.speed} />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Range of Motion</span>
                      <span>{Math.round(realTimeMetrics.range)}%</span>
                    </div>
                    <Progress value={realTimeMetrics.range} />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Stability</span>
                      <span>{Math.round(realTimeMetrics.stability)}%</span>
                    </div>
                    <Progress value={realTimeMetrics.stability} />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Symmetry</span>
                      <span>{Math.round(realTimeMetrics.symmetry)}%</span>
                    </div>
                    <Progress value={realTimeMetrics.symmetry} />
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Feedback</AlertTitle>
                <AlertDescription>{feedback}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Advanced analysis section */}
        <Tabs defaultValue="insights">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Metrics</TabsTrigger>
            <TabsTrigger value="settings">Analysis Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-blue-500" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>
                  Personalized recommendations based on your movement patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="mt-0.5">
                        <Activity className="h-5 w-5 text-blue-500" />
                      </div>
                      <p>{insight}</p>
                    </div>
                  ))}
                  
                  <Textarea 
                    placeholder="Ask for specific feedback or advice..."
                    className="mt-4"
                  />
                  
                  <Button className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Get Personalized Advice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2 h-5 w-5 text-blue-500" />
                  Advanced Biomechanics
                </CardTitle>
                <CardDescription>
                  Detailed analysis of your movement patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Posture Score</h4>
                      <div className="flex items-center">
                        <Progress value={advancedMetrics.posture_score} className="flex-1 mr-3" />
                        <span className="text-sm">{advancedMetrics.posture_score}%</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Symmetry Score</h4>
                      <div className="flex items-center">
                        <Progress value={advancedMetrics.symmetry_score} className="flex-1 mr-3" />
                        <span className="text-sm">{advancedMetrics.symmetry_score}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Joint Angles</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(advancedMetrics.joint_angles).map(([joint, angle]) => (
                        <div key={joint} className="bg-muted/50 p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground capitalize">{joint}</div>
                          <div className="text-lg font-semibold">{angle}°</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Range of Motion</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(advancedMetrics.range_of_motion).map(([joint, range]) => (
                        <div key={joint} className="bg-muted/50 p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground capitalize">{joint}</div>
                          <div className="text-lg font-semibold">{range}°</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Activity Recognition</h4>
                      <p className="text-sm text-muted-foreground capitalize">{advancedMetrics.activity}</p>
                    </div>
                    
                    <div className="text-right">
                      <h4 className="text-sm font-medium">Emotional State</h4>
                      <p className="text-sm text-muted-foreground capitalize">{advancedMetrics.emotion}</p>
                    </div>
                  </div>
                  
                  {advancedMetrics.anomaly_detected && (
                    <Alert variant="destructive">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Movement Anomaly Detected</AlertTitle>
                      <AlertDescription>
                        Unusual movement pattern detected. Consider consulting with your physical therapist.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5 text-blue-500" />
                  Analysis Configuration
                </CardTitle>
                <CardDescription>
                  Customize your pose estimation experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="analysis-mode">Analysis Mode</Label>
                    <Select value={analysisMode} onValueChange={setAnalysisMode}>
                      <SelectTrigger id="analysis-mode">
                        <SelectValue placeholder="Select analysis mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="performance">Performance Focus</SelectItem>
                        <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sensitivity">Detection Sensitivity</Label>
                      <span className="text-sm">{sensitivity[0]}%</span>
                    </div>
                    <Slider
                      id="sensitivity"
                      min={0}
                      max={100}
                      step={1}
                      value={sensitivity}
                      onValueChange={setSensitivity}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="calibration">Calibration</Label>
                      <Badge variant={calibrationComplete ? "default" : "outline"}>
                        {calibrationComplete ? "Completed" : "Required"}
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setCalibrationComplete(true)}>
                      Run Calibration
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Calibration improves accuracy by adapting to your body proportions and environment
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Advanced Settings</h4>
                      <p className="text-xs text-muted-foreground">
                        Configure detection parameters
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Sliders className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Export Data</h4>
                      <p className="text-xs text-muted-foreground">
                        Download your session data
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}