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
import { format, startOfDay } from 'date-fns';


import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Swal from "sweetalert2";

import Api from "../../../helpers/Api";
import AuthContext from "../../../helpers/AuthContext";

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

  // Estado para novo movimento (movimentação individual)
  const [newMovement, setNewMovement] = useState({
    type: "entrada",
    paymentCategory: "",
    paymentMethodId: "",
    amount: "",
    description: "",
    clientName: "",
    documentNumber: "",
    paymentStatus: "realizado",
    moedasEntrada: "",
    moedasSaida: ""
  });

  // Estado para múltiplas movimentações (lote)
  const [tempMovements, setTempMovements] = useState([
    {
      tipo: "entrada",
      forma: "",
      valor: "",
      descricao: "",
      paymentStatus: "realizado",
      moedasEntrada: "",
      moedasSaida: ""
    }
  ]);

  // Lista de todos os métodos de pagamento vindos da API
  const [allPaymentMethods, setAllPaymentMethods] = useState([]);

  // ---------------------------------------------
  // Funções de busca de dados (Caixa, Unidade, Movimentações)
  // ---------------------------------------------
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

  const fetchMovements = async (date) => {
    try {
      setLoading(true);
      setError(null);

      //const formattedDate = date.toISOString().split("T")[0];
      const formattedDate = format(date, 'yyyy-MM-dd');
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

  // Busca os métodos de pagamento via rota /formasPagamento (ajuste conforme sua API)
  const loadPaymentMethods = async () => {
    try {
      const resp = await api.allPaymentMethods();
      if (resp.success) {
        setAllPaymentMethods(resp.data || []);
        console.log("setAllPaymentMethods: ", resp.data)
      } else {
        console.error("Erro ao buscar lista de pagamentos:", resp.error);
      }
    } catch (error) {
      console.error("Erro ao buscar lista de pagamentos:", error);
    }
  };

  const toMidnightUTCISO = (date) => {
    const d = startOfDay(date);
    return d.toISOString();
  };

  // ---------------------------------------------
  // Converter arquivo em Base64
  // ---------------------------------------------
  async function convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  // ---------------------------------------------
  // Ações: ADD, SAVE (lote), DELETE
  // ---------------------------------------------
  const handleAddMovement = async (imageFile) => {
    // Validações básicas
    if (!newMovement.paymentCategory) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Você precisa escolher a categoria de pagamento.",
        showConfirmButton: true
      });
      return;
    }

    if (!newMovement.paymentMethodId) {
      Swal.fire({
        icon: "warning",
        title: "Atenção",
        text: "Escolha a forma exata de pagamento.",
        showConfirmButton: true
      });
      return;
    }

    if (!newMovement.amount) {
      Swal.fire({
        icon: "warning",
        title: "Campo obrigatório",
        text: "O valor da movimentação é obrigatório.",
        showConfirmButton: true
      });
      return;
    }

    if (newMovement.type === "entrada" && !newMovement.paymentStatus) {
      Swal.fire({
        icon: "warning",
        title: "Campo obrigatório",
        text: "Status do pagamento é obrigatório para entradas.",
        showConfirmButton: true
      });
      return;
    }

    try {
      setLoadingAction(true);

      // Montamos o objeto para salvar na API
      const movementData = {
        tipo: newMovement.type,
        forma: newMovement.paymentMethodId,
        valor: parseFloat(newMovement.amount.replace(",", ".")),
        descricao: newMovement.description || "",
        nomeCliente: newMovement.clientName || "",
        numeroDocumento: newMovement.documentNumber || "",
        //data: selectedDate.toISOString(),
        //data: format(selectedDate, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        //data: format(selectedDate, "yyyy-MM-dd"),
        data: toMidnightUTCISO(selectedDate),
        paymentStatus:
          newMovement.type === "entrada" ? newMovement.paymentStatus : "realizado",
        moedasEntrada:
          newMovement.paymentCategory === "dinheiro"
            ? newMovement.moedasEntrada
            : "",
        moedasSaida:
          newMovement.paymentCategory === "dinheiro"
            ? newMovement.moedasSaida
            : ""
      };

      if (imageFile) {
        const base64Image = await convertToBase64(imageFile);
        movementData.comprovante = base64Image;
      }

      const response = await api.createMovement(unidadeId, caixaId, movementData);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Movimentação registrada com sucesso!",
          showConfirmButton: false,
          timer: 1500
        });

        // Recarrega as movimentações
        fetchMovements(selectedDate);

        // Limpa o formulário
        setNewMovement({
          type: "entrada",
          paymentCategory: "",
          paymentMethodId: "",
          amount: "",
          description: "",
          clientName: "",
          documentNumber: "",
          paymentStatus: "realizado",
          moedasEntrada: "",
          moedasSaida: ""
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

  // Salvar várias movimentações em lote
  const handleSaveAllMovements = async () => {
    try {
      setLoadingAction(true);

      // Monta lista para a API
      const listaDeMovimentos = tempMovements.map((item) => ({
        tipo: item.tipo,
        forma: item.forma,
        valor: parseFloat(item.valor.replace(",", ".")),
        descricao: item.descricao,
        paymentStatus: item.paymentStatus,
        //data: format(selectedDate, "yyyy-MM-dd"),
        data: toMidnightUTCISO(selectedDate),
        moedasEntrada:
          item.forma === "dinheiro" ? Number(item.moedasEntrada || 0) : 0,
        moedasSaida:
          item.forma === "dinheiro" ? Number(item.moedasSaida || 0) : 0
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
        // Zera o form de lote
        setTempMovements([
          {
            tipo: "entrada",
            forma: "",
            valor: "",
            descricao: "",
            paymentStatus: "realizado",
            moedasEntrada: "",
            moedasSaida: ""
          }
        ]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao salvar em lote",
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

  // Deletar movimentação
  const handleDeleteMovement = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Confirmar exclusão",
        text: "Esta ação não pode ser desfeita!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sim, excluir!",
        cancelButtonText: "Cancelar"
      });

      if (result.isConfirmed) {
        setLoadingAction(true);
        const response = await api.deleteMovement(unidadeId, caixaId, id);

        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Movimentação excluída com sucesso!",
            showConfirmButton: false,
            timer: 1500
          });
          fetchMovements(selectedDate);
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
              text: response.error || "Erro ao excluir movimentação",
              showConfirmButton: true
            });
          }
        }
        setLoadingAction(false);
      }
    } catch (error) {
      console.error("Erro ao excluir movimentação:", error);
      setLoadingAction(false);

      Swal.fire({
        icon: "error",
        title: "Erro ao excluir movimentação",
        text: "Tente novamente mais tarde",
        showConfirmButton: true
      });
    }
  };

  // ---------------------------------------------
  // Troca de aba e alteração de data
  // ---------------------------------------------
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchMovements(newDate);
  };

  // ---------------------------------------------
  // Botão Voltar
  // ---------------------------------------------
  const handleGoBack = () => {
    navigate(`/unidade/${unidadeId}/caixas`);
  };

  // ---------------------------------------------
  // Carregamento inicial
  // ---------------------------------------------
  useEffect(() => {
    if (!auth.user) {
      navigate("/login");
      return;
    } else {
      if (!auth.user.superusuario) {
        const allowedUnits = auth.user.selectedUnits || [];
        if (!allowedUnits.includes(unidadeId)) {
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

    const doFetch = async () => {
      await fetchCaixaInfo();
      await fetchUnidadeInfo();
      await fetchMovements(selectedDate);
      await loadPaymentMethods();
    };

    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidadeId, caixaId, auth.user]);

  // Renderização com tratamento de loading/error
  if (loading && !error) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <Card>
        <CardContent>
          {/* Cabeçalho e Data Picker */}
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
            {/* ABA 0: Registrar Movimentação individual */}
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
                    onAddMovement={handleAddMovement}
                    loading={loadingAction}
                    allPaymentMethods={allPaymentMethods}
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "250px" } }}>
                  <ResumoMovimentacao
                    movements={movements}
                    loading={loading}
                    paymentMethods={allPaymentMethods}
                  />
                </Box>
              </Box>
            )}

            {/* ABA 1: Registro em Lotes */}
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
                    paymentMethods={allPaymentMethods}
                  />
                </Box>
                <Box sx={{ width: { xs: "100%", md: "250px" } }}>
                  {(() => {
                    // Combina as movimentações existentes + as temporárias para exibir no resumo
                    const combinedMovements = [
                      ...movements,
                      ...tempMovements.map((item) => ({
                        tipo: item.tipo,
                        forma: item.forma,
                        valor: parseFloat((item.valor || "").replace(",", ".")) || 0,
                        paymentStatus: item.paymentStatus || "realizado",
                        moedasEntrada:
                          item.forma === "dinheiro"
                            ? parseFloat(item.moedasEntrada || 0)
                            : 0,
                        moedasSaida:
                          item.forma === "dinheiro"
                            ? parseFloat(item.moedasSaida || 0)
                            : 0
                      }))
                    ];
                    return (
                      <ResumoMovimentacao
                        movements={combinedMovements}
                        loading={loading}
                        paymentMethods={allPaymentMethods}
                      />
                    );
                  })()}
                </Box>
              </Box>
            )}

            {/* ABA 2: Histórico de Movimentações */}
            {tabValue === 2 && (
              <HistoricoMovimentacao
                movements={movements}
                onDeleteMovement={handleDeleteMovement}
                loading={loading}
                paymentMethods={allPaymentMethods}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default Movimentacao;
