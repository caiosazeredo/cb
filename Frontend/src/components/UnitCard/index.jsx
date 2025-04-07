import { Typography } from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import { CardContainer, CardContent, CardIcon } from "./styles";
import PropTypes from 'prop-types';

const UnitCard = ({ name, address, telefone, ativo, onClick }) => {
  return (
    <CardContainer elevation={3} onClick={onClick}>
      <CardContent>
        <CardIcon>
          <StoreIcon />
        </CardIcon>
        <Typography variant="h6" component="h2">
          {name}
        </Typography>
      </CardContent>
      <Typography color="text.secondary">{address}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>{telefone}</Typography>
      <Typography variant="body2" sx={{ mt: 1 }} color={ativo ? "green" : "red"}>
        {ativo ? "Ativo" : "Inativo"}
      </Typography>
    </CardContainer>
  );
};

UnitCard.propTypes = {
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  telefone: PropTypes.string.isRequired,
  ativo: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

export default UnitCard;
