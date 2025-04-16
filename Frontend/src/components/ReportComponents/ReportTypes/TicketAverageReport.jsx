// src/components/ReportComponents/ReportTypes/TicketAverageReport.jsx
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
  Card,
  CardContent,
  Grid,
  Chip,
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
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

export const TicketAverageReport = ({ data, viewType }) => {
  // Verifica se há dados suficientes para renderizar o relatório
  if (!data || !data.ticketData || data.ticketData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Dados insuficientes para gerar o relatório de Ticket Médio
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

  // Vamos usar uma versão simulada de dados para o exemplo
  // Em um cenário real, esses dados viriam do backend
  const realData = data.ticketData || [
    { 
      period: "Janeiro", 
      ticketValue: 75.35, 
      totalSales: 5430, 
      quantity: 72, 
      previousTicket: 68.20 
    },
    { 
      period: "Fevereiro", 
      ticketValue: 82.10, 
      totalSales: 6972, 
      quantity: 85, 
      previousTicket: 75.35 
    },
    { 
      period: "Março", 
      ticketValue: 79.60, 
      totalSales: 7642, 
      quantity: 96, 
      previousTicket: 82.10 
    },
    { 
      period: "Abril", 
      ticketValue: 85.92, 
      totalSales: 8420, 
      quantity: 98, 
      previousTicket: 79.60 
    },
  ];

  // Dados para diferentes visualizações
  const chartData = realData.map(item => ({
    name: item.period,
    ticketValue: item.ticketValue,
    previousValue: item.previousTicket || 0,
    change: item.previousTicket ? ((item.ticketValue - item.previousTicket) / item.previousTicket) * 100 : 0
  }));

  // Dados por unidade (demonstração)
  const unitData = data.unitData || [
    { unit: "Unidade Centro", ticketValue: 87.50, sales: 12500, quantity: 143 },
    { unit: "Unidade Norte", ticketValue: 76.20, sales: 9830, quantity: 129 },
    { unit: "Unidade Sul", ticketValue: 92.15, sales: 14600, quantity: 158 },
    { unit: "Unidade Leste", ticketValue: 83.70, sales: 10880, quantity: 130 },
  ];

  // Estatísticas gerais
  const avgTicket = data.avgTicket || realData.reduce((sum, item) => sum + item.ticketValue, 0) / realData.length;
  const maxTicket = data.maxTicket || Math.max(...realData.map(item => item.ticketValue));
  const minTicket = data.minTicket || Math.min(...realData.map(item => item.ticketValue));
  const ticketTrend = data.ticketTrend || ((realData[realData.length - 1].ticketValue - realData[0].ticketValue) / realData[0].ticketValue) * 100;

  // Cores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9370DB'];

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
                    <Typography variant="subtitle2" gutterBottom>Ticket Médio Geral</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(avgTicket)}
                    </Typography>
                  </Box>
                  <LocalOfferIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Ticket Máximo</Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(maxTicket)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Ticket Mínimo</Typography>
                    <Typography variant="h6" color="warning.main">
                      {formatCurrency(minTicket)}
                    </Typography>
                  </Box>
                  <TrendingDownIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Tendência de Crescimento</Typography>
                    <Typography variant="h6" color={ticketTrend >= 0 ? "success.main" : "error.main"}>
                      {ticketTrend >= 0 ? "+" : ""}{ticketTrend.toFixed(2)}%
                    </Typography>
                  </Box>
                  {ticketTrend >= 0 ? (
                    <TrendingUpIcon color="success" />
                  ) : (
                    <TrendingDownIcon color="error" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Evolução do Ticket Médio
        </Typography>
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip
                formatter={(value, name) => {
                  if (name === "ticketValue" || name === "previousValue") 
                    return formatCurrency(value);
                  if (name === "change") 
                    return `${value.toFixed(2)}%`;
                  return value;
                }}
              />
              <Legend />
              <Bar
                dataKey="ticketValue"
                fill="#8884d8"
                name="Ticket Médio"
              />
              <Bar
                dataKey="previousValue"
                fill="#82ca9d"
                name="Período Anterior"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Typography variant="h6" gutterBottom>
          Ticket Médio por Unidade
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={unitData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="unit" />
              <YAxis />
              <RechartsTooltip
                formatter={(value, name) => {
                  if (name === "ticketValue") 
                    return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Bar
                dataKey="ticketValue"
                fill="#ffc658"
                name="Ticket Médio"
              />
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
                    <Typography variant="subtitle2" gutterBottom>Ticket Médio Geral</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(avgTicket)}
                    </Typography>
                  </Box>
                  <LocalOfferIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Ticket Máximo</Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(maxTicket)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Ticket Mínimo</Typography>
                    <Typography variant="h6" color="warning.main">
                      {formatCurrency(minTicket)}
                    </Typography>
                  </Box>
                  <TrendingDownIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Tendência de Crescimento</Typography>
                    <Typography variant="h6" color={ticketTrend >= 0 ? "success.main" : "error.main"}>
                      {ticketTrend >= 0 ? "+" : ""}{ticketTrend.toFixed(2)}%
                    </Typography>
                  </Box>
                  {ticketTrend >= 0 ? (
                    <TrendingUpIcon color="success" />
                  ) : (
                    <TrendingDownIcon color="error" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Distribuição do Ticket Médio por Unidade
        </Typography>
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={unitData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={140}
                fill="#8884d8"
                dataKey="ticketValue"
                nameKey="unit"
                label={({ unit, percent }) => `${unit}: ${(percent * 100).toFixed(1)}%`}
              >
                {unitData.map((entry, index) => (
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

        <Typography variant="h6" gutterBottom>
          Evolução do Ticket Médio ao Longo do Tempo
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip
                formatter={(value, name) => {
                  if (name === "ticketValue") 
                    return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ticketValue"
                stroke="#8884d8"
                name="Ticket Médio"
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
                    <Typography variant="subtitle2" gutterBottom>Ticket Médio Geral</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(avgTicket)}
                    </Typography>
                  </Box>
                  <LocalOfferIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Ticket Máximo</Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(maxTicket)}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Ticket Mínimo</Typography>
                    <Typography variant="h6" color="warning.main">
                      {formatCurrency(minTicket)}
                    </Typography>
                  </Box>
                  <TrendingDownIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Tendência de Crescimento</Typography>
                    <Typography variant="h6" color={ticketTrend >= 0 ? "success.main" : "error.main"}>
                      {ticketTrend >= 0 ? "+" : ""}{ticketTrend.toFixed(2)}%
                    </Typography>
                  </Box>
                  {ticketTrend >= 0 ? (
                    <TrendingUpIcon color="success" />
                  ) : (
                    <TrendingDownIcon color="error" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Evolução do Ticket Médio por Período
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Período</TableCell>
                <TableCell align="right">Ticket Médio</TableCell>
                <TableCell align="right">Valor Total</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Variação</TableCell>
                <TableCell align="right">Tendência</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {realData.map((item, index) => {
                const change = item.previousTicket 
                  ? ((item.ticketValue - item.previousTicket) / item.previousTicket) * 100 
                  : 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell>{item.period}</TableCell>
                    <TableCell align="right">{formatCurrency(item.ticketValue)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.totalSales)}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">
                      {item.previousTicket ? (
                        <Typography
                          sx={{
                            color: change >= 0 ? "success.main" : "error.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end"
                          }}
                        >
                          {change >= 0 ? (
                            <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                          ) : (
                            <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                          )}
                          {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                        </Typography>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <LinearProgress
                        variant="determinate"
                        value={50 + change}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#f5f5f5",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: change >= 0 ? "success.main" : "error.main"
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom>
          Ticket Médio por Unidade
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Unidade</TableCell>
                <TableCell align="right">Ticket Médio</TableCell>
                <TableCell align="right">Valor Total</TableCell>
                <TableCell align="right">Quantidade</TableCell>
                <TableCell align="right">Diferença da Média</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unitData.map((unit, index) => {
                const diffFromAvg = ((unit.ticketValue - avgTicket) / avgTicket) * 100;
                
                return (
                  <TableRow key={index}>
                    <TableCell>{unit.unit}</TableCell>
                    <TableCell align="right">{formatCurrency(unit.ticketValue)}</TableCell>
                    <TableCell align="right">{formatCurrency(unit.sales)}</TableCell>
                    <TableCell align="right">{unit.quantity}</TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          color: diffFromAvg >= 0 ? "success.main" : "error.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end"
                        }}
                      >
                        {diffFromAvg >= 0 ? (
                          <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                        ) : (
                          <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                        )}
                        {diffFromAvg >= 0 ? "+" : ""}{diffFromAvg.toFixed(2)}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
};