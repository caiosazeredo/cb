// src/components/ReportComponents/ReportViewer.jsx
// Componente para visualização de relatórios
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import { format } from "date-fns";

// Importar componentes específicos de relatório
import { FinancialSummaryReport } from "./ReportTypes/FinancialSummaryReport";
import { SalesByPaymentMethodReport } from "./ReportTypes/SalesByPaymentMethodReport";
import { SalesByUnitReport } from "./ReportTypes/SalesByUnitReport";
import { DailySalesReport } from "./ReportTypes/DailySalesReport";
import { TicketAverageReport } from "./ReportTypes/TicketAverageReport";
import { PendingPaymentsReport } from "./ReportTypes/PendingPaymentsReport";
import { TopProductsReport } from "./ReportTypes/TopProductsReport";
import { UserPerformanceReport } from "./ReportTypes/UserPerformanceReport";
import { CashFlowReport } from "./ReportTypes/CashFlowReport";
import { ExpensesByCategoryReport } from "./ReportTypes/ExpensesByCategoryReport";
import { SalesByHourReport } from "./ReportTypes/SalesByHourReport";
import { SalesByDayReport } from "./ReportTypes/SalesByDayReport";
import { ProfitMarginReport } from "./ReportTypes/ProfitMarginReport";
import { TaxesSummaryReport } from "./ReportTypes/TaxesSummaryReport";
import { UnitComparisonReport } from "./ReportTypes/UnitComparisonReport";
import { SystemLogsReport } from "./ReportTypes/SystemLogsReport";
import { LoginHistoryReport } from "./ReportTypes/LoginHistoryReport";

/**
 * Componente para visualização de relatórios
 */
export const ReportViewer = ({ 
  reportData, 
  reportType, 
  loading, 
  onRefresh,
  onExport,
  onPrint
}) => {
  const [viewType, setViewType] = useState("table");

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!reportData) {
    return null;
  }

  // Função para renderizar o relatório adequado
  const renderReport = () => {
    switch (reportType) {
      case "financialSummary":
        return <FinancialSummaryReport data={reportData} viewType={viewType} />;
      case "salesByPaymentMethod":
        return <SalesByPaymentMethodReport data={reportData} viewType={viewType} />;
      case "salesByUnit":
        return <SalesByUnitReport data={reportData} viewType={viewType} />;
      case "dailySales":
        return <DailySalesReport data={reportData} viewType={viewType} />;
      case "ticketAverage":
        return <TicketAverageReport data={reportData} viewType={viewType} />;
      case "pendingPayments":
        return <PendingPaymentsReport data={reportData} viewType={viewType} />;
      case "topProducts":
        return <TopProductsReport data={reportData} viewType={viewType} />;
      case "userPerformance":
        return <UserPerformanceReport data={reportData} viewType={viewType} />;
      case "cashFlow":
        return <CashFlowReport data={reportData} viewType={viewType} />;
      case "expensesByCategory":
        return <ExpensesByCategoryReport data={reportData} viewType={viewType} />;
      case "salesByHour":
        return <SalesByHourReport data={reportData} viewType={viewType} />;
      case "salesByDay":
        return <SalesByDayReport data={reportData} viewType={viewType} />;
      case "profitMargin":
        return <ProfitMarginReport data={reportData} viewType={viewType} />;
      case "taxesSummary":
        return <TaxesSummaryReport data={reportData} viewType={viewType} />;
      case "unitComparison":
        return <UnitComparisonReport data={reportData} viewType={viewType} />;
      case "systemLogs":
        return <SystemLogsReport data={reportData} viewType={viewType} />;
      case "loginHistory":
        return <LoginHistoryReport data={reportData} viewType={viewType} />;
      default:
        return (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              Relatório não disponível
            </Typography>
          </Box>
        );
    }
  };

  // Obter título do relatório
  const getReportTitle = () => {
    switch (reportType) {
      case "financialSummary":
        return "Resumo Financeiro";
      case "salesByPaymentMethod":
        return "Vendas por Método de Pagamento";
      case "salesByUnit":
        return "Vendas por Unidade";
      case "dailySales":
        return "Vendas Diárias";
      case "ticketAverage":
        return "Ticket Médio";
      case "pendingPayments":
        return "Pagamentos Pendentes";
      case "topProducts":
        return "Produtos Mais Vendidos";
      case "userPerformance":
        return "Desempenho de Funcionários";
      case "cashFlow":
        return "Fluxo de Caixa";
      case "expensesByCategory":
        return "Despesas por Categoria";
      case "salesByHour":
        return "Vendas por Hora";
      case "salesByDay":
        return "Vendas por Dia da Semana";
      case "profitMargin":
        return "Margem de Lucro";
      case "taxesSummary":
        return "Resumo de Impostos";
      case "unitComparison":
        return "Comparativo entre Unidades";
      case "systemLogs":
        return "Logs do Sistema";
      case "loginHistory":
        return "Histórico de Login";
      default:
        return "Relatório";
    }
  };

  const period = reportData.period || {};
  const startDate = period.startDate ? format(new Date(period.startDate), 'dd/MM/yyyy') : "";
  const endDate = period.endDate ? format(new Date(period.endDate), 'dd/MM/yyyy') : "";

  return (
    <Paper sx={{ p: 3, width: "100%", mt: 3 }}>
      {/* Cabeçalho do relatório */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">{getReportTitle()}</Typography>

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
            <IconButton 
              onClick={() => onExport && onExport("pdf")} 
              sx={{ color: "#f44336" }}
            >
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar como CSV">
            <IconButton 
              onClick={() => onExport && onExport("csv")} 
              sx={{ color: "#4caf50" }}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir">
            <IconButton onClick={() => onPrint && onPrint()}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Atualizar Relatório">
            <IconButton 
              onClick={() => onRefresh && onRefresh()} 
              sx={{ color: "#2196f3" }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Período do relatório */}
      <Box sx={{ my: 2 }}>
        <Chip 
          label={`Período: ${startDate} a ${endDate}`} 
          color="primary" 
          variant="outlined" 
        />
        
        {reportData.unitId && reportData.unitName && (
          <Chip 
            label={`Unidade: ${reportData.unitName}`} 
            color="secondary" 
            variant="outlined"
            sx={{ ml: 1 }}
          />
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Conteúdo do relatório */}
      <Box sx={{ mt: 3 }}>
        {renderReport()}
      </Box>
    </Paper>
  );
};