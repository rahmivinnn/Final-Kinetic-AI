import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'unsubscribed'

interface Subscription {
  id: string
  status: SubscriptionStatus
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  planId: string
}

export function useSubscription() {
  const { data: session, update } = useSession()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchSubscription = async () => {
    try {
      setIsLoading(true)
      const { subscription } = await api.getSubscription()
      setSubscription(subscription)
    } catch (err) {
      console.error('Failed to fetch subscription:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'))
    } finally {
      setIsLoading(false)
    }
  }

  const subscribe = async (priceId: string) => {
    try {
      setIsLoading(true)
      const { url } = await api.createCheckoutSession({
        priceId,
        successUrl: `${window.location.origin}/dashboard/billing/success`,
        cancelUrl: `${window.location.origin}/dashboard/billing`,
      })
      
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err)
      toast({
        title: 'Error',
        description: 'Failed to initiate checkout. Please try again.',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSubscription = async () => {
    if (!subscription) return
    
    try {
      setIsLoading(true)
      await api.cancelSubscription()
      await update() // Refresh session
      await fetchSubscription()
      
      toast({
        title: 'Subscription updated',
        description: 'Your subscription will be canceled at the end of the current billing period.',
      })
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const reactivateSubscription = async () => {
    if (!subscription) return
    
    try {
      setIsLoading(true)
      await api.reactivateSubscription()
      await update() // Refresh session
      await fetchSubscription()
      
      toast({
        title: 'Subscription reactivated',
        description: 'Your subscription has been reactivated.',
      })
    } catch (err) {
      console.error('Failed to reactivate subscription:', err)
      toast({
        title: 'Error',
        description: 'Failed to reactivate subscription. Please try again.',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const openBillingPortal = async () => {
    try {
      const { url } = await api.createBillingPortalSession({
        returnUrl: `${window.location.origin}/dashboard/billing`,
      })
      
      if (url) {
        window.location.href = url
      }
    } catch (err) {
      console.error('Failed to open billing portal:', err)
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchSubscription()
    }
  }, [session])

  return {
    subscription,
    isLoading,
    error,
    isSubscribed: subscription?.status === 'active' || subscription?.status === 'trialing',
    isCanceled: subscription?.cancelAtPeriodEnd,
    subscribe,
    cancelSubscription,
    reactivateSubscription,
    openBillingPortal,
    refetch: fetchSubscription,
  }
}
