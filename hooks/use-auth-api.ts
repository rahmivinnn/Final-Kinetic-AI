import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import { mockApi, simulateDelay } from '@/lib/mock-data'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  headers?: Record<string, string>
}

export function useAuthApi() {
  const { user, logout } = useAuth()

  const makeAuthenticatedRequest = async (url: string, options: ApiOptions = {}) => {
    // Check if user is logged in
    if (!user) {
      toast.error('Please log in to continue.')
      logout()
      throw new Error('No user session found')
    }

    const { method = 'GET', body } = options

    try {
      // Simulate API delay
      await simulateDelay(500)
      
      // Route to appropriate mock API function based on URL
      if (url.includes('/appointments')) {
        if (method === 'GET') {
          return await mockApi.getAppointments()
        } else if (method === 'POST') {
          return await mockApi.createAppointment(body)
        }
      } else if (url.includes('/exercises')) {
        return await mockApi.getExercises()
      } else if (url.includes('/progress')) {
        if (method === 'GET') {
          return await mockApi.getProgress()
        } else if (method === 'POST' || method === 'PUT') {
          return await mockApi.updateProgress(body)
        }
      } else if (url.includes('/messages')) {
        if (method === 'GET') {
          return await mockApi.getMessages()
        } else if (method === 'POST') {
          return await mockApi.sendMessage(body)
        }
      }
      
      // Default success response for unhandled routes
      return { success: true, data: {} }
      
    } catch (error) {
      console.error('API request failed:', error)
      toast.error('Request failed. Please try again.')
      throw error
    }
  }

  // Convenience methods for common API calls
  const get = (url: string) => makeAuthenticatedRequest(url, { method: 'GET' })
  const post = (url: string, body: any) => makeAuthenticatedRequest(url, { method: 'POST', body })
  const put = (url: string, body: any) => makeAuthenticatedRequest(url, { method: 'PUT', body })
  const del = (url: string) => makeAuthenticatedRequest(url, { method: 'DELETE' })

  // Specific API methods
  const getAppointments = () => mockApi.getAppointments()
  const createAppointment = (appointment: any) => mockApi.createAppointment(appointment)
  const getExercises = () => mockApi.getExercises()
  const getProgress = () => mockApi.getProgress()
  const updateProgress = (progress: any) => mockApi.updateProgress(progress)
  const getMessages = () => mockApi.getMessages()
  const sendMessage = (message: any) => mockApi.sendMessage(message)

  // Video call simulation
  const startVideoCall = async (appointmentId: string) => {
    await simulateDelay(1000)
    toast.success('Video call started!')
    return { success: true, data: { callId: `call_${appointmentId}_${Date.now()}` } }
  }

  const endVideoCall = async (callId: string) => {
    await simulateDelay(500)
    toast.success('Video call ended')
    return { success: true }
  }

  // Pose estimation simulation
  const analyzePose = async (videoData: any) => {
    await simulateDelay(2000)
    const mockAnalysis = {
      accuracy: Math.floor(Math.random() * 20) + 80, // 80-100%
      feedback: [
        'Good posture alignment',
        'Keep your back straight',
        'Excellent form on this exercise'
      ][Math.floor(Math.random() * 3)],
      keyPoints: {
        leftShoulder: { x: 150, y: 200, confidence: 0.9 },
        rightShoulder: { x: 250, y: 200, confidence: 0.9 },
        leftElbow: { x: 120, y: 280, confidence: 0.8 },
        rightElbow: { x: 280, y: 280, confidence: 0.8 }
      }
    }
    return { success: true, data: mockAnalysis }
  }

  // File upload simulation
  const uploadFile = async (file: File) => {
    await simulateDelay(1500)
    const mockFileData = {
      id: `file_${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // Create temporary URL for preview
      uploadedAt: new Date().toISOString()
    }
    
    // Store file metadata in localStorage
    const files = JSON.parse(localStorage.getItem('uploaded_files') || '[]')
    files.push(mockFileData)
    localStorage.setItem('uploaded_files', JSON.stringify(files))
    
    toast.success('File uploaded successfully!')
    return { success: true, data: mockFileData }
  }

  // Notification simulation
  const getNotifications = async () => {
    await simulateDelay(600)
    const mockNotifications = [
      {
        id: '1',
        title: 'Exercise Reminder',
        message: 'Time for your daily shoulder exercises!',
        type: 'reminder',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Appointment Confirmed',
        message: 'Your appointment with Dr. Johnson is confirmed for tomorrow.',
        type: 'appointment',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
    return { success: true, data: mockNotifications }
  }

  const markNotificationRead = async (notificationId: string) => {
    await simulateDelay(300)
    return { success: true }
  }

  return {
    makeAuthenticatedRequest,
    get,
    post,
    put,
    del,
    getAppointments,
    createAppointment,
    getExercises,
    getProgress,
    updateProgress,
    getMessages,
    sendMessage,
    startVideoCall,
    endVideoCall,
    analyzePose,
    uploadFile,
    getNotifications,
    markNotificationRead
  }
}

// Hook for non-authenticated API calls (like public data)
export function usePublicApi() {
  const get = async (url: string) => {
    await simulateDelay(500)
    
    // Mock public data responses
    if (url.includes('/public/exercises')) {
      return {
        success: true,
        data: [
          { id: '1', name: 'Basic Stretching', difficulty: 'Easy', duration: 10 },
          { id: '2', name: 'Gentle Movement', difficulty: 'Easy', duration: 15 }
        ]
      }
    }
    
    return { success: true, data: {} }
  }

  return { get }
}