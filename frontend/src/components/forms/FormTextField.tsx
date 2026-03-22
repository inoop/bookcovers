import { Controller, useFormContext } from 'react-hook-form';
import { TextField, type TextFieldProps } from '@mui/material';

type FormTextFieldProps = {
  name: string;
  multiline?: boolean;
  rows?: number;
} & Omit<TextFieldProps, 'name'>;

export default function FormTextField({ name, ...props }: FormTextFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...props}
          value={field.value ?? ''}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
        />
      )}
    />
  );
}
