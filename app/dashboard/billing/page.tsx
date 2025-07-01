'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, CreditCard, Check, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { PLANS } from '@/lib/stripe'
import { format } from 'date-fns'

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  
  const {
    subscription,
    isLoading: isSubscriptionLoading,
    isSubscribed,
    isCanceled,
    subscribe,
    cancelSubscription,
    reactivateSubscription,
    openBillingPortal,
  } = useSubscription()

  useEffect(() => {
    // Check for successful payment redirect
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    
    if (success) {
      toast({
        title: 'Payment successful',
        description: 'Your subscription has been updated successfully!',
      })
      // Clean up the URL
      router.replace('/dashboard/billing')
    }
    
    if (canceled) {
      toast({
        title: 'Payment canceled',
        description: 'Your subscription was not updated.',
        variant: 'default',
      })
      // Clean up the URL
      router.replace('/dashboard/billing')
    }
  }, [searchParams, router, toast])

  const handleSubscribe = async (priceId: string) => {
    try {
      setIsLoading(true)
      await subscribe(priceId)
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true)
      await cancelSubscription()
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true)
      await reactivateSubscription()
    } catch (error) {
      console.error('Failed to reactivate subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePaymentMethod = async () => {
    try {
      setIsLoading(true)
      await openBillingPortal()
    } catch (error) {
      console.error('Failed to open billing portal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentPlan = subscription?.planId 
    ? Object.values(PLANS).find(plan => plan.priceId === subscription.planId) || PLANS.free
    : PLANS.free

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          {isSubscriptionLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {Object.entries(PLANS).map(([key, plan]) => {
                const isCurrentPlan = subscription?.planId === plan.priceId
                const isUpgrade = 
                  isSubscribed && 
                  !isCurrentPlan && 
                  (key === 'pro' || key === 'enterprise')
                const isDowngrade = 
                  isSubscribed && 
                  isCurrentPlan && 
                  key !== 'free' && 
                  subscription.planId !== plan.priceId

                return (
                  <Card key={key} className={`relative overflow-hidden ${
                    isCurrentPlan ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}>
                    {isCurrentPlan && (
                      <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Current Plan
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>
                        {key === 'free' ? 'Perfect for getting started' : 
                         key === 'pro' ? 'For professionals and small teams' : 
                         'For large organizations'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold">
                        {key === 'free' ? 'Free' : 
                         key === 'pro' ? '$19.99/mo' : 'Custom'}
                      </div>
                      
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <Check className="mr-2 h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      {isCurrentPlan ? (
                        <Button 
                          variant={isCanceled ? 'default' : 'outline'} 
                          className="w-full"
                          onClick={isCanceled ? handleReactivateSubscription : handleCancelSubscription}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : isCanceled ? (
                            'Reactivate Subscription'
                          ) : (
                            'Cancel Subscription'
                          )}
                        </Button>
                      ) : (
                        <Button 
                          className="w-full"
                          onClick={() => handleSubscribe(plan.priceId)}
                          disabled={isLoading || (isSubscribed && !isUpgrade)}
                        >
                          {isLoading && selectedPlan === plan.priceId ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : isSubscribed ? (
                            isUpgrade ? 'Upgrade Plan' : 'Current Plan'
                          ) : (
                            'Get Started'
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleUpdatePaymentMethod}
                    disabled={isLoading || !isSubscribed}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Update'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>
                View and download your billing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Invoice #{1000 + i}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium">${19.99}</p>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {subscription && (
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Current Plan</h3>
              <p className="text-sm text-muted-foreground">
                {isCanceled ? (
                  <span className="inline-flex items-center text-amber-500">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Will be canceled on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-green-500">
                    <Check className="mr-1 h-3 w-3" />
                    Active until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleUpdatePaymentMethod}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Manage Subscription'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
