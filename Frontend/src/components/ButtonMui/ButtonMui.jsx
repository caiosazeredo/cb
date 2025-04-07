import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

// eslint-disable-next-line react/prop-types
export function ButtonMui({ name, variant = "contained", isLoading, ...rest }) {
    return (
        <Button
            id={name}
            variant={variant}
            sx={{
                // Transição suave para as propriedades que deseja animar:
                transition: "background-color 0.3s ease-in-out, color 0.3s ease-in-out",
                // Caso você queira que o botão "contained" fique amarelo por padrão
                ...(variant === "contained" && {
                    backgroundColor: "#FEC32E",
                    color: "#000", // cor do texto (você pode alterar se quiser branco, por exemplo)
                    "&:hover": {
                        backgroundColor: "#e6b32a", // cor do hover
                    },
                }),
                // Botão "text"
                ...(variant === "text" && {
                    color: "#FEC32E",
                    "&:hover": {
                        backgroundColor: "rgba(254,195,46,0.08)",
                        color: "#c79b24",
                    },
                }),
                // Se quiser também para outlined:
                ...(variant === "outlined" && {
                    borderColor: "#FEC32E",
                    color: "#FEC32E",
                    "&:hover": {
                        borderColor: "#e6b32a",
                        backgroundColor: "rgba(254,195,46,0.08)",
                    },
                }),
                ...(variant === "cancel" && {
                    backgroundColor: "#f74d3e",
                    color: "#fff",
                    "&:hover": {
                        backgroundColor: "#d84232", // Se quiser um tom mais escuro no hover
                    },
                }),
                // E assim por diante caso deseje outros estilos para "text" etc.
                padding: "15px",
            }}
            {...rest}
        >
            {isLoading ? (
                <CircularProgress size={24} color="inherit" />
            ) : (
                name
            )}
        </Button>
    );
}
