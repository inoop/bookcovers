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

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/api/admin/users/${userId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useUpdateUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data } = await apiClient.put<UserAdminResponse>(
        `/api/admin/users/${userId}/active`,
        { is_active: isActive }
      );
      return data;
    },
    onSuccess: (updatedUser) => {
      qc.setQueriesData<UserAdminResponse[]>(
        { queryKey: ['admin-users'] },
        (old) => old?.map((u) => (u.id === updatedUser.id ? updatedUser : u)) ?? old,
      );
    },
  });
}
