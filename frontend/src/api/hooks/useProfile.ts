import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { OwnProfileResponse, ProfileCreateRequest, ProfileUpdateRequest } from '../types';

export function useOwnProfile() {
  return useQuery({
    queryKey: ['own-profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<OwnProfileResponse>('/api/freelancer/profile');
      return data;
    },
    retry: (count, error: any) => {
      if (error?.response?.status === 404) return false;
      return count < 2;
    },
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ProfileCreateRequest) => {
      const { data } = await apiClient.post<OwnProfileResponse>('/api/freelancer/profile', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['own-profile'] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ProfileUpdateRequest) => {
      const { data } = await apiClient.put<OwnProfileResponse>('/api/freelancer/profile', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['own-profile'] }),
  });
}

export function useSubmitProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<OwnProfileResponse>('/api/freelancer/profile/submit');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['own-profile'] }),
  });
}

export function useRetractProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<OwnProfileResponse>('/api/freelancer/profile/retract');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['own-profile'] }),
  });
}

export function useDeleteAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete<OwnProfileResponse>('/api/freelancer/profile/avatar');
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['own-profile'] }),
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post<OwnProfileResponse>(
        '/api/freelancer/profile/avatar',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['own-profile'] }),
  });
}
