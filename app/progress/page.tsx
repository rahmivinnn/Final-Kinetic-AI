"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Home, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Activity, 
  Zap, 
  Move, 
  Dumbbell, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Flag, 
  RefreshCw, 
  Download, 
  TrendingUp, 
  Target, 
  Award 
} from "lucide-react"
import { useProgress } from "@/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"

export default function ProgressPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')
  
  const renderIcon = (iconType: string, className: string = "h-5 w-5") => {
    const iconProps = { className }
    switch (iconType) {
      case 'Activity': return <Activity {...iconProps} />
      case 'Zap': return <Zap {...iconProps} />
      case 'Move': return <Move {...iconProps} />
      case 'Dumbbell': return <Dumbbell {...iconProps} />
      case 'CheckCircle': return <CheckCircle {...iconProps} />
      case 'XCircle': return <XCircle {...iconProps} />
      case 'Clock': return <Clock {...iconProps} />
      case 'Flag': return <Flag {...iconProps} />
      default: return <Activity {...iconProps} />
    }
  }
  
  const { data: progressData, loading, error, refetch } = useProgress(user?.id, selectedTimeframe)

  const handleRefresh = () => {
    refetch()
    toast({
      title: "Data Refreshed",
      description: "Your progress data has been updated.",
    })
  }

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe)
  }

  const handleGoalUpdate = () => {
    toast({
      title: "Goal Updated",
      description: "Your recovery goal has been successfully updated.",
    })
  }

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your progress data is being prepared for download.",
    })
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your progress report has been downloaded.",
      })
    }, 2000)
  }

  const recoverySummary = progressData?.summary || [
    {
      title: "Overall Progress",
      value: "78%",
      change: "+12%",
      trend: "up",
      icon: "Activity",
      color: "text-blue-600"
    }
  ]

  const goalsAndMilestones = [
    {
      id: 1,
      title: "Walk 1 mile without assistance",
      target: "Target: July 15 - Currently at 75%",
      iconType: "Flag",
      iconColor: "text-blue-500",
      completed: false,
    },
    {
      id: 2,
      title: "Return to light sports activities",
      target: "Target: August 30 - Currently at 45%",
      iconType: "Dumbbell",
      iconColor: "text-blue-500",
      completed: false,
    },
    {
      id: 3,
      title: "Reduce pain medication",
      target: "Target: July 1 - Completed!",
      iconType: "CheckCircle",
      iconColor: "text-green-500",
      completed: true,
    },
  ]

  return (
    <div className="flex h-screen bg-[#f0f4f9]">
      <div className="w-[78px] bg-gradient-to-b from-[#001a41] to-[#003366] flex flex-col items-center py-6">
        <div className="mb-8">
          <Image src="/kinetic-logo.png" alt="Kinetic Logo" width={40} height={40} />
        </div>
        <nav className="flex flex-col items-center space-y-6 flex-1">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white">
            <Home className="w-5 h-5" />
          </Link>
          <Link href="/appointments" className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white">
            <Calendar className="w-5 h-5" />
          </Link>
          <Link href="/progress" className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <BarChart3 className="w-5 h-5" />
          </Link>
          <Link href="/settings" className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-white">
            <Settings className="w-5 h-5" />
          </Link>
        </nav>
        <Button variant="ghost" size="icon" onClick={logout} className="w-10 h-10 text-white hover:bg-white/10">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">Progress Tracking</h1>
              <p className="text-gray-600">Monitor your recovery journey and achievements</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recoverySummary.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{item.title}</p>
                        <p className="text-2xl font-bold text-[#111827]">{item.value}</p>
                        <p className={`text-sm ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {item.change} from last period
                        </p>
                      </div>
                      <div className={`p-3 rounded-full bg-blue-50 ${item.color}`}>
                        {renderIcon(item.icon)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>Goals & Milestones</span>
                  </CardTitle>
                  <CardDescription>Track your recovery objectives and achievements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goalsAndMilestones.map((goal) => (
                    <div key={goal.id} className="flex items-start space-x-3 p-4 rounded-lg border">
                      <div className={`mt-1 ${goal.iconColor}`}>
                        {renderIcon(goal.iconType)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-[#111827]">{goal.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{goal.target}</p>
                        {goal.completed && (
                          <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={handleGoalUpdate}>
                    Update Goals
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                  <CardDescription>Your latest milestones and accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">Completed 7-day exercise streak</p>
                        <p className="text-sm text-green-600">June 28, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Improved mobility score by 15%</p>
                        <p className="text-sm text-blue-600">June 25, 2024</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
