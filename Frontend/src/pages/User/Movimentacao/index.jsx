// src/pages/User/Movimentacao/index.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton,
  TextField,
  CircularProgress
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ptBR from "date-fns/locale/pt-BR";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Swal from "sweetalert2";

import Api from "../../../helpers/Api";
import AuthContext from "../../../helpers/AuthContext";

// Componentes
import FormularioMovimentacao from "../../../components/FormularioMovimentacao";
import HistoricoMovimentacao from "../../../components/HistoricoMovimentacao";
import ResumoMovimentacao from "../../../components/ResumoMovimentacao";
import FormularioMovimentacaoEmLinhas from "../../../components/FormularioMovimentacaoEmLinhas";

const Movimentacao = () => {
  // Context e navegação
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const api = Api();

  // Parâmetros da URL
  const { unidadeId, caixaId } = useParams();

  // Estados
  const [tabValue, setTabValue] = useState(0);
  const [movements, setMovements] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);
  const [caixaInfo, setCaixaInfo] = useState(null);
  const [unidadeInfo, setUnidadeInfo] = useState(null);
  const [trocoDisponivel, setTrocoDisponivel] = useState({});

  // Estado para novo movimento
  const [newMovement, setNewMovement] = useState({
    type: "entrada",
    paymentMethod: "",
    amount: "",
    description: "",
    clientName: "",
    documentNumber: "",
    paymentStatus: "realizado"
  });

  // Estado para várias movimentações (lote)
  const [tempMovements, setTempMovements] = useState([
    {
      tipo: "entrada",
      forma: "",
      valor: "",
      descricao: "",
      paymentStatus: "realizado"
    }
  ]);

  // Métodos de pagamento disponíveis
  const paymentMethods = [
    { id: "dinheiro", label: "Dinheiro" },
    { id: "credito", label: "Cartão de Crédito" },
    { id: "debito", label: "Cartão de Débito" },
    { id: "pix", label: "PIX" },
    { id: "ticket", label: "Ticket" }
  ];

  // -----------------------------
  // BUSCAR DADOS (Caixa, Unidade, Troco)
  // -----------------------------
  const fetchCaixaInfo = async () => {
    try {
      const response = await api.getCaixa(unidadeId, caixaId);
      if (response.success) {
        setCaixaInfo(response.data);
      } else {
        console.error("Erro ao buscar informações do caixa:", response.error);
      }
    } catch (error) {
      console.error("Erro ao buscar informações do caixa:", error);
    }
  };

  const fetchUnidadeInfo = async () => {
    try {
      const response = await api.getUnit(unidadeId);
      if (response.success) {
        setUnidadeInfo(response.data);
      } else {
        console.error("Erro ao buscar informações da unidade:", response.error);
      }
    } catch (error) {
      console.error("Erro ao buscar informações da unidade:", error);
    }
  };

  const fetchTrocoDisponivel = async () => {
    try {
      const response = await api.getTroco(unidadeId, caixaId);
      if (response.success) {
        setTrocoDisponivel(response.data || {});
      } else {
        console.error("Erro ao buscar troco disponível:", response.error);
      }
    } catch (error) {
      console.error("Erro ao buscar troco disponível:", error);
    }
  };

  // -----------------------------
  // BUSCAR MOVIMENTAÇÕES
  // -----------------------------
  const fetchMovements = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const formattedDate = date.toISOString().split("T")[0];
      const response = await api.getMovements(unidadeId, caixaId, formattedDate);

      if (response.success) {
        setMovements(response.data || []);
      } else {
        console.error("Erro ao buscar movimentações:", response.error);

        if (
          response.error?.includes("Sessão expirada") ||
          response.error?.includes("Autenticação necessária")
        ) {
          Swal.fire({
            icon: "warning",
            title: "Sessão Expirada",
            text: "Por favor, faça login novamente.",
            showConfirmButton: true
          }).then(() => {
            auth.signout();
            navigate("/login");
          });
        } else {
          setError(response.error || "Não foi possível carregar as movimentações");
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: response.error || "Não foi possível carregar as movimentações",
            showConfirmButton: true
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar movimentações:", error);
      setError("Falha ao carregar movimentações. Tente novamente mais tarde.");

      Swal.fire({
        icon: "error",
        title: "Erro ao carregar movimentações",
        text: "Tente novamente mais tarde",
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // AÇÕES: ADD, SAVE LOTE, DELETE
  // -----------------------------
  // Adicionar nova movimentação (form único)
  const handleAddMovement = async (movementToAdd) => {
    // Verificar se tem todas as informações
    if (!movementToAdd.paymentMethod || !movementToAdd.amount) {
      Swal.fire({
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Forma de pagamento e valor são obrigatórios",
        showConfirmButton: true
      });
      return;
    }

    try {
      setLoadingAction(true);

      // Convertemos o objeto do formulário para o formato esperado pela API
      const movementData = {
        tipo: movementToAdd.type,
        forma: movementToAdd.paymentMethod,
        valor: parseFloat(movementToAdd.amount.replace(",", ".")),
        descricao: movementToAdd.description || "",
        nomeCliente: movementToAdd.clientName || "",
        numeroDocumento: movementToAdd.documentNumber || "",
        data: selectedDate.toISOString(),
        paymentStatus:
          movementToAdd.type === "entrada" ? movementToAdd.paymentStatus : "realizado"
      };

      // Se for pagamento em dinheiro, incluir dados do troco
      if (movementToAdd.paymentMethod === 'dinheiro' && movementToAdd.trocoInfo) {
        // Adicionar ao payload
        movementData.valorRecebido = movementToAdd.trocoInfo.valorRecebido;
        movementData.troco = movementToAdd.trocoInfo.troco;
        
        // Atualizar o troco no banco de dados
        try {
          const dadosTroco = {
            denominacoesRecebidas: movementToAdd.trocoInfo.denominacoesRecebidas || {},
            denominacoesTroco: {} // Aqui poderia calcular as denominações de troco
          };
          
          // Chama a API para atualizar o troco
          const trocoResponse = await api.updateTroco(unidadeId, caixaId, dadosTroco);
          if (!trocoResponse.success) {
            console.error("Erro ao atualizar troco:", trocoResponse.error);
          } else {
            // Atualiza o estado local com o novo troco
            fetchTrocoDisponivel();
          }
        } catch (trocoError) {
          console.error("Erro ao processar troco:", trocoError);
        }
      }

      // Criar o movimento
      const response = await api.createMovement(unidadeId, caixaId, movementData);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Movimentação registrada com sucesso!",
          showConfirmButton: false,
          timer: 1500
        });

        fetchMovements(selectedDate);

        // Limpar formulário
        setNewMovement({
          type: "entrada",
          paymentMethod: "",
          amount: "",
          description: "",
          clientName: "",
          documentNumber: "",
          paymentStatus: "realizado"
        });
      } else {
        if (response.status === 401) {
          Swal.fire({
            icon: "warning",
            title: "Sessão Expirada",
            text: "Por favor, faça login novamente.",
            showConfirmButton: true
          }).then(() => {
            auth.signout();
            navigate("/login");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: response.error || "Erro ao registrar movimentação",
            showConfirmButton: true
          });
        }
      }
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao registrar movimentação",
        text: "Tente novamente mais tarde",
        showConfirmButton: true
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Salvar todas as movimentações em lote (form várias linhas)
  const handleSaveAllMovements = async () => {
    try {
      setLoadingAction(true);

      // Converte cada item (tempMovements) no formato esperado pela API
      const listaDeMovimentos = tempMovements.map(item => ({
        tipo: item.tipo,
        forma: item.forma,
        valor: parseFloat(item.valor.replace(",", ".")),
        descricao: item.descricao,
        paymentStatus: item.paymentStatus
      }));

      const response = await api.createMovementsBatch(unidadeId, caixaId, listaDeMovimentos);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Todas as movimentações foram salvas!",
          showConfirmButton: false,
          timer: 1500
        });

        fetchMovements(selectedDate);

        // Zera o form em lote
        setTempMovements([
          {
            tipo: "entrada",
            forma: "",
            valor: "",
            descricao: "",
            paymentStatus: "realizado"
          }
        ]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao salvar movimentações em lote",
          text: response.error || "Verifique os dados e tente novamente",
          showConfirmButton: true
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro ao salvar movimentações em lote",
        text: error.message || "Verifique os dados e tente novamente",
        showConfirmButton: true
      });
    } finally {
      setLoadingAction(false);
    }
  };

  // Deletar uma movimentação
  const handleDeleteMovement = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Confirmar exclusão',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        setLoadingAction(true);
        const response = await api.deleteMovement(unidadeId, caixaId, id);

        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Movimentação excluída com sucesso!',
            showConfirmButton: false,
            timer: 1500
          });
          fetchMovements(selectedDate);
        } else {
          if (response.status === 401) {
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
              text: response.error || 'Erro ao excluir movimentação',
              showConfirmButton: true,
            });
          }
        }
        setLoadingAction(false);
      }
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
      setLoadingAction(false);

      Swal.fire({
        icon: 'error',
        title: 'Erro ao excluir movimentação',
        text: 'Tente novamente mais tarde',
        showConfirmButton: true,
      });
    }
  };

  // -----------------------------
  // TROCAR DE ABA E ALTERAR DATA
  // -----------------------------
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchMovements(newDate);
  };

  // -----------------------------
  // FUNÇÃO RETORNAR
  // -----------------------------
  const handleGoBack = () => {
    navigate(`/unidade/${unidadeId}/caixas`);
  };

  // -----------------------------
  // CARREGAMENTO INICIAL
  // -----------------------------
  useEffect(() => {
    if (!auth.user) {
      navigate("/login");
      return;
    }

    if (!unidadeId || !caixaId) {
      console.error("IDs de unidade ou caixa inválidos");
      Swal.fire({
        icon: "error",
        title: "Erro de Configuração",
        text: "Não foi possível identificar a unidade ou caixa",
        showConfirmButton: true
      }).then(() => {
        navigate("/");
      });
      return;
    }

    fetchCaixaInfo();
    fetchUnidadeInfo();
    fetchMovements(selectedDate);
    fetchTrocoDisponivel();
  }, [unidadeId, caixaId, auth.user]);

  // Renderização com tratamento de loading/error
  if (loading && !error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <Card>
        <CardContent>
          {/* Cabeçalho responsivo */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", md: "center" },
              mb: 2,
              gap: 2
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={handleGoBack} sx={{ color: "#f4b400" }}>
                <ArrowBackIosIcon />
              </IconButton>

              <Typography variant="h5" component="h1">
                {caixaInfo ? `Movimentação - Caixa ${caixaInfo.numero}` : "Movimentação do Caixa"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                <DatePicker
                  label="Data"
                  value={selectedDate}
                  onChange={handleDateChange}
                  slots={{ textField: TextField }}
                  maxDate={new Date()}
                />
              </LocalizationProvider>
            </Box>
          </Box>

          {/* Abas */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab label="Registrar Movimentação" />
              <Tab label="Registro em Lotes" />
              <Tab label="Histórico" />
            </Tabs>
          </Box>

          {/* Exibição de erro, se houver */}
          {error && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "#ffebee", borderRadius: 1 }}>
              <Typography color="error">{error}</Typography>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <button
                  onClick={() => fetchMovements(selectedDate)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Tentar Novamente
                </button>
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            {/* Aba 0: Registrar Movimentação */}
            {tabValue === 0 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "stretch", md: "flex-start" },
                  gap: 2
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <FormularioMovimentacao
                    newMovement={newMovement}
                    setNewMovement={setNewMovement}
                    paymentMethods={paymentMethods}
                    onAddMovement={handleAddMovement}
                    loading={loadingAction}
                    unidadeId={unidadeId}
                    caixaId={caixaId}
                    api={api}
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "250px" } }}>
                  <ResumoMovimentacao
                    movements={movements}
                    paymentMethods={paymentMethods}
                    loading={loading}
                  />
                </Box>
              </Box>
            )}

            {/* Aba 1: Registro em Lotes */}
            {tabValue === 1 && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "stretch", md: "flex-start" },
                  gap: 2
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <FormularioMovimentacaoEmLinhas
                    tempMovements={tempMovements}
                    onTempMovementsChange={setTempMovements}
                    onSaveAll={handleSaveAllMovements}
                    paymentMethods={paymentMethods}
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "250px" } }}>
                  {(() => {
                    const combinedMovements = [
                      ...movements,
                      ...tempMovements.map((item) => ({
                        tipo: item.tipo,
                        forma: item.forma,
                        valor: parseFloat((item.valor || "").replace(",", ".")) || 0,
                        paymentStatus: item.paymentStatus || "realizado"
                      }))
                    ];
                    return (
                      <ResumoMovimentacao
                        movements={combinedMovements}
                        paymentMethods={paymentMethods}
                        loading={loading}
                      />
                    );
                  })()}
                </Box>
              </Box>
            )}

            {/* Aba 2: Histórico */}
            {tabValue === 2 && (
              <HistoricoMovimentacao
                movements={movements}
                paymentMethods={paymentMethods}
                onDeleteMovement={handleDeleteMovement}
                loading={loading}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default Movimentacao;