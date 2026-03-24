import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  FormControlLabel,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  useAdminArticles,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
} from '../../api/hooks/useAdminContent';
import type { ArticleResponse, ArticleCreateRequest } from '../../api/types';
import { colors } from '../../theme/tokens';

interface ArticleForm {
  title: string;
  slug: string;
  summary: string;
  body: string;
  category: string;
  tags: string;
  is_published: boolean;
}

const emptyForm = (): ArticleForm => ({
  title: '',
  slug: '',
  summary: '',
  body: '',
  category: '',
  tags: '',
  is_published: false,
});

function articleToForm(a: ArticleResponse): ArticleForm {
  return {
    title: a.title,
    slug: a.slug ?? '',
    summary: a.summary ?? '',
    body: a.body ?? '',
    category: a.category ?? '',
    tags: (a.tags ?? []).join(', '),
    is_published: a.is_published,
  };
}

export default function ContentPublishingPage() {
  const { data: articles = [], isLoading } = useAdminArticles();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleResponse | null>(null);
  const [form, setForm] = useState<ArticleForm>(emptyForm());

  const openCreate = () => {
    setEditingArticle(null);
    setForm(emptyForm());
    setDrawerOpen(true);
  };

  const openEdit = (article: ArticleResponse) => {
    setEditingArticle(article);
    setForm(articleToForm(article));
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const payload: ArticleCreateRequest = {
      title: form.title,
      slug: form.slug || undefined,
      summary: form.summary || undefined,
      body: form.body || undefined,
      category: form.category || undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      is_published: form.is_published,
    };
    if (editingArticle) {
      await updateMutation.mutateAsync({ id: editingArticle.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDrawerOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">Content Publishing</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New Article
        </Button>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((a) => (
              <TableRow key={a.id} hover sx={{ cursor: 'pointer' }} onClick={() => openEdit(a)}>
                <TableCell>{a.title}</TableCell>
                <TableCell sx={{ color: colors.text.secondary }}>{a.category}</TableCell>
                <TableCell>
                  <Chip
                    label={a.is_published ? 'Published' : 'Draft'}
                    color={a.is_published ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ color: colors.text.muted }}>
                  {new Date(a.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {articles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: colors.text.muted }}>
                  No articles yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', md: 640 }, p: 6 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h3">{editingArticle ? 'Edit Article' : 'New Article'}</Typography>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            fullWidth
            helperText="Auto-generated from title if blank"
          />
          <TextField
            label="Summary"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Body"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            fullWidth
            multiline
            rows={12}
          />
          <TextField
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            fullWidth
          />
          <TextField
            label="Tags (comma-separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              />
            }
            label="Published"
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!form.title || createMutation.isPending || updateMutation.isPending}
            >
              Save
            </Button>
            {editingArticle && (
              <Button
                color="error"
                onClick={async () => {
                  await deleteMutation.mutateAsync(editingArticle.id);
                  setDrawerOpen(false);
                }}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
