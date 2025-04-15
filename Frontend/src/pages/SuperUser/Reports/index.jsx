// src/pages/SuperUser/Reports/index.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Paper,
  Alert
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Swal from "sweetalert2";

// Import components
import { ReportFilters } from "../../../components/ReportComponents/ReportFilters";
import { ReportViewer } from "../../../components/ReportComponents/ReportViewer";

// Import services and utilities
import { ReportService } from "../../../services/ReportService";
import { exportPDF, exportCSV } from "../../../utils/exportUtils";

// Import styled components
import { Container } from "./styles";

const Reports = () => {
  const navigate = useNavigate();
  
  // States
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState("");
  const [reportParams, setReportParams] = useState(null);
  
  // Report types
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
    { id: "unitComparison", label: "Comparativo entre Unidades", description: "Análise comparativa entre unidades por diversos indicadores" },
    { id: "systemLogs", label: "Logs do Sistema", description: "Registro de atividades no sistema" },
    { id: "loginHistory", label: "Histórico de Login", description: "Registro de acessos ao sistema" }
  ];
  
  // Generate report based on filters
  const handleGenerateReport = async (params) => {
    try {
      setLoading(true);
      setError(null);
      setReportType(params.reportType);
      setReportParams(params);
      
      // Generate different reports based on type
      let data;
      switch (params.reportType) {
        case "financialSummary":
          data = await ReportService.generateFinancialSummary(params);
          break;
        case "salesByPaymentMethod":
          data = await ReportService.generateSalesByPaymentMethod(params);
          break;
        case "salesByUnit":
          data = await ReportService.generateSalesByUnit(params);
          break;
        // Add other report types as they are implemented
        case "systemLogs":
          data = await ReportService.fetchSystemLogs(params);
          break;
        default:
          // For demonstration purposes, create a placeholder response for missing reports
          data = {
            period: {
              startDate: new Date(),
              endDate: new Date()
            },
            message: `Relatório de ${params.reportType} está em desenvolvimento.`
          };
      }
      
      // If unitId is provided, fetch unit name
      if (params.unitId && params.unitId !== "all") {
        try {
          const units = await ReportService.fetchUnits();
          const unit = units.find(u => u.id === params.unitId);
          if (unit) {
            data.unitId = params.unitId;
            data.unitName = unit.nome;
          }
        } catch (error) {
          console.error("Erro ao buscar nome da unidade:", error);
        }
      }
      
      setReportData(data);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setError(`Erro ao gerar relatório: ${error.message}`);
      Swal.fire({
        icon: "error",
        title: "Erro ao gerar relatório",
        text: error.message || "Ocorreu um erro ao processar os dados.",
        showConfirmButton: true
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh current report
  const handleRefreshReport = () => {
    if (reportParams) {
      handleGenerateReport(reportParams);
    }
  };
  
  // Export report
  const handleExportReport = (format) => {
    if (!reportData) return;
    
    // Get appropriate title for the file
    const reportTitle = reportTypes.find(r => r.id === reportType)?.label || "Relatório";
    const fileName = `${reportTitle}_${new Date().toISOString().split('T')[0]}`;
    
    try {
      if (format === "pdf") {
        exportPDF(reportData, reportType, fileName);
      } else if (format === "csv") {
        exportCSV(reportData, reportType, fileName);
      }
      
      Swal.fire({
        icon: "success",
        title: `Relatório exportado como ${format.toUpperCase()}`,
        text: "O arquivo foi gerado com sucesso.",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error(`Erro ao exportar como ${format}:`, error);
      Swal.fire({
        icon: "error",
        title: `Erro na exportação`,
        text: error.message || "Não foi possível exportar o relatório.",
        showConfirmButton: true
      });
    }
  };
  
  // Print report
  const handlePrintReport = () => {
    if (!reportData) return;
    
    window.print();
  };
  
  // Return to home
  const handleGoBack = () => {
    navigate("/");
  };
  
  return (
    <Container>
      {/* Back button */}
      <IconButton
        onClick={handleGoBack}
        sx={{ position: "absolute", top: 20, left: 20, color: "#f4b400" }}
      >
        <ArrowBackIosIcon />
      </IconButton>

      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Sistema de Relatórios
      </Typography>

      {/* Filters section */}
      <ReportFilters
        onGenerateReport={handleGenerateReport}
        loading={loading}
        reportTypes={reportTypes}
        defaultPeriodType="month"
      />

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mt: 3, width: "100%", maxWidth: 1200 }}>
          {error}
        </Alert>
      )}

      {/* Report content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={60} />
        </Box>
      ) : reportData ? (
        <ReportViewer
          reportData={reportData}
          reportType={reportType}
          loading={loading}
          onRefresh={handleRefreshReport}
          onExport={handleExportReport}
          onPrint={handlePrintReport}
        />
      ) : null}
    </Container>
  );
};

export default Reports;