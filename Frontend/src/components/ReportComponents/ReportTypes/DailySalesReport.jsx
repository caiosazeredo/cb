// src/components/ReportComponents/ReportTypes/DailySalesReport.jsx
import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export const DailySalesReport = ({ data, viewType }) => {
  // Se não houver dados ou dados insuficientes
  if (!data || !data.salesData || data.salesData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Dados insuficientes para gerar o relatório de Vendas Diárias
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

  // Adaptar os dados para os gráficos e tabelas
  const salesData = data.salesData || [];
  
  // Estatísticas resumidas
  const totalSales = data.totalSales || salesData.reduce((total, day) => total + day.value, 0);
  const totalQuantity = data.totalQuantity || salesData.reduce((total, day) => total + day.quantity, 0);
  const bestDay = data.bestDay || salesData.reduce((best, day) => day.value > best.value ? day : best, salesData[0] || { value: 0 });
  const avgTicket = totalQuantity > 0 ? totalSales / totalQuantity : 0;

  // Renderizar baseado no tipo de visualização
  if (viewType === "bar") {
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Vendas</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(totalSales)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Quantidade Vendida</Typography>
                    <Typography variant="h5" color="primary">
                      {totalQuantity}
                    </Typography>
                  </Box>
                  <ShoppingCartIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Melhor Dia</Typography>
                    <Typography variant="h6" color="success.main">
                      {bestDay.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(bestDay.value)}
                    </Typography>
                  </Box>
                  <StorefrontIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Ticket Médio</Typography>
                    <Typography variant="h5" color="info.main">
                      {formatCurrency(avgTicket)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>Vendas por Dia</Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip 
                formatter={(value, name) => {
                  if (name === "value") return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Vendas" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  } else if (viewType === "pie") {
    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Vendas</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(totalSales)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Quantidade Vendida</Typography>
                    <Typography variant="h5" color="primary">
                      {totalQuantity}
                    </Typography>
                  </Box>
                  <ShoppingCartIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Melhor Dia</Typography>
                    <Typography variant="h6" color="success.main">
                      {bestDay.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(bestDay.value)}
                    </Typography>
                  </Box>
                  <StorefrontIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Ticket Médio</Typography>
                    <Typography variant="h5" color="info.main">
                      {formatCurrency(avgTicket)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>Tendência de Vendas</Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip 
                formatter={(value, name) => {
                  if (name === "value") return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8884d8" 
                name="Vendas" 
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
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
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Vendas</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(totalSales)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Quantidade Vendida</Typography>
                    <Typography variant="h5" color="primary">
                      {totalQuantity}
                    </Typography>
                  </Box>
                  <ShoppingCartIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Melhor Dia</Typography>
                    <Typography variant="h6" color="success.main">
                      {bestDay.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(bestDay.value)}
                    </Typography>
                  </Box>
                  <StorefrontIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Ticket Médio</Typography>
                    <Typography variant="h5" color="info.main">
                      {formatCurrency(avgTicket)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>Detalhe de Vendas por Dia</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell align="right">Valor Total</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Ticket Médio</TableCell>
                <TableCell align="right">% do Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.map((day, index) => {
                const ticketMedio = day.quantity > 0 ? day.value / day.quantity : 0;
                const percentualTotal = totalSales > 0 ? (day.value / totalSales) * 100 : 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell>{day.date}</TableCell>
                    <TableCell align="right">{formatCurrency(day.value)}</TableCell>
                    <TableCell align="right">{day.quantity}</TableCell>
                    <TableCell align="right">{formatCurrency(ticketMedio)}</TableCell>
                    <TableCell align="right">{percentualTotal.toFixed(2)}%</TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell align="right"><strong>{formatCurrency(totalSales)}</strong></TableCell>
                <TableCell align="right"><strong>{totalQuantity}</strong></TableCell>
                <TableCell align="right"><strong>{formatCurrency(avgTicket)}</strong></TableCell>
                <TableCell align="right"><strong>100.00%</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
};