// src/pages/Unidade/index.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Grid, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Swal from "sweetalert2";

import Api from "../../../helpers/Api";
import AuthContext from "../../../helpers/AuthContext";

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

const UnidadePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = Api();
  const auth = useContext(AuthContext);

  const [caixas, setCaixas] = useState([]);
  const [unidade, setUnidade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar dados da unidade
  const fetchUnidadeInfo = async () => {
    try {
      const response = await api.getUnit(id);
      if (response.success) {
        setUnidade(response.data);
      } else {
        handleApiError(response.error);
      }
    } catch (error) {
      console.error("Erro ao buscar informações da unidade:", error);
      setError("Falha ao carregar os dados da unidade. Tente novamente mais tarde.");
    }
  };

  // Buscar caixas da unidade
  const fetchCaixas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.allCaixas(id);

      if (response.success) {
        setCaixas(response.data);
      } else {
        handleApiError(response.error);
      }
    } catch (error) {
      console.error("Erro ao buscar caixas:", error);
      setError("Falha ao carregar os caixas. Tente novamente mais tarde.");

      Swal.fire({
        icon: 'error',
        title: 'Erro ao carregar caixas',
        text: 'Verifique sua conexão e tente novamente.',
        showConfirmButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Tratar erros de API
  const handleApiError = (errorMessage) => {
    if (errorMessage?.includes('Sessão expirada') ||
      errorMessage?.includes('Autenticação necessária')) {
      Swal.fire({
        icon: 'warning',
        title: 'Sessão Expirada',
        text: 'Por favor, faça login novamente.',
        showConfirmButton: true,
      }).then(() => {
        auth.signout();
        navigate('/login');
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: errorMessage || 'Erro desconhecido. Tente novamente.',
        showConfirmButton: true,
      });
      setError(errorMessage || "Ocorreu um erro inesperado");
    }
  };

  const handleCaixaClick = (caixaId) => {
    navigate(`/unidade/${id}/caixa/${caixaId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'fechado': '#ff4444',
      'aberto': '#00C851',
    };
    return colors[status] || '#ffbb33';
  };

  // Efeito para buscar dados ao montar o componente
  useEffect(() => {
    if (!auth.user) {
      navigate('/login');
      return;
    } else {
      // Se não é superusuário, verificar se tem acesso à unidade
      if (!auth.user.superusuario) {
        const allowedUnits = auth.user.selectedUnits || [];
        if (!allowedUnits.includes(id)) {
          Swal.fire({
            icon: "error",
            title: "Acesso Negado",
            text: "Você não tem permissão para acessar esta unidade.",
            showConfirmButton: true
          }).then(() => {
            navigate("/");
          });
          return;
        }
      }
    }

    const fetchData = async () => {
      await fetchUnidadeInfo();
      await fetchCaixas();
    };

    fetchData();
  }, [id, auth.user]);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
          {error}
        </Typography>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button
            onClick={() => fetchCaixas()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </Container>
    );
  }

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