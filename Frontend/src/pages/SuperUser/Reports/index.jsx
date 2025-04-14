// src/pages/SuperUser/Reports/index.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Divider,
  IconButton,
  TextField,
  Tab,
  Tabs,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Chip,
  Tooltip
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ptBR from "date-fns/locale/pt-BR";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from "date-fns";

// Icons
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import RefreshIcon from "@mui/icons-material/Refresh";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import TableChartIcon from "@mui/icons-material/TableChart";

// Sweet Alert para notificações
import Swal from "sweetalert2";

// API e Context
import Api from "../../../helpers/Api";
import styled from "styled-components";

// Estilos inline (para evitar dependência de arquivo adicional)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  padding: 50px 20px;
  width: 100%;
  position: relative;
`;

const FilterSection = styled(Paper)`
  padding: 24px;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 30px;
`;

const ReportContainer = styled(Paper)`
  padding: 24px;
  width: 100%;
  max-width: 1200px;
  margin-top: 20px;
  margin-bottom: 50px;
`;

const Reports = () => {
  const navigate = useNavigate();
  const api = Api();

  // States para filtros e relatórios
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState("");
  const [dateRange, setDateRange] = useState("today");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [customDateRange, setCustomDateRange] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [viewType, setViewType] = useState("table");
  const [unitsFilter, setUnitsFilter] = useState("all");
  const [units, setUnits] = useState([]);

  // Lista de relatórios disponíveis
  const reportTypes = [
    { id: "financialSummary", label: "Resumo Financeiro", description: "Visão geral de entradas, saídas e saldo" },
    { id: "salesByPaymentMethod", label: "Vendas por Método de Pagamento", description: "Distribuição de vendas por forma de pagamento" },
    { id: "salesByUnit", label: "Vendas por Unidade", description: "Comparativo de vendas entre unidades" },
    { id: "dailySales", label: "Vendas Diárias", description: "Evolução das vendas ao longo do período" },
    { id: "ticketAverage", label: "Ticket Médio", description: "Valor médio por transação" },
    { id: "pendingPayments", label: "Pagamentos Pendentes", description: "Lista de valores a receber" },
    { id: "topProducts", label: "Produtos Mais Vendidos", description: "Ranking dos produtos com maior volume de vendas" },
    { id: "userPerformance", label: "Desempenho de Funcionários", description: "Análise de vendas por funcionário" },
    { id: "cashFlow", label: "Fluxo de Caixa", description: "Movimentações detalhadas de entradas e saídas" },
    { id: "expensesByCategory", label: "Despesas por Categoria", description: "Distribuição de gastos por categoria" },
    { id: "salesByHour", label: "Vendas por Hora", description: "Análise de horários de pico de vendas" },
    { id: "salesByDay", label: "Vendas por Dia da Semana", description: "Comparativo de desempenho por dia da semana" },
    { id: "profitMargin", label: "Margem de Lucro", description: "Análise de lucro em relação às vendas" },
    { id: "taxesSummary", label: "Resumo de Impostos", description: "Detalhamento de impostos por período" },
    { id: "unitComparison", label: "Comparativo entre Unidades", description: "Análise comparativa entre unidades por diversos indicadores" }
  ];

  // Opções de intervalo de datas
  const dateRangeOptions = [
    { id: "today", label: "Hoje" },
    { id: "yesterday", label: "Ontem" },
    { id: "thisWeek", label: "Esta Semana" },
    { id: "lastWeek", label: "Semana Passada" },
    { id: "thisMonth", label: "Este Mês" },
    { id: "lastMonth", label: "Mês Passado" },
    { id: "last30Days", label: "Últimos 30 Dias" },
    { id: "last90Days", label: "Últimos 90 Dias" },
    { id: "thisYear", label: "Este Ano" },
    { id: "custom", label: "Personalizado" }
  ];

  // Buscar unidades disponíveis
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const result = await api.allUnits();
        if (result.success) {
          setUnits(result.data.filter(unit => unit.ativo));
        }
      } catch (error) {
        console.error("Erro ao buscar unidades:", error);
      }
    };

    fetchUnits();
  }, []);

  // Atualiza o intervalo de datas quando o usuário seleciona uma opção
  useEffect(() => {
    if (dateRange !== "custom") {
      const today = new Date();
      
      switch (dateRange) {
        case "today":
          setStartDate(today);
          setEndDate(today);
          break;
        case "yesterday":
          const yesterday = subDays(today, 1);
          setStartDate(yesterday);
          setEndDate(yesterday);
          break;
        case "thisWeek":
          setStartDate(startOfWeek(today, { weekStartsOn: 0 }));
          setEndDate(today);
          break;
        case "lastWeek":
          const lastWeekStart = subDays(startOfWeek(today, { weekStartsOn: 0 }), 7);
          const lastWeekEnd = subDays(endOfWeek(today, { weekStartsOn: 0 }), 7);
          setStartDate(lastWeekStart);
          setEndDate(lastWeekEnd);
          break;
        case "thisMonth":
          setStartDate(startOfMonth(today));
          setEndDate(today);
          break;
        case "lastMonth":
          const lastMonth = subMonths(today, 1);
          setStartDate(startOfMonth(lastMonth));
          setEndDate(endOfMonth(lastMonth));
          break;
        case "last30Days":
          setStartDate(subDays(today, 30));
          setEndDate(today);
          break;
        case "last90Days":
          setStartDate(subDays(today, 90));
          setEndDate(today);
          break;
        case "thisYear":
          setStartDate(startOfYear(today));
          setEndDate(today);
          break;
        default:
          // Não faz nada para custom
          break;
      }
      
      setCustomDateRange(false);
    } else {
      setCustomDateRange(true);
    }
  }, [dateRange]);

  // Função para gerar o relatório
  const generateReport = async () => {
    if (!selectedReport) {
      Swal.fire({
        icon: "warning",
        title: "Selecione um Relatório",
        text: "Por favor, selecione o tipo de relatório que deseja gerar",
        showConfirmButton: true,
      });
      return;
    }

    setLoading(true);
    try {
      // Formatar datas para o formato ISO
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");
      
      // Aqui seria a chamada para a API para buscar os dados do relatório
      // Exemplo:
      // const response = await api.getReport(selectedReport, formattedStartDate, formattedEndDate, unitsFilter);
      
      // Como não temos a API implementada, vamos simular dados
      let mockData;
      
      switch (selectedReport) {
        case "financialSummary":
          mockData = {
            title: "Resumo Financeiro",
            period: `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`,
            summary: {
              totalRevenue: 125750.45,
              totalExpenses: 78320.15,
              netProfit: 47430.30,
              pendingReceivables: 12450.78
            },
            details: [
              { category: "Vendas em Dinheiro", value: 48250.80 },
              { category: "Vendas em Cartão", value: 62300.75 },
              { category: "Vendas em PIX", value: 15198.90 },
              { category: "Despesas Operacionais", value: -45230.15 },
              { category: "Despesas Administrativas", value: -18650.00 },
              { category: "Pagamento de Fornecedores", value: -14440.00 }
            ]
          };
          break;
          
        case "salesByPaymentMethod":
          mockData = {
            title: "Vendas por Método de Pagamento",
            period: `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`,
            data: [
              { method: "Dinheiro", value: 48250.80, percentage: 38.37 },
              { method: "Cartão de Crédito", value: 42150.75, percentage: 33.52 },
              { method: "Cartão de Débito", value: 20150.00, percentage: 16.03 },
              { method: "PIX", value: 15198.90, percentage: 12.08 }
            ],
            total: 125750.45
          };
          break;
          
        // Adicione outros casos para cada tipo de relatório
        // ...
        
        default:
          mockData = {
            title: reportTypes.find(r => r.id === selectedReport)?.label || "Relatório",
            period: `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`,
            message: "Dados de demonstração para este relatório"
          };
      }
      
      // Simula um atraso na resposta da API
      setTimeout(() => {
        setReportData(mockData);
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Erro ao Gerar Relatório",
        text: "Ocorreu um erro ao tentar gerar o relatório. Tente novamente mais tarde.",
        showConfirmButton: true,
      });
    }
  };

  // Função para exportar o relatório
  const exportReport = (format) => {
    if (!reportData) return;
    
    Swal.fire({
      icon: "success",
      title: `Exportando Relatório em formato ${format.toUpperCase()}`,
      text: "O relatório será gerado e disponibilizado para download em instantes.",
      showConfirmButton: false,
      timer: 1500
    });
  };

  // Função para imprimir o relatório
  const printReport = () => {
    if (!reportData) return;
    
    Swal.fire({
      icon: "info",
      title: "Preparando para Impressão",
      text: "O relatório será enviado para a impressora.",
      showConfirmButton: false,
      timer: 1500
    });
  };

  // Função para voltar ao painel principal
  const handleGoBack = () => {
    navigate("/");
  };

  // Renderiza o relatório com base no viewType (tabela, gráfico de barras, gráfico de pizza)
  const renderReport = () => {
    if (!reportData) return null;

    // Helper function to safely format a number
    const safeFormat = (value, decimals = 2) => {
      if (value === undefined || value === null) return '0.00';
      return Number(value).toFixed(decimals);
    };
    
    switch (selectedReport) {
      case "financialSummary":
        return (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>{reportData.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Período: {reportData.period}
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2, mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#e3f2fd", height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Total de Receitas</Typography>
                    <Typography variant="h5" color="primary">
                      R$ {safeFormat(reportData.summary?.totalRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#ffebee", height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Total de Despesas</Typography>
                    <Typography variant="h5" color="error">
                      R$ {safeFormat(reportData.summary?.totalExpenses)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#e8f5e9", height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Lucro Líquido</Typography>
                    <Typography variant="h5" color="success.main">
                      R$ {safeFormat(reportData.summary?.netProfit)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "#fff8e1", height: "100%" }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>Valores a Receber</Typography>
                    <Typography variant="h5" color="warning.main">
                      R$ {safeFormat(reportData.summary?.pendingReceivables)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Detalhamento</Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Categoria</TableCell>
                    <TableCell align="right">Valor (R$)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.details && reportData.details.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right" sx={{ 
                        color: (item.value < 0) ? 'error.main' : 'success.main',
                        fontWeight: 'medium'
                      }}>
                        {safeFormat(item.value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
        
      case "salesByPaymentMethod":
        return (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>{reportData.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Período: {reportData.period}
            </Typography>
            
            <Box sx={{ mt: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Total de Vendas: R$ {reportData.total ? safeFormat(reportData.total) : '0.00'}
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Método de Pagamento</TableCell>
                    <TableCell align="right">Valor (R$)</TableCell>
                    <TableCell align="right">Percentual</TableCell>
                    <TableCell align="right">Distribuição</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.data && reportData.data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.method}</TableCell>
                      <TableCell align="right">{safeFormat(item.value)}</TableCell>
                      <TableCell align="right">{safeFormat(item.percentage)}%</TableCell>
                      <TableCell align="right">
                        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              flexGrow: 1, 
                              bgcolor: index === 0 ? 'success.main' : 
                                      index === 1 ? 'primary.main' : 
                                      index === 2 ? 'warning.main' : 'secondary.main',
                              height: 10,
                              borderRadius: 5,
                              width: `${item.percentage || 0}%`,
                              maxWidth: '100%'
                            }} 
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {safeFormat(item.percentage, 1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        );
        
      // Adicione outros casos para cada tipo de relatório
      // ...
        
      default:
        return (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>{reportData.title}</Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Período: {reportData.period}
            </Typography>
            
            <Box sx={{ mt: 3, mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography align="center">
                {reportData.message || "Nenhum dado disponível para este relatório"}
              </Typography>
            </Box>
          </Paper>
        );
    }
  };

  return (
    <Container>
      {/* Botão Voltar */}
      <IconButton
        onClick={handleGoBack}
        sx={{ position: "absolute", top: 20, left: 20, color: "#f4b400" }}
      >
        <ArrowBackIosIcon />
      </IconButton>

      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Sistema de Relatórios
      </Typography>

      {/* Seção de Filtros */}
      <FilterSection elevation={3}>
        <Typography variant="h6" gutterBottom>
          Filtros e Opções
        </Typography>

        <Grid container spacing={3}>
          {/* Tipo de Relatório */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="report-type-label">Tipo de Relatório</InputLabel>
              <Select
                labelId="report-type-label"
                id="report-type"
                value={selectedReport}
                label="Tipo de Relatório"
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                <MenuItem value="" disabled>
                  Selecione um tipo de relatório
                </MenuItem>
                {reportTypes.map((report) => (
                  <MenuItem key={report.id} value={report.id}>
                    <Box>
                      <Typography variant="body1">{report.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {report.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Filtro de Unidades */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="units-filter-label">Filtrar por Unidade</InputLabel>
              <Select
                labelId="units-filter-label"
                id="units-filter"
                value={unitsFilter}
                label="Filtrar por Unidade"
                onChange={(e) => setUnitsFilter(e.target.value)}
              >
                <MenuItem value="all">Todas as Unidades</MenuItem>
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Período */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="date-range-label">Período</InputLabel>
              <Select
                labelId="date-range-label"
                id="date-range"
                value={dateRange}
                label="Período"
                onChange={(e) => setDateRange(e.target.value)}
              >
                {dateRangeOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Datas Personalizadas */}
          {customDateRange && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Inicial"
                    value={startDate}
                    onChange={(newDate) => setStartDate(newDate)}
                    slotProps={{ textField: { fullWidth: true } }}
                    maxDate={endDate}
                  />
                  <DatePicker
                    label="Data Final"
                    value={endDate}
                    onChange={(newDate) => setEndDate(newDate)}
                    slotProps={{ textField: { fullWidth: true } }}
                    minDate={startDate}
                    maxDate={new Date()}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
          )}

          {/* Botões de Ação */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={() => {
                  setSelectedReport("");
                  setDateRange("today");
                  setUnitsFilter("all");
                }}
              >
                Limpar Filtros
              </Button>
              <Button
                variant="contained"
                startIcon={<FilterAltIcon />}
                onClick={generateReport}
                disabled={loading}
                sx={{
                  backgroundColor: "#FEC32E",
                  "&:hover": {
                    backgroundColor: "#e6b32a"
                  }
                }}
              >
                {loading ? "Gerando..." : "Gerar Relatório"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </FilterSection>

      {/* Área do Relatório */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : reportData ? (
        <ReportContainer elevation={3}>
          {/* Cabeçalho do Relatório com Opções */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
            <Typography variant="h5">{reportData.title}</Typography>
            
            <Box sx={{ display: "flex", gap: 1 }}>
              {/* Botões de visualização */}
              <Box sx={{ 
                display: "flex", 
                border: "1px solid #e0e0e0", 
                borderRadius: 1,
                bgcolor: "background.paper"
              }}>
                <Tooltip title="Visualizar como Tabela">
                  <IconButton 
                    color={viewType === "table" ? "primary" : "default"}
                    onClick={() => setViewType("table")}
                  >
                    <TableChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Visualizar como Gráfico de Barras">
                  <IconButton 
                    color={viewType === "bar" ? "primary" : "default"}
                    onClick={() => setViewType("bar")}
                  >
                    <BarChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Visualizar como Gráfico de Pizza">
                  <IconButton 
                    color={viewType === "pie" ? "primary" : "default"}
                    onClick={() => setViewType("pie")}
                  >
                    <PieChartIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Botões de exportação */}
              <Tooltip title="Exportar como PDF">
                <IconButton onClick={() => exportReport("pdf")} sx={{ color: "#f44336" }}>
                  <PictureAsPdfIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exportar como CSV">
                <IconButton onClick={() => exportReport("csv")} sx={{ color: "#4caf50" }}>
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimir">
                <IconButton onClick={printReport}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Atualizar Relatório">
                <IconButton onClick={generateReport} sx={{ color: "#2196f3" }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Chip 
              label={`Período: ${format(startDate, 'dd/MM/yyyy')} a ${format(endDate, 'dd/MM/yyyy')}`} 
              color="primary" 
              variant="outlined"
            />
            {unitsFilter !== "all" && (
              <Chip 
                label={`Unidade: ${units.find(u => u.id === unitsFilter)?.nome || unitsFilter}`} 
                color="secondary" 
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Conteúdo do Relatório */}
          {renderReport()}
        </ReportContainer>
      ) : null}
    </Container>
  );
};

export default Reports;