import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';
import type {
  PaginatedResponse,
  BookCoverCardResponse,
  BookCoverDetailResponse,
  CoverFilters,
} from '../types';

export function useCovers(filters: CoverFilters) {
  return useQuery({
    queryKey: ['covers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.page_size) params.set('page_size', String(filters.page_size));
      if (filters.contributor) params.set('contributor', filters.contributor);
      if (filters.imprint) params.set('imprint', filters.imprint);
      filters.genre?.forEach((v) => params.append('genre', v));
      filters.audience?.forEach((v) => params.append('audience', v));
      filters.style?.forEach((v) => params.append('style', v));
      const { data } = await apiClient.get<PaginatedResponse<BookCoverCardResponse>>(
        `/api/public/covers?${params.toString()}`
      );
      return data;
    },
  });
}

export function useCoverDetail(idOrSlug: string) {
  return useQuery({
    queryKey: ['cover', idOrSlug],
    queryFn: async () => {
      const { data } = await apiClient.get<BookCoverDetailResponse>(
        `/api/public/covers/${idOrSlug}`
      );
      return data;
    },
    enabled: !!idOrSlug,
  });
}
