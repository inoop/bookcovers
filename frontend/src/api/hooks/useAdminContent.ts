import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import type { ArticleResponse, ArticleCreateRequest, ArticleUpdateRequest } from '../types';

export function useAdminArticles(isPublished?: boolean, category?: string) {
  return useQuery({
    queryKey: ['admin-articles', isPublished, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (isPublished !== undefined) params.set('is_published', String(isPublished));
      if (category) params.set('category', category);
      const { data } = await apiClient.get<ArticleResponse[]>(
        `/api/admin/content/articles?${params.toString()}`
      );
      return data;
    },
  });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ArticleCreateRequest) => {
      const { data } = await apiClient.post<ArticleResponse>('/api/admin/content/articles', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-articles'] }),
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: ArticleUpdateRequest & { id: string }) => {
      const { data } = await apiClient.put<ArticleResponse>(
        `/api/admin/content/articles/${id}`,
        body
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-articles'] }),
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/admin/content/articles/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-articles'] }),
  });
}
