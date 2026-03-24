import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { AppSettingResponse } from '../types';

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<AppSettingResponse[]>('/api/admin/settings');
      return data;
    },
  });
}

export function useUpsertSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data } = await apiClient.put<AppSettingResponse>(
        `/api/admin/settings/${key}`,
        { value }
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }),
  });
}
