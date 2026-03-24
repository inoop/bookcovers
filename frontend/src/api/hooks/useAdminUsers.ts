import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { UserAdminResponse } from '../types';

export function useAdminUsers(role?: string) {
  return useQuery({
    queryKey: ['admin-users', role],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      const { data } = await apiClient.get<UserAdminResponse[]>(
        `/api/admin/users?${params.toString()}`
      );
      return data;
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data } = await apiClient.put<UserAdminResponse>(
        `/api/admin/users/${userId}/role`,
        { role }
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}
