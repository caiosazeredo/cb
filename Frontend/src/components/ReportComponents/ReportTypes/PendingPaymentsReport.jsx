// src/components/ReportComponents/ReportTypes/PendingPaymentsReport.jsx
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
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PaymentIcon from "@mui/icons-material/Payment";
import WarningIcon from "@mui/icons-material/Warning";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { format, differenceInDays } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

export const PendingPaymentsReport = ({ data, viewType }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDays, setFilterDays] = useState(0); // 0 significa todos os dias

  // Formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Se não houver dados reais, usar dados simulados
  const pendingPayments = data?.pendingPayments || [
    {
      id: "PAY001",
      cliente: "João Silva",
      valor: 350.00,
      forma: "credito",
      descricao: "Pedido #12345",
      timestamp: new Date(2025, 3, 5), // 5 de abril
      unidade: "Centro",
      funcionario: "Ana Oliveira",
      observacoes: "Cliente informou que pagará na próxima semana"
    },
    {
      id: "PAY002",
      cliente: "Maria Santos",
      valor: 780.50,
      forma: "pix",
      descricao: "Encomenda especial",
      timestamp: new Date(2025, 3, 10), // 10 de abril
      unidade: "Sul",
      funcionario: "Carlos Mendes",
      observacoes: "Aguardando comprovante"
    },
    {
      id: "PAY003",
      cliente: "Roberto Almeida",
      valor: 1200.00,
      forma: "ticket",
      descricao: "Evento corporativo",
      timestamp: new Date(2025, 2, 20), // 20 de março
      unidade: "Norte",
      funcionario: "Patricia Lima",
      observacoes: "Empresa prometeu pagamento em 30 dias"
    },
    {
      id: "PAY004",
      cliente: "Carla Pereira",
      valor: 450.25,
      forma: "credito",
      descricao: "Encomenda #54321",
      timestamp: new Date(2025, 3, 2), // 2 de abril
      unidade: "Leste",
      funcionario: "João Marcos",
      observacoes: ""
    },
    {
      id: "PAY005",
      cliente: "Empresa ABC Ltda",
      valor: 2500.00,
      forma: "pix",
      descricao: "Fornecimento mensal",
      timestamp: new Date(2025, 3, 1), // 1 de abril
      unidade: "Centro",
      funcionario: "Ana Oliveira",
      observacoes: "Aguardando aprovação do financeiro do cliente"
    }
  ];

  // Filtragem baseada na busca e nos dias pendentes
  const hoje = new Date();
  const filteredPayments = pendingPayments
    .filter(payment => {
      // Filtragem por texto
      const searchMatch = 
        payment.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.descricao.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.forma.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.funcionario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.unidade.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filtragem por dias pendentes
      const diasPendentes = differenceInDays(hoje, new Date(payment.timestamp));
      const daysMatch = filterDays === 0 || diasPendentes >= filterDays;
      
      return searchMatch && daysMatch;
    })
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Ordenar por data

  // Cálculo de estatísticas para o dashboard
  const totalPendente = filteredPayments.reduce((total, payment) => total + payment.valor, 0);
  const totalPagamentos = filteredPayments.length;
  const pagamentoMaisAntigo = filteredPayments.reduce(
    (oldest, current) => 
      new Date(current.timestamp) < new Date(oldest.timestamp) ? current : oldest, 
    filteredPayments[0]
  );
  const diasMaisAntigo = pagamentoMaisAntigo ? differenceInDays(hoje, new Date(pagamentoMaisAntigo.timestamp)) : 0;
  
  // Agrupamento por forma de pagamento para gráficos
  const formaPagamentoData = {};
  filteredPayments.forEach(payment => {
    const forma = payment.forma === "credito" ? "Crédito" :
                  payment.forma === "pix" ? "PIX" :
                  payment.forma === "ticket" ? "Ticket" : payment.forma;
    
    if (!formaPagamentoData[forma]) {
      formaPagamentoData[forma] = {
        name: forma,
        valor: 0,
        quantidade: 0
      };
    }
    
    formaPagamentoData[forma].valor += payment.valor;
    formaPagamentoData[forma].quantidade += 1;
  });

  const formaPagamentoChart = Object.values(formaPagamentoData);

  // Agrupamento por unidade para gráficos
  const unidadeData = {};
  filteredPayments.forEach(payment => {
    if (!unidadeData[payment.unidade]) {
      unidadeData[payment.unidade] = {
        name: payment.unidade,
        valor: 0,
        quantidade: 0
      };
    }
    
    unidadeData[payment.unidade].valor += payment.valor;
    unidadeData[payment.unidade].quantidade += 1;
  });

  const unidadeChart = Object.values(unidadeData);

  // Agrupamento por dias pendentes para gráficos
  const diasPendentesData = {
    '0-7': { name: '0-7 dias', valor: 0, quantidade: 0 },
    '8-15': { name: '8-15 dias', valor: 0, quantidade: 0 },
    '16-30': { name: '16-30 dias', valor: 0, quantidade: 0 },
    '31+': { name: '31+ dias', valor: 0, quantidade: 0 }
  };

  filteredPayments.forEach(payment => {
    const diasPendentes = differenceInDays(hoje, new Date(payment.timestamp));
    let category;
    
    if (diasPendentes <= 7) category = '0-7';
    else if (diasPendentes <= 15) category = '8-15';
    else if (diasPendentes <= 30) category = '16-30';
    else category = '31+';
    
    diasPendentesData[category].valor += payment.valor;
    diasPendentesData[category].quantidade += 1;
  });

  const diasPendentesChart = Object.values(diasPendentesData);

  // Cores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9370DB'];

  // Função para classificar urgência com base nos dias pendentes
  const getUrgencyColor = (dias) => {
    if (dias <= 7) return 'success';
    if (dias <= 15) return 'info';
    if (dias <= 30) return 'warning';
    return 'error';
  };

  // Renderização baseada no tipo de visualização
  if (viewType === "bar") {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Buscar por cliente, descrição, forma de pagamento..."
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
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDays(filterDays === 0 ? 15 : filterDays === 15 ? 30 : 0)}
                sx={{ height: '56px' }}
              >
                {filterDays === 0 
                  ? "Todos os Pagamentos" 
                  : `Pendentes há ${filterDays}+ dias`}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total Pendente</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(totalPendente)}
                    </Typography>
                  </Box>
                  <AttachMoneyIcon color="primary" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Pagamentos</Typography>
                    <Typography variant="h5" color="primary">
                      {totalPagamentos}
                    </Typography>
                  </Box>
                  <PaymentIcon color="primary" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Pagamento Mais Antigo</Typography>
                    <Typography variant="h6" color="warning.main">
                      {pagamentoMaisAntigo ? format(new Date(pagamentoMaisAntigo.timestamp), 'dd/MM/yyyy') : '-'}
                    </Typography>
                  </Box>
                  <WarningIcon color="warning" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Dias em Aberto (Máx.)</Typography>
                    <Typography variant="h5" color="error.main">
                      {diasMaisAntigo} dias
                    </Typography>
                  </Box>
                  <PriorityHighIcon color="error" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Valores Pendentes por Forma de Pagamento
        </Typography>
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formaPagamentoChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip
                formatter={(value, name) => {
                  if (name === "valor") 
                    return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Bar
                dataKey="valor"
                fill="#8884d8"
                name="Valor Pendente"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Typography variant="h6" gutterBottom>
          Valores Pendentes por Unidade
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={unidadeChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip
                formatter={(value, name) => {
                  if (name === "valor") 
                    return formatCurrency(value);
                  return value;
                }}
              />
              <Legend />
              <Bar
                dataKey="valor"
                fill="#82ca9d"
                name="Valor Pendente"
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
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Buscar por cliente, descrição, forma de pagamento..."
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
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDays(filterDays === 0 ? 15 : filterDays === 15 ? 30 : 0)}
                sx={{ height: '56px' }}
              >
                {filterDays === 0 
                  ? "Todos os Pagamentos" 
                  : `Pendentes há ${filterDays}+ dias`}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total Pendente</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(totalPendente)}
                    </Typography>
                  </Box>
                  <AttachMoneyIcon color="primary" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Pagamentos</Typography>
                    <Typography variant="h5" color="primary">
                      {totalPagamentos}
                    </Typography>
                  </Box>
                  <PaymentIcon color="primary" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Pagamento Mais Antigo</Typography>
                    <Typography variant="h6" color="warning.main">
                      {pagamentoMaisAntigo ? format(new Date(pagamentoMaisAntigo.timestamp), 'dd/MM/yyyy') : '-'}
                    </Typography>
                  </Box>
                  <WarningIcon color="warning" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Dias em Aberto (Máx.)</Typography>
                    <Typography variant="h5" color="error.main">
                      {diasMaisAntigo} dias
                    </Typography>
                  </Box>
                  <PriorityHighIcon color="error" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Distribuição por Forma de Pagamento
        </Typography>
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formaPagamentoChart}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={140}
                fill="#8884d8"
                dataKey="valor"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {formaPagamentoChart.map((entry, index) => (
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
          Distribuição por Tempo Pendente
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={diasPendentesChart}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={140}
                fill="#8884d8"
                dataKey="valor"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {diasPendentesChart.map((entry, index) => (
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
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Buscar por cliente, descrição, forma de pagamento..."
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
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterDays(filterDays === 0 ? 15 : filterDays === 15 ? 30 : 0)}
              >
                {filterDays === 0 
                  ? "Todos os Pagamentos" 
                  : `Pendentes há ${filterDays}+ dias`}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total Pendente</Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(totalPendente)}
                    </Typography>
                  </Box>
                  <AttachMoneyIcon color="primary" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Total de Pagamentos</Typography>
                    <Typography variant="h5" color="primary">
                      {totalPagamentos}
                    </Typography>
                  </Box>
                  <PaymentIcon color="primary" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Pagamento Mais Antigo</Typography>
                    <Typography variant="h6" color="warning.main">
                      {pagamentoMaisAntigo ? format(new Date(pagamentoMaisAntigo.timestamp), 'dd/MM/yyyy') : '-'}
                    </Typography>
                  </Box>
                  <WarningIcon color="warning" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Dias em Aberto (Máx.)</Typography>
                    <Typography variant="h5" color="error.main">
                      {diasMaisAntigo} dias
                    </Typography>
                  </Box>
                  <PriorityHighIcon color="error" fontSize="large" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Pagamentos Pendentes
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Forma</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Dias Pendentes</TableCell>
                <TableCell>Unidade</TableCell>
                <TableCell>Funcionário</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => {
                const diasPendentes = differenceInDays(hoje, new Date(payment.timestamp));
                const urgencyColor = getUrgencyColor(diasPendentes);
                
                return (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.cliente}</TableCell>
                    <TableCell>{payment.descricao}</TableCell>
                    <TableCell>
                      {payment.forma === "credito" ? "Crédito" :
                       payment.forma === "pix" ? "PIX" :
                       payment.forma === "ticket" ? "Ticket" : payment.forma}
                    </TableCell>
                    <TableCell>{format(new Date(payment.timestamp), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${diasPendentes} dias`} 
                        color={urgencyColor}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{payment.unidade}</TableCell>
                    <TableCell>{payment.funcionario}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        {formatCurrency(payment.valor)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver detalhes">
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="text.secondary" py={3}>
                      Nenhum pagamento pendente encontrado com os filtros atuais.
                    </Typography>
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