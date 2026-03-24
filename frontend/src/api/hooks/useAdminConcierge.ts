import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type {
  ConciergePackageResponse,
  ConciergePackageCreateRequest,
  ConciergePackageUpdateRequest,
} from '../types';

export function useAdminPackages() {
  return useQuery({
    queryKey: ['admin-concierge-packages'],
    queryFn: async () => {
      const { data } = await apiClient.get<ConciergePackageResponse[]>(
        '/api/admin/concierge/packages'
      );
      return data;
    },
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ConciergePackageCreateRequest) => {
      const { data } = await apiClient.post<ConciergePackageResponse>(
        '/api/admin/concierge/packages',
        body
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-concierge-packages'] }),
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: ConciergePackageUpdateRequest & { id: string }) => {
      const { data } = await apiClient.put<ConciergePackageResponse>(
        `/api/admin/concierge/packages/${id}`,
        body
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-concierge-packages'] }),
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/admin/concierge/packages/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-concierge-packages'] }),
  });
}
