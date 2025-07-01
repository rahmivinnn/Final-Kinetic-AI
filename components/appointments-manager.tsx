'use client'

import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { mockApi } from '@/lib/mock-data'
import { Calendar, Clock, MapPin, Video, Edit, Trash2, Plus } from 'lucide-react'
import Image from 'next/image'

// Define types for better type safety
type AppointmentStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed'
type AppointmentMode = 'In-person' | 'Virtual'

interface Appointment {
  id: string
  patientId: string
  doctorId: string
  doctor: string
  doctorImage: string
  date: string
  time: string
  type: string
  mode: AppointmentMode
  location: string
  duration: string
  notes: string
  status: AppointmentStatus
  createdAt: string
  updatedAt: string
  isVirtual?: boolean
  videoLink?: string
  isCompleted?: boolean
  isCancelled?: boolean
}

interface AppointmentFormData extends Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'isCompleted' | 'isCancelled' | 'videoLink' | 'patientId' | 'doctorId' | 'doctor'> {
  notes: string
  doctorImage: string
  doctor: string
  doctorId: string
  patientId: string
}

interface AppointmentsManagerProps {
  patientId?: string
  onAppointmentUpdate?: (appointment: Appointment) => void
}

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export function AppointmentsManager({ patientId, onAppointmentUpdate }: AppointmentsManagerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const getInitialFormData = useCallback((): AppointmentFormData => ({
    patientId: patientId || '',
    doctorId: 'doc-123',
    doctor: 'Dr. Smith',
    date: '',
    time: '',
    type: '',
    mode: 'In-person',
    location: 'Main Hospital',
    duration: '30 minutes',
    notes: '',
    doctorImage: '/default-doctor.jpg'
  }), [patientId])

  const [formData, setFormData] = useState<AppointmentFormData>(getInitialFormData())

  const formatDate = React.useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const getStatusColorClass = React.useCallback((status: AppointmentStatus): string => {
    const colors: Record<AppointmentStatus, string> = {
      'Confirmed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Completed': 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }, [])

  const renderStatusBadge = React.useCallback((status: AppointmentStatus) => {
    const colorClass = getStatusColorClass(status)
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status}
      </span>
    )
  }, [getStatusColorClass])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    const { name, type } = target
    const value = type === 'checkbox' ? target.checked : target.value
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreateAppointment = useCallback(async (data: AppointmentFormData): Promise<boolean> => {
    try {
      const newAppointment = await mockApi.createAppointment({
        ...data,
        status: 'Pending' as AppointmentStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isVirtual: data.mode === 'Virtual',
        isCompleted: false,
        isCancelled: false
      })
      setAppointments(prev => [...prev, newAppointment])
      return true
    } catch (error) {
      console.error('Error creating appointment:', error)
      return false
    }
  }, [])

  const handleUpdateAppointment = useCallback(async (id: string, data: AppointmentFormData): Promise<boolean> => {
    try {
      const existingAppointment = appointments.find(appt => appt.id === id)
      if (!existingAppointment) return false
      
      const updatedAppointment: Appointment = {
        ...existingAppointment,
        ...data,
        updatedAt: new Date().toISOString(),
        isVirtual: data.mode === 'Virtual',
        status: existingAppointment.status, // Preserve existing status
        createdAt: existingAppointment.createdAt // Preserve creation date
      }
      
      await mockApi.updateAppointment(updatedAppointment)
      setAppointments(prev => 
        prev.map(appt => appt.id === id ? updatedAppointment : appt)
      )
      return true
    } catch (error) {
      console.error('Error updating appointment:', error)
      return false
    }
  }, [appointments])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      let success = false
      let updatedAppointment: Appointment | null = null
      
      if (isEditing && selectedAppointment) {
        success = await handleUpdateAppointment(selectedAppointment.id, formData)
        if (success) {
          updatedAppointment = {
            ...selectedAppointment,
            ...formData,
            updatedAt: new Date().toISOString(),
            isVirtual: formData.mode === 'Virtual',
            videoLink: formData.mode === 'Virtual' ? (selectedAppointment.videoLink || `https://meet.kinetic-ai.com/${Date.now()}`) : ''
          }
        }
      } else {
        const newAppointment: Appointment = {
          ...formData,
          id: `appt-${Date.now()}`,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isVirtual: formData.mode === 'Virtual',
          isCompleted: false,
          isCancelled: false,
          videoLink: formData.mode === 'Virtual' ? `https://meet.kinetic-ai.com/${Date.now()}` : '',
          patientId: patientId || ''
        }
        success = await handleCreateAppointment(newAppointment)
        if (success) {
          updatedAppointment = newAppointment
        }
      }
      
      if (success && updatedAppointment) {
        onAppointmentUpdate?.(updatedAppointment)
        toast({
          title: 'Success',
          description: isEditing ? 'Appointment updated successfully' : 'Appointment created successfully',
        })
        resetForm()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Error saving appointment:', error)
      toast({
        title: 'Error',
        description: 'Failed to save appointment',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteAppointment = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return false
    
    try {
      // Since deleteAppointment doesn't exist, we'll simulate it by updating the status to 'Cancelled'
      const response = await mockApi.updateAppointment(id, { status: 'Cancelled' } as Partial<Appointment>)
      if (response.success) {
        setAppointments(prev => prev.filter(appt => appt.id !== id))
        toast({
          title: 'Success',
          description: 'Appointment deleted successfully',
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete appointment',
        variant: 'destructive',
      })
      return false
    }
  }, [toast])

  const handleSave = useCallback(() => {
    const form = document.getElementById('appointment-form') as HTMLFormElement
    if (form) {
      const event = new Event('submit', { cancelable: true })
      form.dispatchEvent(event)
    }
  }, [])

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData())
    setSelectedAppointment(null)
    setIsEditing(false)
    setIsDialogOpen(false)
  }, [getInitialFormData])

  const handleEdit = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setFormData({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      doctor: appointment.doctor,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      mode: appointment.mode,
      location: appointment.location,
      duration: appointment.duration,
      notes: appointment.notes || '',
      doctorImage: appointment.doctorImage || '/default-doctor.jpg'
    })
    setIsEditing(true)
    setIsDialogOpen(true)
  }, [])

  const handleCancelAppointment = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return false
    
    try {
      const response = await mockApi.updateAppointment(id, { status: 'Cancelled' } as Partial<Appointment>)
      if (response.success) {
        setAppointments(prev => 
          prev.map(appt => 
            appt.id === id 
              ? { ...appt, status: 'Cancelled' as const } 
              : appt
          )
        )
        toast({
          title: 'Success',
          description: 'Appointment cancelled successfully',
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment',
        variant: 'destructive',
      })
      return false
    }
  }, [toast])

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      await simulateDelay(800)
      const response = await mockApi.getAppointments()
      if (response.success && Array.isArray(response.data)) {
        // Ensure the data matches the Appointment interface
        const validAppointments = response.data.filter((item: any): item is Appointment => {
          const hasRequiredFields = item && 
            typeof item === 'object' &&
            'id' in item &&
            'patientId' in item &&
            'doctorId' in item &&
            'date' in item &&
            'time' in item &&
            'doctor' in item &&
            'type' in item &&
            'mode' in item &&
            'location' in item &&
            'duration' in item &&
            'status' in item &&
            'insuranceVerified' in item &&
            'reminderSent' in item &&
            'createdAt' in item &&
            'updatedAt' in item
          
          if (!hasRequiredFields) {
            console.warn('Invalid appointment data:', item)
          }
          return hasRequiredFields
        })
        setAppointments(validAppointments)
      } else {
        console.error('Invalid appointments data format:', response)
        setAppointments([])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAppointments()
  }, [patientId])

  if (loading) {
    return (
      <div>Loading appointments...</div>
    )
  }

  const renderAppointmentCard = (appointment: Appointment) => (
    <div key={appointment.id} className="mb-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{appointment.type}</h3>
              <p className="text-sm text-gray-500">
                {formatDate(appointment.date)} • {appointment.time}
              </p>
            </div>
            {renderStatusBadge(appointment.status)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Image
                src={appointment.doctorImage || '/default-doctor.jpg'}
                alt={appointment.doctor}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div>
              <p className="font-medium">{appointment.doctor}</p>
              <p className="text-sm text-gray-500">{appointment.mode}</p>
              {appointment.location && (
                <p className="text-sm text-gray-500 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {appointment.location}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(appointment)}
          >
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCancelAppointment(appointment.id)}
            disabled={appointment.status === 'Cancelled'}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Cancel
          </Button>
        </CardFooter>
      </Card>
      {appointment.status === 'Confirmed' && appointment.mode === 'Virtual' && (
        <div className="mt-2 flex justify-end">
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
            <Video className="w-4 h-4 mr-1" />
            Join Call
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <Button
          onClick={() => {
            setFormData(getInitialFormData());
            setIsEditing(false);
            setSelectedAppointment(null);
            setIsDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {/* <Plus className="mr-2 h-4 w-4" /> */}
          New Appointment
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div> */}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          {/* <Calendar className="mx-auto h-12 w-12 text-gray-400" /> */}
          <h3 className="mt-2 text-lg font-medium text-gray-900">No appointments</h3>
          <p className="mt-1 text-gray-500">Get started by creating a new appointment.</p>
          <div className="mt-6">
            <Button
              onClick={() => {
                setFormData(getInitialFormData());
                setIsEditing(false);
                setSelectedAppointment(null);
                setIsDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {/* <Plus className="mr-2 h-4 w-4" /> */}
              New Appointment
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map(renderAppointmentCard)}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Appointment' : 'New Appointment'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Appointment Type</Label>
              <Input
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="e.g., Consultation, Follow-up"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Appointment Mode</Label>
              <Select
                value={formData.mode}
                onValueChange={(value) =>
                  setFormData({ ...formData, mode: value as AppointmentMode })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Virtual">Virtual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.mode === 'In-person' && (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) =>
                  setFormData({ ...formData, duration: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                  <SelectItem value="2 hours">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional information"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isEditing ? 'Update' : 'Create'} Appointment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsManager;