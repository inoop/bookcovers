import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';
import type { PaginatedResponse, WorkSampleCard } from '../types';

interface WorkSampleFilters {
  q?: string;
  page?: number;
  page_size?: number;
}

export function useWorkSamples(filters: WorkSampleFilters = {}) {
  return useQuery({
    queryKey: ['work-samples', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.page_size) params.set('page_size', String(filters.page_size));
      const { data } = await apiClient.get<PaginatedResponse<WorkSampleCard>>(
        `/api/internal/work-samples?${params.toString()}`
      );
      return data;
    },
  });
}
