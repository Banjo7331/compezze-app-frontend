import { Button as MuiButton } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';

// Eksportujemy przycisk z MUI pod naszą "własną" nazwą.
// Możemy tu dodać domyślne propsy dla całego projektu,
export const Button = (props: ButtonProps) => {
  // np. domyślnie ustawiamy variant="contained"
  return <MuiButton variant="contained" {...props} />;
};