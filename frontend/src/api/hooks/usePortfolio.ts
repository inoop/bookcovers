import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type {
  PortfolioAssetResponse,
  PortfolioUploadResponse,
  PortfolioAssetUpdateRequest,
} from '../types';

export function useOwnPortfolio() {
  return useQuery({
    queryKey: ['own-portfolio'],
    queryFn: async () => {
      const { data } = await apiClient.get<PortfolioAssetResponse[]>('/api/freelancer/portfolio');
      return data;
    },
    retry: (count, error: any) => {
      if (error?.response?.status === 404) return false;
      return count < 2;
    },
  });
}

export function useUploadAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<PortfolioUploadResponse>(
        '/api/freelancer/portfolio',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['own-portfolio'] });
      qc.invalidateQueries({ queryKey: ['own-profile'] });
    },
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: PortfolioAssetUpdateRequest & { id: string }) => {
      const { data } = await apiClient.put<PortfolioAssetResponse>(
        `/api/freelancer/portfolio/${id}`,
        body
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['own-portfolio'] }),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/freelancer/portfolio/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['own-portfolio'] });
      qc.invalidateQueries({ queryKey: ['own-profile'] });
    },
  });
}
