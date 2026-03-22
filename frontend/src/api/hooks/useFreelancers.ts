import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';
import type {
  PaginatedResponse,
  FreelancerCardResponse,
  FreelancerDetailResponse,
  FreelancerFilters,
} from '../types';

export function useFreelancers(filters: FreelancerFilters) {
  return useQuery({
    queryKey: ['freelancers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.page_size) params.set('page_size', String(filters.page_size));
      if (filters.location) params.set('location', filters.location);
      if (filters.uses_ai !== undefined) params.set('uses_ai', String(filters.uses_ai));
      filters.audience?.forEach((v) => params.append('audience', v));
      filters.style?.forEach((v) => params.append('style', v));
      filters.genre?.forEach((v) => params.append('genre', v));
      filters.image_tags?.forEach((v) => params.append('image_tags', v));
      const { data } = await apiClient.get<PaginatedResponse<FreelancerCardResponse>>(
        `/api/public/freelancers?${params.toString()}`
      );
      return data;
    },
  });
}

export function useFreelancerDetail(idOrSlug: string) {
  return useQuery({
    queryKey: ['freelancer', idOrSlug],
    queryFn: async () => {
      const { data } = await apiClient.get<FreelancerDetailResponse>(
        `/api/public/freelancers/${idOrSlug}`
      );
      return data;
    },
    enabled: !!idOrSlug,
  });
}
