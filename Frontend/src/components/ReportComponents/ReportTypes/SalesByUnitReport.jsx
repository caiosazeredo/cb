// src/components/ReportComponents/ReportTypes/SalesByUnitReport.jsx
import React, { useState } from "react";
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
  LinearProgress,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
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

export const SalesByUnitReport = ({ data, viewType }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("totalVendas");
  const [sortDirection, setSortDirection] = useState("desc");

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

  // Filtragem e ordenação dos dados
  const filteredUnits = data.data.filter(unit => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return unit.nomeUnidade.toLowerCase().includes(query);
    }
    return true;
  }).sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    if (sortField === "nomeUnidade") {
      return direction * a.nomeUnidade.localeCompare(b.nomeUnidade);
    }
    return direction * (a[sortField] - b[sortField]);
  });

  // Alternar ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Dados para gráficos
  const chartData = filteredUnits.map(unit => ({
    name: unit.nomeUnidade,
    value: unit.totalVendas,
    quantidade: unit.quantidadeVendas,
    percentual: unit.percentual
  }));

  // Dados para gráfico de ticket médio
  const ticketMedioData = filteredUnits.map(unit => ({
    name: unit.nomeUnidade,
    value: unit.quantidadeVendas > 0 ? unit.totalVendas / unit.quantidadeVendas : 0
  }));

  // Estatísticas gerais
  const topUnit = [...filteredUnits].sort((a, b) => b.totalVendas - a.totalVendas)[0];
  const lowUnit = [...filteredUnits].sort((a, b) => a.totalVendas - b.totalVendas)[0];
  const totalUnidades = filteredUnits.length;
  const mediaVendas = data.totalGeral / totalUnidades;

  // Cores para gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9370DB', '#4B0082', '#B22222'];

  // Renderização baseada no tipo de visualização
  if (viewType === "bar") {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar unidade"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Vendas</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(data.totalGeral)}
                    </Typography>
                  </Box>
                  <StorefrontIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Unidade Top</Typography>
                    <Typography variant="h6" color="success.main">
                      {topUnit?.nomeUnidade}
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(topUnit?.totalVendas || 0)}
                    </Typography>
                  </Box>
                  <ArrowUpwardIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Unidade com Menor Venda</Typography>
                    <Typography variant="h6" color="warning.main">
                      {lowUnit?.nomeUnidade}
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(lowUnit?.totalVendas || 0)}
                    </Typography>
                  </Box>
                  <ArrowDownwardIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Média por Unidade</Typography>
                    <Typography variant="h5" color="info.main">
                      {formatCurrency(mediaVendas)}
                    </Typography>
                  </Box>
                  <StorefrontIcon color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Total de Vendas por Unidade
        </Typography>
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip
                formatter={(value, name) => {
                  if (name === "value") return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#8884d8"
                name="Valor de Vendas"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Typography variant="h6" gutterBottom>
          Quantidade de Vendas por Unidade
        </Typography>
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar
                dataKey="quantidade"
                fill="#82ca9d"
                name="Quantidade de Vendas"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Typography variant="h6" gutterBottom>
          Ticket Médio por Unidade
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ticketMedioData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar
                dataKey="value"
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
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar unidade"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Vendas</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(data.totalGeral)}
                    </Typography>
                  </Box>
                  <StorefrontIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Unidade Top</Typography>
                    <Typography variant="h6" color="success.main">
                      {topUnit?.nomeUnidade}
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(topUnit?.totalVendas || 0)}
                    </Typography>
                  </Box>
                  <ArrowUpwardIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Unidade com Menor Venda</Typography>
                    <Typography variant="h6" color="warning.main">
                      {lowUnit?.nomeUnidade}
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(lowUnit?.totalVendas || 0)}
                    </Typography>
                  </Box>
                  <ArrowDownwardIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Média por Unidade</Typography>
                    <Typography variant="h5" color="info.main">
                      {formatCurrency(mediaVendas)}
                    </Typography>
                  </Box>
                  <StorefrontIcon color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Distribuição de Vendas por Unidade
        </Typography>
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={140}
                fill="#8884d8"
                dataKey="value"
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

        <Typography variant="h6" gutterBottom>
          Distribuição de Quantidade de Vendas
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={140}
                fill="#8884d8"
                dataKey="quantidade"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  } else {
    // Visualização padrão (tabela)
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar unidade"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Vendas</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(data.totalGeral)}
                    </Typography>
                  </Box>
                  <StorefrontIcon color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Unidade Top</Typography>
                    <Typography variant="h6" color="success.main">
                      {topUnit?.nomeUnidade}
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(topUnit?.totalVendas || 0)}
                    </Typography>
                  </Box>
                  <ArrowUpwardIcon color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Unidade com Menor Venda</Typography>
                    <Typography variant="h6" color="warning.main">
                      {lowUnit?.nomeUnidade}
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(lowUnit?.totalVendas || 0)}
                    </Typography>
                  </Box>
                  <ArrowDownwardIcon color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Média por Unidade</Typography>
                    <Typography variant="h5" color="info.main">
                      {formatCurrency(mediaVendas)}
                    </Typography>
                  </Box>
                  <StorefrontIcon color="info" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer' 
                    }}
                    onClick={() => handleSort('nomeUnidade')}
                  >
                    Unidade
                    {sortField === 'nomeUnidade' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end',
                      cursor: 'pointer' 
                    }}
                    onClick={() => handleSort('totalVendas')}
                  >
                    Total de Vendas
                    {sortField === 'totalVendas' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end',
                      cursor: 'pointer' 
                    }}
                    onClick={() => handleSort('quantidadeVendas')}
                  >
                    Quantidade
                    {sortField === 'quantidadeVendas' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end',
                      cursor: 'pointer' 
                    }}
                    onClick={() => handleSort('percentual')}
                  >
                    Percentual
                    {sortField === 'percentual' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">Ticket Médio</TableCell>
                <TableCell align="right">Distribuição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUnits.map((unit, index) => {
                const ticketMedio = unit.quantidadeVendas > 0 
                  ? unit.totalVendas / unit.quantidadeVendas 
                  : 0;
                
                return (
                  <TableRow key={index}>
                    <TableCell>{unit.nomeUnidade}</TableCell>
                    <TableCell align="right">{formatCurrency(unit.totalVendas)}</TableCell>
                    <TableCell align="right">{unit.quantidadeVendas}</TableCell>
                    <TableCell align="right">{unit.percentual.toFixed(2)}%</TableCell>
                    <TableCell align="right">{formatCurrency(ticketMedio)}</TableCell>
                    <TableCell align="right" sx={{ width: "20%" }}>
                      <Tooltip title={`${unit.nomeUnidade}: ${unit.percentual.toFixed(2)}%`}>
                        <LinearProgress
                          variant="determinate"
                          value={unit.percentual}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: "#f5f5f5",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: COLORS[index % COLORS.length]
                            }
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell><strong>Total</strong></TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(data.totalGeral)}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    {filteredUnits.reduce((total, unit) => total + unit.quantidadeVendas, 0)}
                  </strong>
                </TableCell>
                <TableCell align="right">100%</TableCell>
                <TableCell align="right">
                  <strong>
                    {formatCurrency(
                      data.totalGeral / 
                      filteredUnits.reduce((total, unit) => total + unit.quantidadeVendas, 0)
                    )}
                  </strong>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
};