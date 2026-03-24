import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type {
  CoverAdminResponse,
  CoverCreateRequest,
  CoverUpdateRequest,
  ContributorCreateRequest,
  ContributorResponse,
} from '../types';

export function useAdminCovers(visibility?: string) {
  return useQuery({
    queryKey: ['admin-covers', visibility],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (visibility) params.set('visibility', visibility);
      const { data } = await apiClient.get<CoverAdminResponse[]>(
        `/api/admin/covers?${params.toString()}`
      );
      return data;
    },
  });
}

export function useCreateCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CoverCreateRequest) => {
      const { data } = await apiClient.post<CoverAdminResponse>('/api/admin/covers', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-covers'] }),
  });
}

export function useUpdateCover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: CoverUpdateRequest & { id: string }) => {
      const { data } = await apiClient.put<CoverAdminResponse>(`/api/admin/covers/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-covers'] }),
  });
}

export function useAddContributor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ coverId, ...body }: ContributorCreateRequest & { coverId: string }) => {
      const { data } = await apiClient.post<ContributorResponse>(
        `/api/admin/covers/${coverId}/contributors`,
        body
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-covers'] }),
  });
}

export function useRemoveContributor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ coverId, contributorId }: { coverId: string; contributorId: string }) => {
      await apiClient.delete(`/api/admin/covers/${coverId}/contributors/${contributorId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-covers'] }),
  });
}
