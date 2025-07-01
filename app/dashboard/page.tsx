"use client"

import * as React from 'react';
import { useState, useEffect, FormEvent, ChangeEvent, ReactNode } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { exerciseCategories } from '@/lib/exercise-data';

// Type for components with children
interface WithChildren {
  children: ReactNode;
}
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  X, 
  Loader2, 
  MessageSquare, 
  Activity, 
  Zap, 
  Phone, 
  Video as VideoIcon,
  User as UserIcon,
  Plus,
  Flame,
  Award,
  Dumbbell
} from "lucide-react"
import dynamic from 'next/dynamic';

// Import components with dynamic SSR
const VideoConsultation = dynamic(
  () => import('@/components/VideoConsultation'),
  { ssr: false, loading: () => <div>Loading video...</div> }
);

const ExerciseLibrary = dynamic(
  () => import('@/components/ExerciseLibrary'),
  { ssr: false, loading: () => <div>Loading exercises...</div> }
);

export default function DashboardPage() {
  // State untuk jadwal konsultasi
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [availableSlots] = useState([
    { id: 1, time: "Mon 10:00 AM", available: true },
    { id: 2, time: "Tue 2:00 PM", available: true },
    { id: 3, time: "Wed 11:00 AM", available: true },
  ])

  // State for exercise library
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false)
  const [exercises, setExercises] = useState([
    { id: 1, name: "Shoulder Stretch", completed: false },
    { id: 2, name: "Neck Rotation", completed: false },
    { id: 3, name: "Arm Circles", completed: false },
  ])

  // State untuk AI Chat
  const [showChat, setShowChat] = useState(false)
  const [messages] = useState([
    { id: 1, text: "Hello! I'm here to help with your rehabilitation.", sender: 'ai' },
    { id: 2, text: "Do you want pain relief tips?", sender: 'ai' },
    { id: 3, text: "Try stretching daily for better results!", sender: 'ai' },
  ])
  const [newMessage, setNewMessage] = useState("")

  // State untuk analisis pose
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Toggle status latihan
  const toggleExercise = (id: number) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ))
  }

  // Handle pengiriman pesan
  const sendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    // Di sini bisa ditambahkan logika pengiriman pesan
    setNewMessage("")
  }
  
  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
  }

  // Simulasi analisis pose
  const startPoseAnalysis = () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAnalyzing(false)
          toast.success("Analysis completed!")
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Rehabilitation Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your daily overview.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom kiri - Profil & Jadwal */}
        <div className="space-y-6">
          {/* Kartu Profil */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-black">John Doe</h3>
                  <p className="text-sm text-gray-600">Patient ID: PT-00123</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Next Appointment:</span>
                  <span className="text-black">Tomorrow, 2:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Therapist:</span>
                  <span className="text-black">Dr. Smith</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kartu Jadwal */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                <button 
                  onClick={() => setShowAppointmentModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> New
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-black">Video Consultation</p>
                    <p className="text-sm text-gray-600">Tomorrow, 2:00 PM</p>
                  </div>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
                    Join
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kolom tengah - Video Consultation */}
        <div className="space-y-6">
          {/* Komponen Video Consultation */}
          <VideoConsultation />

          {/* Exercise Library Card */}
          <Card className="border border-gray-200 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Exercise Library</CardTitle>
                <div className="rounded-md border border-green-200 bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  New
                </div>
              </div>
              <CardDescription>
                Access our extensive library of rehabilitation exercises
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {exerciseCategories.slice(0, 4).map((category) => (
                  <div 
                    key={category.id}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100 transition-all hover:shadow-md cursor-pointer"
                    onClick={() => setShowExerciseLibrary(true)}
                  >
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-xs opacity-80">{category.count} exercises</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Dialog open={showExerciseLibrary} onOpenChange={setShowExerciseLibrary}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-black text-white hover:bg-gray-800 mt-2">
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Browse All Exercises
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0">
                  <ExerciseLibrary />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Kolom kanan - AI Assistant & Progress */}
        <div className="space-y-6">
          {/* Kartu AI Assistant */}
          <Card className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                <div className="rounded-md border border-purple-200 bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">
                  Online
                </div>
              </div>
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
                        className={`p-3 rounded-lg max-w-[80%] ${
                          message.sender === 'ai' 
                            ? 'bg-gray-100 text-black' 
                            : 'bg-black text-white ml-auto'
                        }`} key={message.id}
                      >
                        {message.text}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={sendMessage} className="flex gap-2 mt-4">
                    <Input 
                      value={newMessage}
                      onChange={handleMessageChange}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                      Send
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Kartu Progress */}
          <Card className="border border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Progress</CardTitle>
                <div className="rounded-md border border-green-200 bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  75% Complete
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Exercise Completion</span>
                    <span className="text-black">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Session Attendance</span>
                    <span className="text-black">100%</span>
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

      {/* Modal Buat Janji */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-type">Appointment Type</Label>
              <select
                id="appointment-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="video">Video Consultation</option>
                <option value="in-person">In-person Session</option>
                <option value="follow-up">Follow-up</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    className={`justify-start ${
                      !slot.available ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!slot.available}
                  >
                    {slot.time}
                    {!slot.available && ' (Booked)'}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAppointmentModal(false)}
              >
                Cancel
              </Button>
              <Button>Schedule Appointment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
