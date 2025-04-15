// src/components/ReportComponents/ReportTypes/SalesByPaymentMethodReport.jsx
// Componente para o relatório de vendas por método de pagamento
import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress
} from "@mui/material";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export const SalesByPaymentMethodReport = ({ data, viewType }) => {
  if (!data || !data.data || data.data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Dados insuficientes para gerar o relatório
        </Typography>
      </Box>
    );
  }

  // Formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Nomes mais amigáveis para os métodos de pagamento
  const getMethodName = (method) => {
    const methodNames = {
      dinheiro: "Dinheiro",
      credito: "Crédito",
      debito: "Débito",
      pix: "PIX",
      ticket: "Ticket"
    };
    return methodNames[method] || method;
  };

  // Preparar dados para gráficos
  const chartData = data.data.map(item => ({
    name: getMethodName(item.metodo),
    valor: item.valor,
    percentual: item.percentual
  }));

  // Cores para gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9370DB'];

  // Renderizar baseado no tipo de visualização
  if (viewType === "bar") {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Total de Vendas: {formatCurrency(data.totalGeral)}
        </Typography>

        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip
                formatter={(value, name) => {
                  if (name === "valor") return formatCurrency(value);
                  if (name === "percentual") return `${value.toFixed(2)}%`;
                  return value;
                }}
              />
              <Legend />
              <Bar
                dataKey="valor"
                fill="#8884d8"
                name="Valor"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  } else if (viewType === "pie") {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Total de Vendas: {formatCurrency(data.totalGeral)}
        </Typography>

        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="valor"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  } else {
    // Visualização de tabela (padrão)
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Total de Vendas: {formatCurrency(data.totalGeral)}
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Método de Pagamento</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell align="right">Percentual</TableCell>
                <TableCell align="right">Distribuição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{getMethodName(item.metodo)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.valor)}</TableCell>
                  <TableCell align="right">{item.percentual.toFixed(2)}%</TableCell>
                  <TableCell align="right" sx={{ width: "30%" }}>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentual}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: "#f5f5f5",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: COLORS[index % COLORS.length]
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(data.totalGeral)}</strong>
                </TableCell>
                <TableCell align="right">100%</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
};