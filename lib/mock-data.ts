// Mock data and simulation functions for frontend-only app

// Simulate API delay
export const simulateDelay = (ms: number = 1000) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock users for authentication
export const mockUsers = [
  {
    id: '1',
    email: 'admin@kinetic.com',
    password: '123',
    name: 'Admin User',
    role: 'admin' as const,
    avatar: '/placeholder-user.jpg'
  },
  {
    id: '2',
    email: 'patient@kinetic.com',
    password: '123',
    name: 'John Patient',
    role: 'patient' as const,
    avatar: '/athletic-man-short-hair.png'
  },
  {
    id: '3',
    email: 'provider@kinetic.com',
    password: '123',
    name: 'Dr. Sarah Johnson',
    role: 'provider' as const,
    avatar: '/caring-doctor.png'
  },
  {
    id: '4',
    email: 'demo@kinetic.com',
    password: 'demo',
    name: 'Demo User',
    role: 'patient' as const,
    avatar: '/smiling-brown-haired-woman.png'
  }
]

// Mock appointments data
export const mockAppointments = [
  {
    id: '1',
    patientId: '2',
    doctorId: '3',
    date: '2024-01-25',
    time: '10:00',
    doctor: 'Dr. Sarah Johnson',
    doctorImage: '/caring-doctor.png',
    type: 'Shoulder Assessment',
    mode: 'Virtual',
    location: 'Video Call',
    duration: '30 minutes',
    status: 'Confirmed',
    notes: 'Follow-up session for knee rehabilitation',
    insuranceVerified: true,
    reminderSent: true,
    videoLink: 'https://meet.kinetic.com/abc123',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z'
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '3',
    date: '2024-01-28',
    time: '14:30',
    doctor: 'Dr. Sarah Johnson',
    doctorImage: '/caring-doctor.png',
    type: 'Physical Therapy',
    mode: 'In-person',
    location: 'Main Clinic - Room 305',
    duration: '45 minutes',
    status: 'Pending',
    notes: 'Initial assessment and treatment plan',
    insuranceVerified: true,
    reminderSent: false,
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z'
  }
]

// Mock exercises data
export const mockExercises = [
  {
    id: '1',
    name: 'Shoulder Mobility',
    description: 'Gentle shoulder rotation exercises',
    duration: 15,
    difficulty: 'Easy',
    category: 'Upper Body',
    videoUrl: '/shoulder-exercise.png',
    instructions: ['Stand with feet shoulder-width apart', 'Slowly rotate shoulders forward', 'Repeat 10 times']
  },
  {
    id: '2',
    name: 'Knee Stability',
    description: 'Strengthening exercises for knee support',
    duration: 20,
    difficulty: 'Medium',
    category: 'Lower Body',
    videoUrl: '/mini-squat-exercise.png',
    instructions: ['Stand with feet hip-width apart', 'Slowly bend knees', 'Hold for 5 seconds']
  },
  {
    id: '3',
    name: 'Core Strengthening',
    description: 'Build core stability and strength',
    duration: 25,
    difficulty: 'Hard',
    category: 'Core',
    videoUrl: '/bridge-exercise.png',
    instructions: ['Lie on your back', 'Lift hips off ground', 'Hold bridge position']
  }
]

// Mock progress data
export const mockProgress = {
  weeklyStats: {
    exercisesCompleted: 12,
    totalMinutes: 180,
    streakDays: 5,
    improvementScore: 85
  },
  monthlyProgress: [
    { week: 'Week 1', completed: 8, target: 10 },
    { week: 'Week 2', completed: 12, target: 12 },
    { week: 'Week 3', completed: 15, target: 14 },
    { week: 'Week 4', completed: 18, target: 16 }
  ],
  painLevels: [
    { date: '2024-01-20', level: 7 },
    { date: '2024-01-21', level: 6 },
    { date: '2024-01-22', level: 5 },
    { date: '2024-01-23', level: 4 },
    { date: '2024-01-24', level: 3 },
    { date: '2024-01-25', level: 3 }
  ]
}

// Mock messages data
export const mockMessages = [
  {
    id: '1',
    senderId: '3',
    senderName: 'Dr. Sarah Johnson',
    receiverId: '2',
    message: 'Great progress on your exercises this week! Keep it up.',
    timestamp: '2024-01-25T10:30:00Z',
    read: false
  },
  {
    id: '2',
    senderId: '2',
    senderName: 'John Patient',
    receiverId: '3',
    message: 'Thank you! I have a question about the knee exercises.',
    timestamp: '2024-01-25T11:00:00Z',
    read: true
  }
]

// Local storage keys
export const STORAGE_KEYS = {
  USER: 'kinetic_user',
  APPOINTMENTS: 'kinetic_appointments',
  EXERCISES: 'kinetic_exercises',
  PROGRESS: 'kinetic_progress',
  MESSAGES: 'kinetic_messages',
  SETTINGS: 'kinetic_settings',
  VIDEOS: 'kinetic_videos'
}

// Initialize mock data in localStorage
export const initializeMockData = () => {
  if (typeof window === 'undefined') return
  
  // Only initialize if data doesn't exist
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(mockAppointments))
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXERCISES)) {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(mockExercises))
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(mockProgress))
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(mockMessages))
  }
}

// Simulate API responses
export const mockApi = {
  // Authentication
  login: async (email: string, password: string) => {
    await simulateDelay(1500)
    // Allow any email/password combination to login
    const newUser = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0] || 'User',
      role: 'patient' as const,
      avatar: '/placeholder-user.jpg'
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
    return { success: true, user: newUser }
  },

  register: async (email: string, password: string, name: string, role: string = 'patient') => {
    await simulateDelay(2000)
    // Allow any registration to succeed
    const newUser = {
      id: Date.now().toString(),
      email,
      name,
      role: role as 'patient' | 'provider' | 'admin',
      avatar: '/placeholder-user.jpg'
    }
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser))
    return { success: true, user: newUser }
  },

  // Appointments
  getAppointments: async () => {
    await simulateDelay(800)
    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]')
    return { success: true, data: appointments }
  },

  createAppointment: async (appointment: any) => {
    await simulateDelay(1200)
    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]')
    const newAppointment = { ...appointment, id: Date.now().toString() }
    appointments.push(newAppointment)
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments))
    return { success: true, data: newAppointment }
  },

  updateAppointment: async (appointmentData: any) => {
    await simulateDelay(500)
    const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]')
    const updatedAppointments = appointments.map((apt: any) => 
      apt.id === appointmentData.id ? { ...apt, ...appointmentData } : apt
    )
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updatedAppointments))
    return updatedAppointments.find((apt: any) => apt.id === appointmentData.id)
  },

  // Exercises
  getExercises: async () => {
    await simulateDelay(600)
    const exercises = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXERCISES) || '[]')
    return { success: true, data: exercises }
  },

  // Progress
  getProgress: async () => {
    await simulateDelay(700)
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROGRESS) || '{}')
    return { success: true, data: progress }
  },

  updateProgress: async (progressData: any) => {
    await simulateDelay(900)
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressData))
    return { success: true, data: progressData }
  },

  // Messages
  getMessages: async () => {
    await simulateDelay(500)
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]')
    return { success: true, data: messages }
  },

  sendMessage: async (message: any) => {
    await simulateDelay(800)
    const messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '[]')
    const newMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    messages.push(newMessage)
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
    return { success: true, data: newMessage }
  },

  uploadVideo: async (videoData: any) => {
    await simulateDelay(1000)
    const videos = JSON.parse(localStorage.getItem(STORAGE_KEYS.VIDEOS) || '[]')
    const newVideo = {
      id: `video_${Date.now()}`,
      ...videoData,
      uploadedAt: new Date().toISOString(),
      status: 'processed'
    }
    videos.push(newVideo)
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos))
    return newVideo
  },

  updateVideo: async (videoData: any) => {
    await simulateDelay(500)
    const videos = JSON.parse(localStorage.getItem(STORAGE_KEYS.VIDEOS) || '[]')
    const updatedVideos = videos.map((video: any) => 
      video.id === videoData.id ? { ...video, ...videoData } : video
    )
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(updatedVideos))
    return updatedVideos.find((video: any) => video.id === videoData.id)
  },

  getVideos: async () => {
    await simulateDelay(300)
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.VIDEOS) || '[]')
  }
}