import PropTypes from 'prop-types';
import { CardContainer, UserIcon, CardContent } from "./styles";
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Ícone do Material-UI

const EmployeeCard = ({ funcionario, ...rest }) => {
  // Desestrutura com valores padrão e verifica campos vazios
  const {
    cpf = "",
    name = "Não informado",
    email = "",
    phone = "",
    role = "",
    selectedUnits = [],
    superusuario = false,
    ativo = true
  } = funcionario;

  return (
    <CardContainer {...rest}>
      <UserIcon>
        <AccountCircleIcon style={{ fontSize: 50, color: "#f4b400" }} />
      </UserIcon>
      <CardContent>
        <h3>{name}</h3>
        <p><strong>CPF:</strong> {cpf || "Não informado"}</p>
        <p><strong>E-mail:</strong> {email || "Não informado"}</p>
        <p><strong>Telefone:</strong> {phone || "Não informado"}</p>
        <p><strong>Função:</strong> {role || "Não informado"}</p>
        <p>
          <strong>Unidades:</strong>{" "}
          {Array.isArray(selectedUnits) && selectedUnits.length > 0
            ? selectedUnits.join(", ")
            : "Não informado"
          }
        </p>
        <p><strong>Superusuário:</strong> {superusuario ? "Sim" : "Não"}</p>
        <p><strong>Ativo:</strong> {ativo ? "Sim" : "Não"}</p>
      </CardContent>
    </CardContainer>
  );
};

// Definição das PropTypes
EmployeeCard.propTypes = {
  funcionario: PropTypes.shape({
    cpf: PropTypes.string,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    phone: PropTypes.string,
    role: PropTypes.string,
    selectedUnits: PropTypes.arrayOf(PropTypes.string),
    superusuario: PropTypes.bool,
    ativo: PropTypes.bool,
  }).isRequired,
};

export default EmployeeCard;
