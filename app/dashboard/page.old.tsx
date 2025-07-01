"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Calendar, Clock, CheckCircle2, X, Loader2, Video as VideoIcon, MessageSquare, Activity, Zap, Phone } from "lucide-react"

export default function DashboardPage() {
  // State for Schedule Appointment
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([
    { id: 1, time: "Mon 10:00 AM", available: true },
    { id: 2, time: "Tue 2:00 PM", available: true },
    { id: 3, time: "Wed 11:00 AM", available: true },
  ])

  // State for Today's Exercises
  const [showExercises, setShowExercises] = useState(false)
  const [exercises, setExercises] = useState([
    { id: 1, name: "Shoulder Stretch", completed: false },
    { id: 2, name: "Neck Rotation", completed: false },
    { id: 3, name: "Arm Circles", completed: false },
  ])

  // State for AI Assistant
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm here to help with your rehabilitation.", sender: 'ai' },
    { id: 2, text: "Do you want pain relief tips?", sender: 'ai' },
    { id: 3, text: "Try stretching daily for better results!", sender: 'ai' },
  ])
  const [newMessage, setNewMessage] = useState("")

  // State for OpenPose Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // State for Video Consultation
  const [videoActive, setVideoActive] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)

  // Handle exercise completion
  const toggleExercise = (id: number) => {
    const updatedExercises = exercises.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    )
    setExercises(updatedExercises)

    // Show completion message when all exercises are done
    if (updatedExercises.every(ex => ex.completed)) {
      toast.success("Great job! You've completed all exercises for today!")
    }
  }

  // Handle sending a new message in chat
  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, text: newMessage, sender: 'user' as const }])
      setNewMessage("")
      
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          id: prev.length + 1, 
          text: "I'm an AI assistant. How can I help you today?", 
          sender: 'ai' as const 
        }])
      }, 1000)
    }
  }

  // Simulate pose analysis
  const startPoseAnalysis = () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAnalyzing(false)
          toast.success("Pose analysis completed successfully!")
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  // Toggle video consultation
  const toggleVideo = () => {
    setVideoActive(!videoActive)
    if (!videoActive) {
      toast.info("Video consultation is starting...")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Rehabilitation Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your daily overview.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Schedule Appointment Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Schedule Appointment</CardTitle>
              <div className="rounded-md border border-green-200 bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                Available
              </div>
            </div>
            <CardDescription>Book your next session with a specialist</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
              <DialogTrigger asChild>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  <Calendar className="mr-2 h-4 w-4" />
                  Available Slots
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Available Time Slots</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {availableSlots.map((slot: { id: number, time: string, available: boolean }) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{slot.time}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        className="bg-black text-white hover:bg-gray-800"
                        onClick={() => {
                          toast.success(`Appointment scheduled for ${slot.time}`)
                          setShowAppointmentModal(false)
                        }}
                        type="button"
                      >
                        Book
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Today's Exercises Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Today's Exercises</CardTitle>
              <div className="rounded-md border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                3 Pending
              </div>
            </div>
            <CardDescription>Complete your daily exercise routine</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={showExercises} onOpenChange={setShowExercises}>
              <DialogTrigger asChild>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  <Activity className="mr-2 h-4 w-4" />
                  View Exercises
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Today's Exercise Plan</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {exercises.map((exercise: { id: number, name: string, completed: boolean }) => (
                    <div key={exercise.id} className="flex items-center space-x-3">
                      <Checkbox 
                        id={`ex-${exercise.id}`} 
                        checked={exercise.completed}
                        onCheckedChange={() => toggleExercise(exercise.id)}
                      />
                      <Label htmlFor={`ex-${exercise.id}`} className={exercise.completed ? 'line-through text-gray-500' : ''}>
                        {exercise.name}
                      </Label>
                      {exercise.completed && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* AI Assistant Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI Assistant</CardTitle>
              <div className="rounded-md border border-purple-200 bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                Online
              </div>
            </div>
            <CardDescription>Get instant help from our AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={showChat} onOpenChange={setShowChat}>
              <DialogTrigger asChild>
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat with AI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md h-[600px] flex flex-col">
                <DialogHeader>
                  <DialogTitle>AI Assistant</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto space-y-4 p-2">
                  {messages.map(message => (
                    <div 
                      key={message.id} 
                      className={`p-3 rounded-lg max-w-[80%] ${message.sender === 'ai' ? 'bg-gray-100' : 'bg-black text-white ml-auto'}`}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="flex gap-2 mt-4">
                  <Input 
                    value={newMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && sendMessage(e as any)}
                  />
                  <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                    Send
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* OpenPose Analysis Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pose Analysis</CardTitle>
              <div className="rounded-md border border-yellow-200 bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                Ready
              </div>
            </div>
            <CardDescription>Analyze your exercise form</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={startPoseAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing... {analysisProgress}%
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-4 w-4" />
                  Start Analysis
                </>
              )}
            </Button>
            {isAnalyzing && (
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Consultation Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Video Consultation</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Online
              </Badge>
            </div>
            <CardDescription>Connect with your therapist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
              {videoActive ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-blue-500 bg-opacity-50 flex items-center justify-center">
                    <VideoIcon className="h-10 w-10 text-white" />
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <VideoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">Video feed will appear here</p>
                </div>
              )}
              
              {/* Video controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className={`rounded-full ${micMuted ? 'bg-red-100 text-red-600' : 'bg-gray-800 text-white'}`}
                  onClick={() => setMicMuted(!micMuted)}
                >
                  {micMuted ? <X className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full bg-red-600 text-white hover:bg-red-700"
                  onClick={toggleVideo}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className={`rounded-full ${cameraOff ? 'bg-red-100 text-red-600' : 'bg-gray-800 text-white'}`}
                  onClick={() => setCameraOff(!cameraOff)}
                >
                  {cameraOff ? <X className="h-4 w-4" /> : <VideoIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              className={`w-full ${videoActive ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-800'} text-white`}
              onClick={toggleVideo}
            >
              {videoActive ? 'End Call' : 'Start Session'}
            </Button>
          </CardContent>
        </Card>

        {/* Progress Tracking Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Your Progress</CardTitle>
              <div className="rounded-md border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                75% Complete
              </div>
            </div>
            <CardDescription>Weekly rehabilitation progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Exercise Completion</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Session Attendance</span>
                  <span>100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <Button className="w-full bg-black text-white hover:bg-gray-800 mt-4">
                View Full Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
