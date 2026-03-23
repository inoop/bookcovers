import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type {
  ReviewSummary,
  ProfileQueueItem,
  FreelancerInternalDetail,
  PortfolioAssetReviewItem,
  ProfileNote,
  ReviewAction,
  ReviewQueueFilters,
  PaginatedResponse,
} from '../types';

export function useReviewSummary() {
  return useQuery({
    queryKey: ['review-summary'],
    queryFn: async () => {
      const { data } = await apiClient.get<ReviewSummary>('/api/internal/review/summary');
      return data;
    },
  });
}

export function useReviewQueue(filters: ReviewQueueFilters = {}) {
  return useQuery({
    queryKey: ['review-queue', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.page_size) params.set('page_size', String(filters.page_size));
      const { data } = await apiClient.get<PaginatedResponse<ProfileQueueItem>>(
        `/api/internal/review/queue?${params.toString()}`
      );
      return data;
    },
  });
}

export function useInternalProfile(profileId: string | null) {
  return useQuery({
    queryKey: ['internal-profile', profileId],
    queryFn: async () => {
      const { data } = await apiClient.get<FreelancerInternalDetail>(
        `/api/internal/review/profiles/${profileId}`
      );
      return data;
    },
    enabled: !!profileId,
  });
}

export function useProfileAssets(profileId: string | null) {
  return useQuery({
    queryKey: ['profile-assets-review', profileId],
    queryFn: async () => {
      const { data } = await apiClient.get<PortfolioAssetReviewItem[]>(
        `/api/internal/review/profiles/${profileId}/assets`
      );
      return data;
    },
    enabled: !!profileId,
  });
}

export function useProfileNotes(profileId: string | null) {
  return useQuery({
    queryKey: ['profile-notes', profileId],
    queryFn: async () => {
      const { data } = await apiClient.get<ProfileNote[]>(
        `/api/internal/review/profiles/${profileId}/notes`
      );
      return data;
    },
    enabled: !!profileId,
  });
}

export function useReviewAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ profileId, action }: { profileId: string; action: ReviewAction }) => {
      const { data } = await apiClient.post<FreelancerInternalDetail>(
        `/api/internal/review/profiles/${profileId}/actions`,
        action
      );
      return data;
    },
    onSuccess: (_data, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['review-queue'] });
      qc.invalidateQueries({ queryKey: ['review-summary'] });
      qc.invalidateQueries({ queryKey: ['internal-profile', profileId] });
      qc.invalidateQueries({ queryKey: ['profile-notes', profileId] });
    },
  });
}

export function useAssetAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assetId,
      action,
      profileId,
    }: {
      assetId: string;
      action: string;
      profileId: string;
    }) => {
      const { data } = await apiClient.post<PortfolioAssetReviewItem>(
        `/api/internal/review/assets/${assetId}/actions`,
        { action }
      );
      return { data, profileId };
    },
    onSuccess: (_result, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['profile-assets-review', profileId] });
      qc.invalidateQueries({ queryKey: ['internal-profile', profileId] });
    },
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      profileId,
      note_type,
      body,
    }: {
      profileId: string;
      note_type: string;
      body: string;
    }) => {
      const { data } = await apiClient.post<ProfileNote>(
        `/api/internal/review/profiles/${profileId}/notes`,
        { note_type, body }
      );
      return data;
    },
    onSuccess: (_data, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['profile-notes', profileId] });
      qc.invalidateQueries({ queryKey: ['internal-profile', profileId] });
    },
  });
}
