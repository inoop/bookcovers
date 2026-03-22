import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';
import type { TaxonomyTerm } from '../types';

export function useTaxonomy(category?: string) {
  return useQuery({
    queryKey: ['taxonomy', category],
    queryFn: async () => {
      const params = category ? `?category=${category}` : '';
      const { data } = await apiClient.get<TaxonomyTerm[]>(
        `/api/public/taxonomy${params}`
      );
      return data;
    },
    staleTime: 5 * 60 * 1000, // taxonomy rarely changes
  });
}
