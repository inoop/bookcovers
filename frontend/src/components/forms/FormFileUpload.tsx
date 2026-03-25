import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { colors } from '../../theme/tokens';

interface FormFileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
}

const DEFAULT_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

export default function FormFileUpload({
  onUpload,
  accept = DEFAULT_ACCEPT,
  maxSize = 10 * 1024 * 1024,
  disabled = false,
}: FormFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      for (const file of acceptedFiles) {
        if (file.size > maxSize) {
          setError(`File "${file.name}" exceeds ${maxSize / (1024 * 1024)}MB limit`);
          continue;
        }

        setUploading(true);
        try {
          await onUpload(file);
        } catch (e: any) {
          setError(e?.response?.data?.detail || 'Upload failed');
        } finally {
          setUploading(false);
        }
      }
    },
    [onUpload, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    disabled: uploading || disabled,
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: `2px dashed ${isDragActive ? colors.action.secondary : colors.border.default}`,
          borderRadius: 3,
          p: 8,
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          backgroundColor: isDragActive ? 'rgba(60,90,117,0.04)' : colors.surface.canvas,
          transition: 'all 180ms cubic-bezier(0.2, 0, 0, 1)',
          '&:hover': {
            borderColor: colors.border.strong,
            backgroundColor: colors.surface.soft,
          },
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <CircularProgress size={32} />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 40, color: colors.text.muted, mb: 2 }} />
            <Typography variant="body1" sx={{ color: colors.text.body }}>
              {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to browse'}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text.muted, mt: 1 }}>
              JPG, PNG, WebP, or PDF up to 10MB
            </Typography>
          </>
        )}
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
