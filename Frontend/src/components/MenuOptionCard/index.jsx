// src/components/MenuOptionCard/index.jsx
import { Typography } from "@mui/material";
import { CardContainer, CardContent, CardIcon } from "./styles";

// eslint-disable-next-line react/prop-types
const MenuOptionCard = ({ icon, text, onClick }) => {
  return (
    <CardContainer elevation={3} onClick={onClick}>
      <CardContent>
        <CardIcon>
          {icon}
        </CardIcon>
        <Typography variant="h6" component="h2">
          {text}
        </Typography>
      </CardContent>
    </CardContainer>
  );
};

export default MenuOptionCard;