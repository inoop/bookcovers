import { Controller, useFormContext } from 'react-hook-form';
import { Autocomplete, Chip, TextField } from '@mui/material';

interface FormTagSelectProps {
  name: string;
  label: string;
  options: string[];
  freeSolo?: boolean;
}

export default function FormTagSelect({ name, label, options, freeSolo = false }: FormTagSelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          multiple
          freeSolo={freeSolo}
          options={options}
          value={field.value ?? []}
          onChange={(_, newValue) => field.onChange(newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...rest } = getTagProps({ index });
              return <Chip key={key} label={option} size="small" {...rest} />;
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      )}
    />
  );
}
