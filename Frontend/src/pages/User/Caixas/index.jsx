import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CircularProgress from '@mui/material/CircularProgress';
import Api from "../../../helpers/Api";
import AuthContext from "../../../helpers/AuthContext";
import CaixaCard from "../../../components/CaixaCard";
import { InputTextField } from "../../../components/InputTextField/InputTextField";
import { ButtonMui } from "../../../components/ButtonMui/ButtonMui";

// Importando estilos
import {
  Container,
  SearchContainer,
  CardList,
  LoadingMessage,
  ErrorMessage,
  BackButtonContainer
} from "./styles";

const Caixas = () => {
  const { unidadeId } = useParams();
  const navigate = useNavigate();
  const api = Api();
  const auth = useContext(AuthContext);

  // Estados
  const [search, setSearch] = useState("");
  const [caixas, setCaixas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);
  const [unidadeNome, setUnidadeNome] = useState("");

  // Buscar informações da unidade
  const fetchUnidadeInfo = async () => {
    try {
      const response = await api.getUnit(unidadeId);
      if (response.success) {
        setUnidadeNome(response.data.nome || "");
      }
    } catch (error) {
      console.error("Erro ao buscar informações da unidade:", error);
    }
  };

  // Buscar lista de caixas
  const handleFetchCaixas = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.allCaixas(unidadeId);

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

  // Criar novo caixa
  const handleCreateCaixa = async () => {
    try {
      setLoadingAction(true);
      const response = await api.createCaixa(unidadeId);

      if (response.success) {
        Swal.fire({
          icon: 'success',
          title: 'Caixa criado com sucesso!',
          showConfirmButton: false,
          timer: 1500
        });
        handleFetchCaixas();
      } else {
        handleApiError(response.error);
      }
    } catch (error) {
      console.error("Erro ao criar caixa:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao criar caixa',
        text: 'Tente novamente mais tarde',
        showConfirmButton: true,
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Tratar erros de API
  const handleApiError = (errorMessage) => {
    if (errorMessage.includes('Sessão expirada') || 
        errorMessage.includes('Autenticação necessária')) {
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

  // Voltar para a Home "/"
  const handleGoHome = () => {
    if(auth.user && auth.user.superusuario){
      navigate("/userMenu");
    }else{
      navigate("/");
    }
  };

  // Efeito para buscar dados ao montar o componente
  useEffect(() => {
    if (!auth.user) {
      navigate('/login');
      return;
    }

    fetchUnidadeInfo();
    handleFetchCaixas();
  }, [unidadeId, auth.user]);

  // Filtra os caixas com base no termo de busca
  const filteredCaixas = caixas.filter((caixa) => {
    const searchTerm = search.toLowerCase();
    return (
      caixa.numero.toString().toLowerCase().includes(searchTerm) ||
      caixa.status.toLowerCase().includes(searchTerm)
    );
  });

  // Renderização condicional com base no estado de loading/error
  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <CircularProgress size={60} />
          <LoadingMessage>Carregando caixas...</LoadingMessage>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <ErrorMessage>{error}</ErrorMessage>
          <ButtonMui name="Tentar Novamente" onClick={handleFetchCaixas} />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* Botão de voltar para a Home */}
      <BackButtonContainer>
        <IconButton onClick={handleGoHome} sx={{ color: "#f4b400" }}>
          <ArrowBackIosIcon />
        </IconButton>
      </BackButtonContainer>

      <h1>{unidadeNome ? `Caixas - ${unidadeNome}` : 'Caixas'}</h1>

      <SearchContainer>
        <InputTextField
          label="Buscar caixa"
          type="text"
          value={search}
          setValue={setSearch}
          className="searchItem"
        />
        <ButtonMui
          name="NOVO CAIXA"
          onClick={handleCreateCaixa}
          isLoading={loadingAction}
          disabled={loadingAction}
        />
      </SearchContainer>

      <CardList>
        {filteredCaixas.length > 0 ? (
          filteredCaixas.map((caixa) => (
            <CaixaCard
              key={caixa.id}
              id={caixa.id}
              numero={caixa.numero}
              status={caixa.status}
              formasPagamento={caixa.formasPagamento}
            />
          ))
        ) : (
          <p>Nenhum caixa encontrado com esse termo.</p>
        )}
      </CardList>
    </Container>
  );
};

export default Caixas;
