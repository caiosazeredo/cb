import TextField from '@mui/material/TextField';
import { IconButton, InputAdornment } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useState } from 'react';

// eslint-disable-next-line react/prop-types
export function InputTextField({ label, type = "text", value, setValue, showPasswordToggle = false, ...rest }) {
  // Estado para exibir/ocultar a senha
  const [showPassword, setShowPassword] = useState(false);

  // Alterna o estado de exibição da senha
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Se showPasswordToggle estiver ativo, alternamos entre "text" e "password"
  const finalType = showPasswordToggle
    ? (showPassword ? 'text' : 'password')
    : type;

  return (
    <TextField
      id={label}
      variant="outlined"
      label={label}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      type={finalType}
      slotProps={{
        input: {
          endAdornment: showPasswordToggle && (
            <InputAdornment position="end">
              <IconButton
                aria-label={
                  showPassword ? 'Ocultar senha' : 'Exibir senha'
                }
                onClick={handleClickShowPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      sx={{
        '& label': {
          transition: 'color 0.3s ease-in-out',
        },
        '& label.Mui-focused': {
          color: '#FEC32E',
        },
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#E0E3E7',
            transition: 'border-color 0.3s ease-in-out',
          },
          '&:hover fieldset': {
            borderColor: '#B2BAC2',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#FEC32E',
          },
        },
      }}
      {...rest}
    />
  );
}
