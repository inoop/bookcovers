import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';

interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  created_at: string | null;
}

export function useUsers(search?: string) {
  return useQuery<AdminUser[]>({
    queryKey: ['admin', 'users', search],
    queryFn: async () => {
      const params = search ? { q: search } : {};
      const { data } = await apiClient.get('/api/admin/users', { params });
      return data;
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data } = await apiClient.patch(`/api/admin/users/${userId}/role`, { role });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
