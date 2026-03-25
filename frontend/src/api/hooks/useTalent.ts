import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type {
  FavoriteToggleResponse,
  InternalFreelancerCard,
  InternalFreelancerFilters,
  FolderResponse,
  FolderDetailResponse,
  FolderCreateRequest,
  FolderUpdateRequest,
  FeedbackEntry,
  FeedbackEntryCreateRequest,
  NoteUpdateRequest,
  ProfileNote,
  PaginatedResponse,
  FreelancerInternalDetail,
} from '../types';

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profileId: string) => {
      const { data } = await apiClient.post<FavoriteToggleResponse>(
        `/api/internal/talent/favorites/${profileId}`
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['internal-freelancers'] });
      qc.invalidateQueries({ queryKey: ['internal-favorites'] });
    },
  });
}

export function useFavorites(page = 1) {
  return useQuery({
    queryKey: ['internal-favorites', page],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<InternalFreelancerCard>>(
        `/api/internal/talent/favorites?page=${page}`
      );
      return data;
    },
  });
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: async () => {
      const { data } = await apiClient.get<FolderResponse[]>('/api/internal/talent/folders');
      return data;
    },
  });
}

export function useFolderDetail(folderId: string | null) {
  return useQuery({
    queryKey: ['folder', folderId],
    queryFn: async () => {
      const { data } = await apiClient.get<FolderDetailResponse>(
        `/api/internal/talent/folders/${folderId}`
      );
      return data;
    },
    enabled: !!folderId,
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: FolderCreateRequest) => {
      const { data } = await apiClient.post<FolderResponse>('/api/internal/talent/folders', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['folders'] }),
  });
}

export function useUpdateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ folderId, body }: { folderId: string; body: FolderUpdateRequest }) => {
      const { data } = await apiClient.put<FolderResponse>(
        `/api/internal/talent/folders/${folderId}`,
        body
      );
      return data;
    },
    onSuccess: (_data, { folderId }) => {
      qc.invalidateQueries({ queryKey: ['folders'] });
      qc.invalidateQueries({ queryKey: ['folder', folderId] });
    },
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (folderId: string) => {
      await apiClient.delete(`/api/internal/talent/folders/${folderId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['folders'] }),
  });
}

export function useAddToFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ folderId, profileId }: { folderId: string; profileId: string }) => {
      const { data } = await apiClient.post<FolderResponse>(
        `/api/internal/talent/folders/${folderId}/members`,
        { profile_id: profileId }
      );
      return data;
    },
    onSuccess: (_data, { folderId }) => {
      qc.invalidateQueries({ queryKey: ['folder', folderId] });
      qc.invalidateQueries({ queryKey: ['internal-freelancers'] });
    },
  });
}

export function useRemoveFromFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ folderId, profileId }: { folderId: string; profileId: string }) => {
      await apiClient.delete(
        `/api/internal/talent/folders/${folderId}/members/${profileId}`
      );
    },
    onSuccess: (_data, { folderId }) => {
      qc.invalidateQueries({ queryKey: ['folder', folderId] });
      qc.invalidateQueries({ queryKey: ['internal-freelancers'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Notes (talent — human notes only, full CRUD)
// ---------------------------------------------------------------------------

export function useTalentNotes(profileId: string | null) {
  return useQuery({
    queryKey: ['talent-notes', profileId],
    queryFn: async () => {
      const { data } = await apiClient.get<ProfileNote[]>(
        `/api/internal/talent/profiles/${profileId}/notes`
      );
      return data;
    },
    enabled: !!profileId,
  });
}

export function useCreateTalentNote() {
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
        `/api/internal/talent/profiles/${profileId}/notes`,
        { note_type, body }
      );
      return data;
    },
    onSuccess: (_data, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['talent-notes', profileId] });
    },
  });
}

export function useUpdateTalentNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      profileId,
      noteId,
      body,
    }: {
      profileId: string;
      noteId: string;
      body: NoteUpdateRequest;
    }) => {
      const { data } = await apiClient.put<ProfileNote>(
        `/api/internal/talent/profiles/${profileId}/notes/${noteId}`,
        body
      );
      return data;
    },
    onSuccess: (_data, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['talent-notes', profileId] });
    },
  });
}

export function useDeleteTalentNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ profileId, noteId }: { profileId: string; noteId: string }) => {
      await apiClient.delete(
        `/api/internal/talent/profiles/${profileId}/notes/${noteId}`
      );
    },
    onSuccess: (_data, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['talent-notes', profileId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Feedback entries
// ---------------------------------------------------------------------------

export function useProfileFeedback(profileId: string | null) {
  return useQuery({
    queryKey: ['feedback', profileId],
    queryFn: async () => {
      const { data } = await apiClient.get<FeedbackEntry[]>(
        `/api/internal/talent/profiles/${profileId}/feedback`
      );
      return data;
    },
    enabled: !!profileId,
  });
}

export function useCreateFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      profileId,
      body,
    }: {
      profileId: string;
      body: FeedbackEntryCreateRequest;
    }) => {
      const { data } = await apiClient.post<FeedbackEntry>(
        `/api/internal/talent/profiles/${profileId}/feedback`,
        body
      );
      return data;
    },
    onSuccess: (_data, { profileId }) => {
      qc.invalidateQueries({ queryKey: ['feedback', profileId] });
    },
  });
}

// ---------------------------------------------------------------------------
// Internal freelancer search
// ---------------------------------------------------------------------------

export function useInternalFreelancers(filters: InternalFreelancerFilters) {
  return useQuery({
    queryKey: ['internal-freelancers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.status) params.set('status', filters.status);
      if (filters.location) params.set('location', filters.location);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.page_size) params.set('page_size', String(filters.page_size));
      if (filters.uses_ai !== undefined) params.set('uses_ai', String(filters.uses_ai));
      if (filters.has_agent !== undefined) params.set('has_agent', String(filters.has_agent));
      if (filters.worked_with_prh !== undefined)
        params.set('worked_with_prh', String(filters.worked_with_prh));
      if (filters.employee_of_prh !== undefined)
        params.set('employee_of_prh', String(filters.employee_of_prh));
      if (filters.folder_id) params.set('folder_id', filters.folder_id);
      if (filters.is_favorite !== undefined)
        params.set('is_favorite', String(filters.is_favorite));
      filters.audience?.forEach((v) => params.append('audience', v));
      filters.style?.forEach((v) => params.append('style', v));
      filters.genre?.forEach((v) => params.append('genre', v));

      const { data } = await apiClient.get<PaginatedResponse<InternalFreelancerCard>>(
        `/api/internal/freelancers?${params.toString()}`
      );
      return data;
    },
  });
}

export function useInternalFreelancerDetail(profileId: string | null) {
  return useQuery({
    queryKey: ['internal-freelancer-detail', profileId],
    queryFn: async () => {
      const { data } = await apiClient.get<FreelancerInternalDetail>(
        `/api/internal/freelancers/${profileId}`
      );
      return data;
    },
    enabled: !!profileId,
  });
}
