import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { TaxonomyTermAdmin, TaxonomyTermCreateRequest, TaxonomyTermUpdateRequest } from '../types';

export function useAdminTaxonomyTerms(category?: string, includeInactive = true) {
  return useQuery({
    queryKey: ['admin-taxonomy', category, includeInactive],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      params.set('include_inactive', String(includeInactive));
      const { data } = await apiClient.get<TaxonomyTermAdmin[]>(
        `/api/admin/taxonomy?${params.toString()}`
      );
      return data;
    },
  });
}

export function useCreateTaxonomyTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: TaxonomyTermCreateRequest) => {
      const { data } = await apiClient.post<TaxonomyTermAdmin>('/api/admin/taxonomy', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-taxonomy'] }),
  });
}

export function useUpdateTaxonomyTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: TaxonomyTermUpdateRequest & { id: string }) => {
      const { data } = await apiClient.put<TaxonomyTermAdmin>(`/api/admin/taxonomy/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-taxonomy'] }),
  });
}

export function useDeleteTaxonomyTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/admin/taxonomy/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-taxonomy'] }),
  });
}
