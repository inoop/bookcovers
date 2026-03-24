import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';
import type {
  BriefOrderAdminResponse,
  ConciergeOrderAdminResponse,
  InquiryAdminResponse,
  EmailSubscriptionAdminResponse,
} from '../types';

export function useBriefOrders(paymentStatus?: string) {
  return useQuery({
    queryKey: ['admin-brief-orders', paymentStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (paymentStatus) params.set('payment_status', paymentStatus);
      const { data } = await apiClient.get<BriefOrderAdminResponse[]>(
        `/api/admin/orders/brief?${params.toString()}`
      );
      return data;
    },
  });
}

export function useConciergeOrders(paymentStatus?: string) {
  return useQuery({
    queryKey: ['admin-concierge-orders', paymentStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (paymentStatus) params.set('payment_status', paymentStatus);
      const { data } = await apiClient.get<ConciergeOrderAdminResponse[]>(
        `/api/admin/orders/concierge?${params.toString()}`
      );
      return data;
    },
  });
}

export function useInquiries() {
  return useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: async () => {
      const { data } = await apiClient.get<InquiryAdminResponse[]>('/api/admin/leads/inquiries');
      return data;
    },
  });
}

export function useEmailSubscriptions(isConfirmed?: boolean) {
  return useQuery({
    queryKey: ['admin-subscriptions', isConfirmed],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isConfirmed !== undefined) params.set('is_confirmed', String(isConfirmed));
      const { data } = await apiClient.get<EmailSubscriptionAdminResponse[]>(
        `/api/admin/leads/subscriptions?${params.toString()}`
      );
      return data;
    },
  });
}
