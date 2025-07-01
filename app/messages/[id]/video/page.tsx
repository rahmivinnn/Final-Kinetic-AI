"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic';

// Import VideoCallSimple dengan SSR dinonaktifkan untuk menghindari masalah window is not defined
const VideoCallSimple = dynamic(
  () => import('@/components/video-call-simple'),
  { ssr: false }
);

export default function VideoCallPage() {
  const router = useRouter()
  const params = useParams()
  const [isCallActive, setIsCallActive] = useState(false)
  const [showCallEnded, setShowCallEnded] = useState(false)
  const callDurationRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout>()

  // Mock data for the call
  const callData = {
    id: params.id,
    therapistName: "Dr. Sarah Johnson",
    therapistImage: "/caring-doctor.png",
    sessionId: `sess-${Date.now()}`,
    userId: "user-123",
    userName: "John Patient",
    userType: "patient" as const,
  }

  // Handle call end
  const handleEndCall = () => {
    setIsCallActive(false)
    setShowCallEnded(true)
    
    // Clear the timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    // Navigate back after 3 seconds
    setTimeout(() => {
      router.push(`/messages/${params.id}`)
    }, 3000)
  }

  // Start the call when component mounts
  useEffect(() => {
    setIsCallActive(true)
    
    // Start call duration timer
    timerRef.current = setInterval(() => {
      callDurationRef.current += 1
    }, 1000)
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black">
      {isCallActive ? (
        <VideoCallSimple
          therapistName={callData.therapistName}
          therapistImage={callData.therapistImage}
          onEndCall={handleEndCall}
          isAIAgent={false}
          sessionId={callData.sessionId}
          userId={callData.userId}
          userName={callData.userName}
          userType={callData.userType}
        />
      ) : showCallEnded ? (
        <div className="flex flex-col items-center justify-center h-full bg-black text-white">
          <div className="text-center p-8 bg-gray-900 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Call Ended</h2>
            <p className="text-gray-400">
              Call duration: {Math.floor(callDurationRef.current / 60)}:
              {(callDurationRef.current % 60).toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full bg-black text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Starting video call with {callData.therapistName}...</h1>
            <Button 
              variant="destructive" 
              className="mt-4"
              onClick={() => router.push(`/messages/${params.id}`)}
            >
              Cancel Call
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
