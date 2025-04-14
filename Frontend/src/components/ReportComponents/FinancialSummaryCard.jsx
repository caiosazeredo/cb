// src/components/ReportComponents/FinancialSummaryCard.jsx
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  LinearProgress,
  Grid
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

// Componente de cartão para resumo financeiro
export const FinancialSummaryCard = ({ title, value, previousValue, icon, color = "primary" }) => {
  // Calcula a variação percentual
  const calculatePercentageChange = () => {
    if (!previousValue || previousValue === 0) return null;
    return ((value - previousValue) / previousValue) * 100;
  };

  const percentChange = calculatePercentageChange();
  const isPositive = percentChange > 0;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1, color: `${color}.main` }}>
              R$ {value.toFixed(2)}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: `${color}.lighter`,
              p: 1,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {icon}
          </Box>
        </Box>

        {percentChange !== null && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {isPositive ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
              <Typography
                variant="body2"
                sx={{
                  ml: 0.5,
                  color: isPositive ? "success.main" : "error.main"
                }}
              >
                {Math.abs(percentChange).toFixed(1)}%
              </Typography>
              <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
                vs período anterior
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percentChange > 100 ? 100 : Math.abs(percentChange)}
              color={isPositive ? "success" : "error"}
              sx={{ mt: 1, height: 4, borderRadius: 2 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para exibir o resumo do relatório
export const ReportSummary = ({ data }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Resumo
      </Typography>
      <Grid container spacing={3}>
        {data.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <FinancialSummaryCard
              title={item.title}
              value={item.value}
              previousValue={item.previousValue}
              icon={item.icon}
              color={item.color}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Componente para exibir métricas em cartões
export const MetricCardsRow = ({ metrics }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {metrics.map((metric, index) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                {metric.label}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
                {typeof metric.value === "number"
                  ? metric.isPercentage
                    ? `${metric.value.toFixed(1)}%`
                    : metric.isCurrency
                    ? `R$ ${metric.value.toFixed(2)}`
                    : metric.value.toLocaleString()
                  : metric.value}
              </Typography>
              {metric.change && (
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  {metric.change > 0 ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 0.5,
                      color: metric.change > 0 ? "success.main" : "error.main"
                    }}
                  >
                    {Math.abs(metric.change).toFixed(1)}%
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Componente para exibir um cartão de relatório com loading
export const ReportLoadingCard = ({ title }) => {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <LinearProgress sx={{ width: "80%" }} />
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente para exibir uma seção de relatório
export const ReportSection = ({ title, children }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {children}
    </Box>
  );
};