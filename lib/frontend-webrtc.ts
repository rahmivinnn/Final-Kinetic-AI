// Frontend-only WebRTC implementation without backend signaling
// Uses localStorage for demo purposes and mirror video for simulation

export interface VideoCallState {
  isActive: boolean
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed'
  error: string | null
}

export class FrontendWebRTC {
  private localVideo: HTMLVideoElement | null = null
  private remoteVideo: HTMLVideoElement | null = null
  private localStream: MediaStream | null = null
  private state: VideoCallState = {
    isActive: false,
    localStream: null,
    remoteStream: null,
    connectionState: 'disconnected',
    error: null
  }
  private onStateChange?: (state: VideoCallState) => void

  constructor(onStateChange?: (state: VideoCallState) => void) {
    this.onStateChange = onStateChange
  }

  // Initialize video elements
  setVideoElements(localVideo: HTMLVideoElement, remoteVideo: HTMLVideoElement) {
    this.localVideo = localVideo
    this.remoteVideo = remoteVideo
  }

  // Start video call (frontend-only simulation)
  async startCall(): Promise<void> {
    try {
      this.updateState({ connectionState: 'connecting' })

      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })

      // Set local video
      if (this.localVideo) {
        this.localVideo.srcObject = this.localStream
      }

      // Simulate remote video by mirroring local stream
      // In a real app, this would be the remote peer's stream
      if (this.remoteVideo) {
        this.remoteVideo.srcObject = this.localStream
      }

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      this.updateState({
        isActive: true,
        localStream: this.localStream,
        remoteStream: this.localStream, // Mirror for demo
        connectionState: 'connected',
        error: null
      })

      // Save call state to localStorage for demo
      localStorage.setItem('kinetic_video_call_active', 'true')
      localStorage.setItem('kinetic_video_call_start_time', new Date().toISOString())

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start video call'
      this.updateState({
        connectionState: 'failed',
        error: errorMessage
      })
      throw error
    }
  }

  // End video call
  async endCall(): Promise<void> {
    try {
      // Stop all tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop())
      }

      // Clear video elements
      if (this.localVideo) {
        this.localVideo.srcObject = null
      }
      if (this.remoteVideo) {
        this.remoteVideo.srcObject = null
      }

      // Reset state
      this.updateState({
        isActive: false,
        localStream: null,
        remoteStream: null,
        connectionState: 'disconnected',
        error: null
      })

      // Clear localStorage
      localStorage.removeItem('kinetic_video_call_active')
      localStorage.removeItem('kinetic_video_call_start_time')

    } catch (error) {
      console.error('Error ending call:', error)
    }
  }

  // Toggle mute
  toggleMute(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return !audioTrack.enabled // Return true if muted
      }
    }
    return false
  }

  // Toggle video
  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return !videoTrack.enabled // Return true if video off
      }
    }
    return false
  }

  // Get current state
  getState(): VideoCallState {
    return { ...this.state }
  }

  // Check if call is active
  isCallActive(): boolean {
    return this.state.isActive
  }

  // Simulate sending message to AI therapist
  sendMessageToAI(message: string, type: 'text' | 'session_start' | 'session_end' = 'text'): void {
    // Simulate AI response after delay
    setTimeout(() => {
      const responses = [
        "I understand. Let's focus on your breathing and posture.",
        "That's great progress! Keep up the good work.",
        "Let's try a different approach to this exercise.",
        "How are you feeling during this movement?",
        "Remember to maintain proper form throughout the exercise."
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      // Store AI response in localStorage for demo
      const aiMessages = JSON.parse(localStorage.getItem('kinetic_ai_messages') || '[]')
      aiMessages.push({
        id: Date.now(),
        message: randomResponse,
        timestamp: new Date().toISOString(),
        sender: 'ai_therapist',
        type: 'response'
      })
      localStorage.setItem('kinetic_ai_messages', JSON.stringify(aiMessages))
      
      // Trigger custom event for UI updates
      window.dispatchEvent(new CustomEvent('ai-message-received', {
        detail: { message: randomResponse }
      }))
    }, 1000 + Math.random() * 2000) // Random delay 1-3 seconds
  }

  // Get call duration
  getCallDuration(): number {
    const startTime = localStorage.getItem('kinetic_video_call_start_time')
    if (startTime && this.state.isActive) {
      return Date.now() - new Date(startTime).getTime()
    }
    return 0
  }

  // Private method to update state and notify listeners
  private updateState(updates: Partial<VideoCallState>): void {
    this.state = { ...this.state, ...updates }
    if (this.onStateChange) {
      this.onStateChange(this.state)
    }
  }

  // Cleanup resources
  cleanup(): void {
    if (this.state.isActive) {
      this.endCall()
    }
  }
}

// Utility function to check WebRTC support
export function checkWebRTCSupport(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
}

// Utility function to get available devices
export async function getAvailableDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(device => device.kind === 'videoinput' || device.kind === 'audioinput')
  } catch (error) {
    console.error('Error getting devices:', error)
    return []
  }
}

// Export singleton instance
export const frontendWebRTC = new FrontendWebRTC()