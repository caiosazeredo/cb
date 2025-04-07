import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';

export function IconButtonMui({
  icon,
  isLoading = false,
  color = "default",
  size = "medium",
  ...rest
}) {
  return (
    <IconButton
      color={color}
      size={size}
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? <CircularProgress size={24} color="inherit" /> : icon}
    </IconButton>
  );
}

IconButtonMui.propTypes = {
  icon: PropTypes.node.isRequired, // O ícone a ser exibido, por exemplo, <DeleteIcon />
  isLoading: PropTypes.bool,         // Se está carregando
  color: PropTypes.oneOf([
    "default", "inherit", "primary", "secondary", "error", "info", "success", "warning"
  ]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
};
