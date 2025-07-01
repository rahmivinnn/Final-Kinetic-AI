// Frontend-only pose detection using MediaPipe
// No backend required - runs entirely in browser

import { Pose, Results } from '@mediapipe/pose'
import { Camera } from '@mediapipe/camera_utils'

export interface PoseKeypoint {
  x: number
  y: number
  z?: number
  visibility?: number
  name: string
}

export interface PoseDetectionResult {
  keypoints: PoseKeypoint[]
  confidence: number
  timestamp: number
  exerciseType?: string
  feedback?: string[]
}

export interface PoseAnalysis {
  posture: 'good' | 'fair' | 'poor'
  alignment: 'correct' | 'needs_adjustment'
  balance: 'stable' | 'unstable'
  recommendations: string[]
  score: number // 0-100
}

export class FrontendPoseDetection {
  private pose: Pose | null = null
  private camera: Camera | null = null
  private videoElement: HTMLVideoElement | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private canvasCtx: CanvasRenderingContext2D | null = null
  private isInitialized = false
  private isDetecting = false
  private onResults?: (results: PoseDetectionResult) => void
  private onAnalysis?: (analysis: PoseAnalysis) => void
  private lastResults: Results | null = null
  private exerciseType: string = 'general'
  private detectionHistory: PoseDetectionResult[] = []

  constructor(
    onResults?: (results: PoseDetectionResult) => void,
    onAnalysis?: (analysis: PoseAnalysis) => void
  ) {
    this.onResults = onResults
    this.onAnalysis = onAnalysis
  }

  // Initialize MediaPipe Pose
  async initialize(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): Promise<void> {
    try {
      this.videoElement = videoElement
      this.canvasElement = canvasElement
      this.canvasCtx = canvasElement.getContext('2d')

      if (!this.canvasCtx) {
        throw new Error('Could not get canvas context')
      }

      // Initialize MediaPipe Pose
      this.pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        }
      })

      // Configure pose detection
      this.pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      // Set up results callback
      this.pose.onResults((results) => {
        this.handlePoseResults(results)
      })

      // Initialize camera
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (this.pose && this.isDetecting) {
            await this.pose.send({ image: videoElement })
          }
        },
        width: 640,
        height: 480,
      })

      this.isInitialized = true
      console.log('MediaPipe Pose initialized successfully')

    } catch (error) {
      console.error('Error initializing pose detection:', error)
      throw error
    }
  }

  // Start pose detection
  async startDetection(exerciseType: string = 'general'): Promise<void> {
    if (!this.isInitialized || !this.camera) {
      throw new Error('Pose detection not initialized')
    }

    this.exerciseType = exerciseType
    this.isDetecting = true
    
    try {
      await this.camera.start()
      console.log(`Started pose detection for exercise: ${exerciseType}`)
      
      // Save detection state
      localStorage.setItem('kinetic_pose_detection_active', 'true')
      localStorage.setItem('kinetic_pose_exercise_type', exerciseType)
      localStorage.setItem('kinetic_pose_start_time', new Date().toISOString())
      
    } catch (error) {
      console.error('Error starting pose detection:', error)
      this.isDetecting = false
      throw error
    }
  }

  // Stop pose detection
  async stopDetection(): Promise<void> {
    this.isDetecting = false
    
    if (this.camera) {
      this.camera.stop()
    }

    // Clear canvas
    if (this.canvasCtx && this.canvasElement) {
      this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height)
    }

    // Clear localStorage
    localStorage.removeItem('kinetic_pose_detection_active')
    localStorage.removeItem('kinetic_pose_exercise_type')
    localStorage.removeItem('kinetic_pose_start_time')

    console.log('Stopped pose detection')
  }

  // Handle pose detection results
  private handlePoseResults(results: Results): void {
    if (!this.canvasCtx || !this.canvasElement) return

    this.lastResults = results

    // Clear canvas
    this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height)

    // Draw the image
    this.canvasCtx.drawImage(results.image, 0, 0, this.canvasElement.width, this.canvasElement.height)

    if (results.poseLandmarks) {
      // Convert MediaPipe landmarks to our format
      const keypoints: PoseKeypoint[] = results.poseLandmarks.map((landmark, index) => ({
        x: landmark.x * this.canvasElement!.width,
        y: landmark.y * this.canvasElement!.height,
        z: landmark.z,
        visibility: landmark.visibility,
        name: this.getLandmarkName(index)
      }))

      // Calculate confidence
      const confidence = results.poseLandmarks.reduce((sum, landmark) => 
        sum + (landmark.visibility || 0), 0) / results.poseLandmarks.length

      // Create detection result
      const detectionResult: PoseDetectionResult = {
        keypoints,
        confidence,
        timestamp: Date.now(),
        exerciseType: this.exerciseType,
        feedback: this.generateFeedback(keypoints)
      }

      // Store in history
      this.detectionHistory.push(detectionResult)
      if (this.detectionHistory.length > 100) {
        this.detectionHistory.shift() // Keep only last 100 results
      }

      // Draw pose landmarks and connections
      this.drawPose(results)

      // Analyze pose and provide feedback
      const analysis = this.analyzePose(keypoints)

      // Call callbacks
      if (this.onResults) {
        this.onResults(detectionResult)
      }
      if (this.onAnalysis) {
        this.onAnalysis(analysis)
      }

      // Save to localStorage for demo
      localStorage.setItem('kinetic_last_pose_result', JSON.stringify(detectionResult))
      localStorage.setItem('kinetic_last_pose_analysis', JSON.stringify(analysis))
    }
  }

  // Draw pose landmarks and connections
  private drawPose(results: Results): void {
    if (!this.canvasCtx || !results.poseLandmarks) return

    // Draw landmarks
    for (const landmark of results.poseLandmarks) {
      const x = landmark.x * this.canvasElement!.width
      const y = landmark.y * this.canvasElement!.height
      
      this.canvasCtx.beginPath()
      this.canvasCtx.arc(x, y, 5, 0, 2 * Math.PI)
      this.canvasCtx.fillStyle = '#00ff00'
      this.canvasCtx.fill()
    }

    // Draw connections (simplified skeleton)
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [25, 27], [24, 26], [26, 28], // Legs
      [0, 1], [1, 2], [2, 3], [3, 7] // Head
    ]

    this.canvasCtx.strokeStyle = '#00ff00'
    this.canvasCtx.lineWidth = 2

    for (const [start, end] of connections) {
      if (results.poseLandmarks[start] && results.poseLandmarks[end]) {
        const startPoint = results.poseLandmarks[start]
        const endPoint = results.poseLandmarks[end]
        
        this.canvasCtx.beginPath()
        this.canvasCtx.moveTo(
          startPoint.x * this.canvasElement!.width,
          startPoint.y * this.canvasElement!.height
        )
        this.canvasCtx.lineTo(
          endPoint.x * this.canvasElement!.width,
          endPoint.y * this.canvasElement!.height
        )
        this.canvasCtx.stroke()
      }
    }
  }

  // Analyze pose for feedback
  private analyzePose(keypoints: PoseKeypoint[]): PoseAnalysis {
    const analysis: PoseAnalysis = {
      posture: 'good',
      alignment: 'correct',
      balance: 'stable',
      recommendations: [],
      score: 85
    }

    // Simple analysis based on keypoint positions
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder')
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder')
    const leftHip = keypoints.find(kp => kp.name === 'left_hip')
    const rightHip = keypoints.find(kp => kp.name === 'right_hip')

    if (leftShoulder && rightShoulder) {
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y)
      if (shoulderDiff > 20) {
        analysis.posture = 'fair'
        analysis.recommendations.push('Keep your shoulders level')
        analysis.score -= 10
      }
    }

    if (leftHip && rightHip) {
      const hipDiff = Math.abs(leftHip.y - rightHip.y)
      if (hipDiff > 15) {
        analysis.alignment = 'needs_adjustment'
        analysis.recommendations.push('Align your hips properly')
        analysis.score -= 10
      }
    }

    // Exercise-specific feedback
    if (this.exerciseType === 'squat') {
      analysis.recommendations.push('Keep your back straight', 'Lower until thighs are parallel')
    } else if (this.exerciseType === 'plank') {
      analysis.recommendations.push('Maintain straight line from head to heels')
    }

    if (analysis.score < 70) {
      analysis.posture = 'poor'
    } else if (analysis.score < 80) {
      analysis.posture = 'fair'
    }

    return analysis
  }

  // Generate real-time feedback
  private generateFeedback(keypoints: PoseKeypoint[]): string[] {
    const feedback: string[] = []
    
    // Basic posture checks
    const nose = keypoints.find(kp => kp.name === 'nose')
    const leftShoulder = keypoints.find(kp => kp.name === 'left_shoulder')
    const rightShoulder = keypoints.find(kp => kp.name === 'right_shoulder')
    
    if (nose && leftShoulder && rightShoulder) {
      const shoulderCenter = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      }
      
      const headAlignment = Math.abs(nose.x - shoulderCenter.x)
      if (headAlignment > 30) {
        feedback.push('Keep your head centered over your shoulders')
      }
    }
    
    return feedback
  }

  // Get landmark name by index
  private getLandmarkName(index: number): string {
    const landmarkNames = [
      'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
      'right_eye_inner', 'right_eye', 'right_eye_outer',
      'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
      'left_index', 'right_index', 'left_thumb', 'right_thumb',
      'left_hip', 'right_hip', 'left_knee', 'right_knee',
      'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
      'left_foot_index', 'right_foot_index'
    ]
    
    return landmarkNames[index] || `landmark_${index}`
  }

  // Get detection history
  getDetectionHistory(): PoseDetectionResult[] {
    return [...this.detectionHistory]
  }

  // Get current exercise type
  getCurrentExercise(): string {
    return this.exerciseType
  }

  // Check if detection is active
  isActive(): boolean {
    return this.isDetecting
  }

  // Get detection duration
  getDetectionDuration(): number {
    const startTime = localStorage.getItem('kinetic_pose_start_time')
    if (startTime && this.isDetecting) {
      return Date.now() - new Date(startTime).getTime()
    }
    return 0
  }

  generateSimulatedPoseData(): any {
    const timestamp = new Date().toISOString();
    const activities = ['squat', 'lunge', 'push_up', 'plank', 'jumping_jack', 'burpee'];
    const emotions = ['focused', 'determined', 'tired', 'motivated', 'neutral'];
    const joints = ['left_knee', 'right_knee', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow'];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    return {
      original_pose: {
        keypoints: this.generateRandomKeypoints()
      },
      smoothed_keypoints: this.generateRandomKeypoints(),
      activity_recognition: {
        activity: randomActivity,
        confidence: 0.7 + Math.random() * 0.3,
        rep_count: Math.floor(Math.random() * 3),
        form_score: 70 + Math.random() * 30,
        timestamp
      },
      emotion_estimation: {
        emotion: randomEmotion,
        confidence: 0.6 + Math.random() * 0.4,
        body_language_indicators: {
          tension: Math.random(),
          energy: Math.random(),
          focus: Math.random()
        },
        timestamp
      },
      anomaly_detection: {
        is_anomaly: Math.random() < 0.1, // 10% chance of anomaly
        anomaly_type: 'form_deviation',
        confidence: 0.8 + Math.random() * 0.2,
        description: 'Minor form deviation detected in knee alignment',
        timestamp
      },
      posture_analysis: {
        posture_score: 75 + Math.random() * 25,
        ergonomic_issues: Math.random() < 0.3 ? ['Forward head posture'] : [],
        recommendations: ['Maintain neutral spine', 'Engage core muscles'],
        timestamp
      },
      joint_angles: joints.map(joint => ({
        joint_name: joint,
        angle: 90 + (Math.random() - 0.5) * 60,
        timestamp,
        confidence: 0.8 + Math.random() * 0.2
      })),
      range_of_motion: {
        left_knee: { min: 0, max: 120, current: 90 + Math.random() * 30 },
        right_knee: { min: 0, max: 120, current: 90 + Math.random() * 30 }
      },
      person_tracking: {
        person_id: 'person_1',
        confidence: 0.9 + Math.random() * 0.1
      },
      form_comparison: {
        similarity_score: 0.7 + Math.random() * 0.3,
        deviations: []
      },
      timestamp
    };
  }
  
  private generateRandomKeypoints() {
    const keypointNames = [
      'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
      'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ];
    
    return keypointNames.map(name => ({
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      confidence: 0.7 + Math.random() * 0.3,
      name
    }));
  }

  // Cleanup resources
  cleanup(): void {
    if (this.isDetecting) {
      this.stopDetection()
    }
    
    if (this.pose) {
      this.pose.close()
    }
  }
}

// Utility function to check MediaPipe support
export function checkMediaPipeSupport(): boolean {
  return typeof window !== 'undefined' && 'MediaPipe' in window
}

// Export singleton instance
export const frontendPoseDetection = new FrontendPoseDetection()