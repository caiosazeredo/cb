import { Typography } from "@mui/material";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import { CardContainer, CardContent, CardIcon, StatusIndicator } from "./styles";
import { useNavigate, useParams } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const CaixaCard = ({ id, numero, status, formasPagamento }) => {
  const navigate = useNavigate();
  const { unidadeId } = useParams();

  const getStatusColor = (status) => {
    // eslint-disable-next-line react/prop-types
    switch (status.toLowerCase()) {
      case 'aberto':
        return '#00C851'; // Verde
      case 'fechado':
        return '#ff4444'; // Vermelho
      default:
        return '#ffbb33'; // Amarelo para outros estados
    }
  };

  const formatFormasPagamento = (formas) => {
    if (!formas) return 'Nenhuma forma de pagamento definida';
    
    return Object.entries(formas)
      .filter(([_, aceita]) => aceita)
      .map(([forma]) => forma.charAt(0).toUpperCase() + forma.slice(1))
      .join(', ');
  };

  const handleClick = () => {
    // Usa o ID real do caixa (não o número) para navegação
    console.log(`Navegando para caixa com ID: ${id}`);
    navigate(`/unidade/${unidadeId}/caixa/${id}/movimentacao`);
  };

  return (
    <CardContainer elevation={3} onClick={handleClick}>
      <CardContent>
        <CardIcon>
          <PointOfSaleIcon />
        </CardIcon>
        <Typography variant="h6" component="h2">
          Caixa {numero}
        </Typography>
      </CardContent>

      <StatusIndicator color={getStatusColor(status)}>
        <Typography variant="body1">
          Status: {status.charAt(0).toUpperCase() + status.slice(1)}
        </Typography>
      </StatusIndicator>

      <Typography color="text.secondary" sx={{ mt: 1 }}>
        {formasPagamento ? formatFormasPagamento(formasPagamento) : 'Nenhuma forma de pagamento definida'}
      </Typography>
    </CardContainer>
  );
};

export default CaixaCard;