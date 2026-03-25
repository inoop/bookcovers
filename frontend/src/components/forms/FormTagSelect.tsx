import { useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Autocomplete, Chip, TextField } from '@mui/material';

interface FormTagSelectProps {
  name: string;
  label: string;
  options: string[];
  freeSolo?: boolean;
  required?: boolean;
}

export default function FormTagSelect({ name, label, options, freeSolo = false, required = false }: FormTagSelectProps) {
  const { control } = useFormContext();
  const [inputValue, setInputValue] = useState('');
  const pendingRef = useRef('');

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
          inputValue={inputValue}
          onInputChange={(_, newInputValue, reason) => {
            if (reason === 'input') {
              setInputValue(newInputValue);
              pendingRef.current = newInputValue;
            } else if (reason === 'reset') {
              setInputValue(newInputValue);
              pendingRef.current = '';
            } else if (reason === 'clear') {
              setInputValue('');
            }
          }}
          onChange={(_, newValue) => {
            field.onChange(newValue);
            setInputValue('');
            pendingRef.current = '';
          }}
          onBlur={() => {
            const trimmed = pendingRef.current.trim();
            if (trimmed && freeSolo) {
              const current = field.value ?? [];
              if (!current.includes(trimmed)) {
                field.onChange([...current, trimmed]);
              }
            }
            setInputValue('');
            pendingRef.current = '';
            field.onBlur();
          }}
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
              required={required}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              inputProps={{ ...params.inputProps, required: false }}
            />
          )}
        />
      )}
    />
  );
}
