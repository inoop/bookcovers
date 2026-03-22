import { Box, Chip, Typography } from '@mui/material';
import { colors, fonts } from '../../theme/tokens';

interface FilterChipGroupProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function FilterChipGroup({ label, options, selected, onChange }: FilterChipGroupProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{
          fontFamily: fonts.utility,
          fontSize: '0.6875rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: colors.text.secondary,
          mb: 2,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <Chip
              key={opt}
              label={opt}
              size="small"
              onClick={() => toggle(opt)}
              sx={{
                backgroundColor: isSelected ? colors.action.secondary : colors.surface.soft,
                color: isSelected ? '#fff' : colors.text.body,
                border: isSelected ? 'none' : `1px solid ${colors.border.default}`,
                '&:hover': {
                  backgroundColor: isSelected ? colors.action.secondaryHover : colors.surface.raised,
                },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
