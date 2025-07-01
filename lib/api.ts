import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getSession();
  const token = session?.accessToken;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
}

export const api = {
  // User endpoints
  getProfile: () => apiRequest<{ user: any }>('/profile'),
  updateProfile: (data: any) =>
    apiRequest('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: any) =>
    apiRequest('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  
  // Subscription endpoints
  getSubscription: () => apiRequest<{ subscription: any }>('/subscription'),
  updateSubscription: (data: any) =>
    apiRequest('/subscription', { method: 'PUT', body: JSON.stringify(data) }),
  cancelSubscription: () =>
    apiRequest('/subscription/cancel', { method: 'POST' }),
  
  // Billing endpoints
  getInvoices: () => apiRequest<{ invoices: any[] }>('/billing/invoices'),
  getPaymentMethods: () => apiRequest<{ paymentMethods: any[] }>('/billing/payment-methods'),
  addPaymentMethod: (data: any) =>
    apiRequest('/billing/payment-methods', { method: 'POST', body: JSON.stringify(data) }),
  
  // Appointments
  getAppointments: () => apiRequest<{ appointments: any[] }>('/appointments'),
  createAppointment: (data: any) =>
    apiRequest('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id: string, data: any) =>
    apiRequest(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // Exercises
  getExercises: () => apiRequest<{ exercises: any[] }>('/exercises'),
  getExercise: (id: string) => apiRequest<{ exercise: any }>(`/exercises/${id}`),
  completeExercise: (id: string) =>
    apiRequest(`/exercises/${id}/complete`, { method: 'POST' }),
};

export default api;
