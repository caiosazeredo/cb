// src/components/ReportComponents/ReportTypes/FinancialSummaryReport.jsx
// Componente para o relatório de resumo financeiro
import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
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
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

export const FinancialSummaryReport = ({ data, viewType }) => {
  if (!data || !data.totals) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Dados insuficientes para gerar o relatório
        </Typography>
      </Box>
    );
  }

  const { totals } = data;
  
  // Formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Dados para gráfico de barras
  const barChartData = [
    { name: "Receitas", valor: totals.receitas },
    { name: "Despesas", valor: Math.abs(totals.despesas) },
    { name: "Lucro", valor: totals.lucro > 0 ? totals.lucro : 0 },
    { name: "Valores Pendentes", valor: totals.valoresPendentes }
  ];

  // Dados para gráfico de pizza (métodos de pagamento)
  const pieChartData = Object.entries(totals.porFormaPagamento).map(([key, value]) => ({
    name: key === "dinheiro" ? "Dinheiro" :
          key === "credito" ? "Crédito" :
          key === "debito" ? "Débito" :
          key === "pix" ? "PIX" :
          key === "ticket" ? "Ticket" : key,
    value
  })).filter(item => item.value > 0);

  // Cores para gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9370DB'];

  // Renderizar baseado no tipo de visualização
  if (viewType === "bar") {
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e3f2fd", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Receitas</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(totals.receitas)}
                    </Typography>
                  </Box>
                  <AttachMoneyIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#ffebee", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Despesas</Typography>
                    <Typography variant="h5" color="error">
                      {formatCurrency(totals.despesas)}
                    </Typography>
                  </Box>
                  <MoneyOffIcon color="error" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e8f5e9", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Lucro</Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(totals.lucro)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#fff8e1", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Valores Pendentes</Typography>
                    <Typography variant="h5" color="warning.main">
                      {formatCurrency(totals.valoresPendentes)}
                    </Typography>
                  </Box>
                  <HourglassEmptyIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>Resumo Financeiro</Typography>
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip 
                formatter={(value) => formatCurrency(value)} 
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

        <Typography variant="h6" gutterBottom>Por Método de Pagamento</Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {pieChartData.map((entry, index) => (
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
  } else if (viewType === "pie") {
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e3f2fd", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Receitas</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(totals.receitas)}
                    </Typography>
                  </Box>
                  <AttachMoneyIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#ffebee", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Despesas</Typography>
                    <Typography variant="h5" color="error">
                      {formatCurrency(totals.despesas)}
                    </Typography>
                  </Box>
                  <MoneyOffIcon color="error" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e8f5e9", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Lucro</Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(totals.lucro)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#fff8e1", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Valores Pendentes</Typography>
                    <Typography variant="h5" color="warning.main">
                      {formatCurrency(totals.valoresPendentes)}
                    </Typography>
                  </Box>
                  <HourglassEmptyIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>Por Método de Pagamento</Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {pieChartData.map((entry, index) => (
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e3f2fd", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Receitas</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(totals.receitas)}
                    </Typography>
                  </Box>
                  <AttachMoneyIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#ffebee", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Despesas</Typography>
                    <Typography variant="h5" color="error">
                      {formatCurrency(totals.despesas)}
                    </Typography>
                  </Box>
                  <MoneyOffIcon color="error" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#e8f5e9", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Lucro</Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(totals.lucro)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "#fff8e1", height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Valores Pendentes</Typography>
                    <Typography variant="h5" color="warning.main">
                      {formatCurrency(totals.valoresPendentes)}
                    </Typography>
                  </Box>
                  <HourglassEmptyIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>Por Método de Pagamento</Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Método de Pagamento</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell align="right">Percentual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(totals.porFormaPagamento).map(([key, value]) => {
                const total = Object.values(totals.porFormaPagamento).reduce((a, b) => a + b, 0);
                const percentual = total > 0 ? (value / total) * 100 : 0;
                
                // Pular valores zerados
                if (value === 0) return null;
                
                return (
                  <TableRow key={key}>
                    <TableCell>
                      {key === "dinheiro" ? "Dinheiro" :
                       key === "credito" ? "Crédito" :
                       key === "debito" ? "Débito" :
                       key === "pix" ? "PIX" :
                       key === "ticket" ? "Ticket" : key}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(value)}</TableCell>
                    <TableCell align="right">{percentual.toFixed(2)}%</TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell align="right">
                  <strong>
                    {formatCurrency(Object.values(totals.porFormaPagamento).reduce((a, b) => a + b, 0))}
                  </strong>
                </TableCell>
                <TableCell align="right">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom>Movimentações Recentes</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Forma</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.movimentos && data.movimentos.slice(0, 10).map((movimento) => (
                <TableRow key={movimento.id}>
                  <TableCell>
                    {new Date(movimento.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {movimento.tipo === "entrada" ? "Entrada" : "Saída"}
                  </TableCell>
                  <TableCell>
                    {movimento.forma === "dinheiro" ? "Dinheiro" :
                     movimento.forma === "credito" ? "Crédito" :
                     movimento.forma === "debito" ? "Débito" :
                     movimento.forma === "pix" ? "PIX" :
                     movimento.forma === "ticket" ? "Ticket" : movimento.forma}
                  </TableCell>
                  <TableCell>{movimento.descricao || "--"}</TableCell>
                  <TableCell align="right">
                    <Typography
                      sx={{
                        color: movimento.tipo === "entrada" ? "success.main" : "error.main",
                        fontWeight: "medium"
                      }}
                    >
                      {formatCurrency(movimento.valor)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {(!data.movimentos || data.movimentos.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhuma movimentação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
};
