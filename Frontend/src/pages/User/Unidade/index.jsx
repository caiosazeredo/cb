// src/pages/Unidade/index.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';

const CaixaCard = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: '#fff',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const API_URL = 'http://localhost:3000/api';

const UnidadePage = () => {
  const { id } = useParams();
  const [caixas, setCaixas] = useState([]);
  const [unidade, setUnidade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Busca dados da unidade
        const unidadeResponse = await fetch(`${API_URL}/unidades/${id}`);
        if (!unidadeResponse.ok) throw new Error('Erro ao buscar unidade');
        const unidadeData = await unidadeResponse.json();
        setUnidade(unidadeData);

        // Busca caixas da unidade
        const caixasResponse = await fetch(`${API_URL}/unidades/${id}/caixas`);
        if (!caixasResponse.ok) throw new Error('Erro ao buscar caixas');
        const caixasData = await caixasResponse.json();
        setCaixas(caixasData);
      } catch (error) {
        console.error('Erro:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <Container><Typography>Carregando...</Typography></Container>;
  }

  if (error) {
    return <Container><Typography color="error">{error}</Typography></Container>;
  }

  const handleCaixaClick = (caixaId) => {
    // Aqui você pode adicionar a navegação para a página específica do caixa
    console.log(`Caixa ${caixaId} clicado`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'fechado': '#ff4444',
      'aberto': '#00C851',
    };
    return colors[status] || '#ffbb33';
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {unidade?.nome}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {unidade?.endereco}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {unidade?.telefone}
      </Typography>

      <Typography variant="h5" sx={{ mt: 4, mb: 3 }}>
        Caixas Disponíveis
      </Typography>

      <Grid container spacing={3}>
        {caixas.map((caixa) => (
          <Grid item xs={12} sm={6} md={4} key={caixa.id}>
            <CaixaCard onClick={() => handleCaixaClick(caixa.id)}>
              <PointOfSaleIcon 
                sx={{ 
                  fontSize: 40, 
                  color: getStatusColor(caixa.status),
                  mb: 1 
                }} 
              />
              <Typography variant="h6">
                Caixa {caixa.numero}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {caixa.status.charAt(0).toUpperCase() + caixa.status.slice(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {caixa.formasPagamento && Object.entries(caixa.formasPagamento)
                  .filter(([_, aceita]) => aceita)
                  .map(([forma]) => forma.charAt(0).toUpperCase() + forma.slice(1))
                  .join(', ')}
              </Typography>
            </CaixaCard>
          </Grid>
        ))}

        {caixas.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center">
              Nenhum caixa cadastrado nesta unidade.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default UnidadePage;