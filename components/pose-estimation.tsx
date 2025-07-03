"use client"

import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { FrontendPoseDetection } from '@/lib/frontend-pose-detection';
import jsPDF from 'jspdf';

type PoseEstimationProps = {
  onPoseDetected: (pose: any) => void;
  onAnalysisReceived?: (analysis: any) => void;
  sessionId?: string;
  width?: number;
  height?: number;
  enableBackendAnalysis?: boolean;
};

export const PoseEstimation: React.FC<PoseEstimationProps> = ({
  onPoseDetected,
  onAnalysisReceived,
  sessionId,
  width = 640,
  height = 480,
  enableBackendAnalysis = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const detectorRef = useRef<poseDetection.PoseDetector>();
  const poseDetectionRef = useRef<FrontendPoseDetection>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastAnalysisTime = useRef<number>(0);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const [engine, setEngine] = useState<'mediapipe' | 'openpose'>('mediapipe');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const simInterval = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [feedback, setFeedback] = useState<{text: string, type: 'good'|'fair'|'poor'}>({text: '', type: 'good'});
  const [status, setStatus] = useState<'detecting'|'paused'|'no-person'>('detecting');
  const [sessionStart, setSessionStart] = useState<number | null>(null);

  useEffect(() => {
    async function setupDetector() {
      await tf.ready();
      await tf.setBackend('webgl');
      
      const model = poseDetection.SupportedModels.MoveNet;
      const detector = await poseDetection.createDetector(model, {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      });
      
      detectorRef.current = detector;
      
      // Initialize frontend pose detection
      poseDetectionRef.current = new FrontendPoseDetection();
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          detectPose();
        }
      }
    }
    
    setupDetector();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
      
      if (poseDetectionRef.current) {
        poseDetectionRef.current.cleanup();
      }
    };
  }, []);

  async function detectPose() {
    if (!videoRef.current || !detectorRef.current || !canvasRef.current) return;
    
    const poses = await detectorRef.current.estimatePoses(videoRef.current);
    
    if (poses.length > 0) {
      const pose = poses[0];
      onPoseDetected(pose);
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        drawPose(pose, ctx);
      }
      
      // Send pose data to backend for analysis (throttled to avoid overwhelming the server)
      if (enableBackendAnalysis && !isAnalyzing) {
        const now = Date.now();
        if (now - lastAnalysisTime.current > 2000) { // Analyze every 2 seconds
          lastAnalysisTime.current = now;
          analyzePoseInBackground(pose);
        }
      }
    }
    
    animationRef.current = requestAnimationFrame(detectPose);
  }
  
  async function analyzePoseInBackground(pose: any) {
    if (isAnalyzing || !poseDetectionRef.current) return;
    
    setIsAnalyzing(true);
    try {
      // Convert video frame to base64 for analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx && videoRef.current) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const videoFrame = canvas.toDataURL('image/jpeg', 0.8);
        
        // Use frontend pose analysis
        const analysis = await poseDetectionRef.current.analyzePose(pose, videoFrame, sessionId);
        
        // Store analysis results
        setAnalysisResults(prev => [...prev.slice(-9), analysis]); // Keep last 10 results
        
        if (onAnalysisReceived) {
          onAnalysisReceived(analysis);
        }
      }
    } catch (error) {
      console.error('Pose analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function drawPose(pose: any, ctx: CanvasRenderingContext2D) {
    if (!pose.keypoints) return;
    
    pose.keypoints.forEach((keypoint: any) => {
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });
  }

  // Pause/resume logic
  function pauseDetection() {
    setIsPaused((prev) => !prev);
    setStatus(isPaused ? 'detecting' : 'paused');
  }

  // Snapshot logic
  function takeSnapshot() {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `pose-snapshot-${Date.now()}.png`;
    a.click();
  }

  // Feedback & status update (pseudocode, sesuaikan dengan hasil deteksi pose)
  useEffect(() => {
    if (isPaused) return;
    // ... existing pose detection logic ...
    // Setelah deteksi pose:
    // if (pose.score > 0.8) setFeedback({text: 'Posture Good', type: 'good'});
    // else if (pose.score > 0.5) setFeedback({text: 'Keep Improving', type: 'fair'});
    // else setFeedback({text: 'Adjust Your Posture', type: 'poor'});
    // setStatus('detecting');
    // Jika tidak ada pose:
    // setStatus('no-person');
  }, [isPaused]);

  // Session summary
  const duration = sessionStart ? Math.floor((Date.now() - sessionStart) / 1000) : 0;
  const avgScore = history.length ? (history.reduce((a, b) => a + (b.score || 0), 0) / history.length).toFixed(2) : 0;

  return (
    <div className="relative w-full">
      <video
        ref={videoRef}
        width={width}
        height={height}
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="bg-black rounded-lg shadow-lg w-full h-auto max-w-full max-h-[80vh] object-contain mx-auto"
      />
      {isAnalyzing && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium animate-pulse">
          Analyzing...
        </div>
      )}
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="engine" className="font-medium">Engine:</label>
        <select
          id="engine"
          value={engine}
          onChange={async (e) => {
            setLoading(true);
            setEngine(e.target.value as 'mediapipe' | 'openpose');
            if (e.target.value === 'openpose') {
              if (simInterval.current) clearInterval(simInterval.current);
              simInterval.current = setInterval(() => {
                const sim = FrontendPoseDetection.prototype.generateSimulatedPoseData();
                setHistory((prev) => [...prev.slice(-99), sim]);
              }, 1000);
            } else {
              if (simInterval.current) clearInterval(simInterval.current);
            }
            setTimeout(() => setLoading(false), 500);
          }}
          className="border rounded px-2 py-1"
        >
          <option value="mediapipe">MediaPipe (Realtime, Browser)</option>
          <option value="openpose">OpenPose (Simulasi)</option>
        </select>
        <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${engine === 'mediapipe' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
          {engine === 'mediapipe' ? 'MediaPipe Active' : 'OpenPose Simulated'}
        </span>
      </div>
      {loading && <div className="animate-pulse text-blue-600">Switching engine...</div>}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pose-report-${engine}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-black text-white px-3 py-1 rounded"
        >Download JSON</button>
        <button
          onClick={() => {
            const csv = [
              Object.keys(history[0] || {}).join(','),
              ...history.map(row => Object.values(row).join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pose-report-${engine}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >Download CSV</button>
        <button
          onClick={() => {
            const doc = new jsPDF();
            doc.text('Pose Report', 10, 10);
            history.slice(0, 20).forEach((row, i) => {
              doc.text(JSON.stringify(row), 10, 20 + i * 10);
            });
            doc.save(`pose-report-${engine}.pdf`);
          }}
          className="bg-red-600 text-white px-3 py-1 rounded"
        >Download PDF</button>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded font-bold transition-all duration-300 ${feedback.type === 'good' ? 'bg-green-200 text-green-800' : feedback.type === 'fair' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>{feedback.text}</span>
          <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'detecting' ? 'bg-blue-200 text-blue-800' : status === 'paused' ? 'bg-gray-300 text-gray-700' : 'bg-red-200 text-red-800'}`}>{status === 'detecting' ? 'Detecting' : status === 'paused' ? 'Paused' : 'No Person Detected'}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={pauseDetection} aria-label="Pause or resume detection" className="bg-gray-800 text-white px-3 py-1 rounded">{isPaused ? 'Resume' : 'Pause'}</button>
          <button onClick={takeSnapshot} aria-label="Take snapshot" className="bg-green-600 text-white px-3 py-1 rounded">Snapshot</button>
        </div>
        <div className="mt-2">
          <h4 className="font-bold mb-1">Detection History</h4>
          <ul className="max-h-24 overflow-y-auto text-xs">
            {history.slice(-10).map((h, i) => (
              <li key={i}>{h.timestamp}: Score {h.score}</li>
            ))}
          </ul>
          {/* Mini chart SVG */}
          <svg width="100%" height="40">
            {history.slice(-20).map((h, i, arr) => (
              <circle key={i} cx={10 + i * 15} cy={40 - (h.score || 0) * 0.4} r="4" fill={h.score > 80 ? '#22c55e' : h.score > 50 ? '#eab308' : '#ef4444'} />
            ))}
          </svg>
        </div>
        {sessionEnded && (
          <div className="p-4 bg-gray-100 rounded mt-4">
            <h4 className="font-bold mb-2">Session Summary</h4>
            <div>Total Duration: {duration} sec</div>
            <div>Detections: {history.length}</div>
            <div>Average Score: {avgScore}</div>
          </div>
        )}
      </div>
    </div>
  );
};