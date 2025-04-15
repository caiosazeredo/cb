// src/components/ReportComponents/ReportFilters.jsx
// Componente para filtros de relatórios
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Chip
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearIcon from "@mui/icons-material/Clear";
import ptBR from "date-fns/locale/pt-BR";
import { ReportService } from "../../services/ReportService";

/**
 * Componente de filtros para relatórios
 */
export const ReportFilters = ({ 
  onGenerateReport, 
  loading, 
  reportTypes, 
  defaultPeriodType = "month" 
}) => {
  // Estados para os filtros
  const [selectedReport, setSelectedReport] = useState("");
  const [periodType, setPeriodType] = useState(defaultPeriodType);
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [units, setUnits] = useState([]);
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);

  // Opções de período
  const periodOptions = [
    { value: "day", label: "Dia específico" },
    { value: "week", label: "Semana" },
    { value: "month", label: "Mês" },
    { value: "year", label: "Ano" },
    { value: "custom", label: "Período personalizado" }
  ];

  // Buscar unidades ao montar o componente
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const unitsData = await ReportService.fetchUnits(true);
        setUnits(unitsData);
      } catch (error) {
        console.error("Erro ao buscar unidades:", error);
      }
    };

    fetchUnits();
  }, []);

  // Atualizar flag de período personalizado quando o tipo de período muda
  useEffect(() => {
    setIsCustomPeriod(periodType === "custom");
  }, [periodType]);

  // Limpar filtros
  const handleClearFilters = () => {
    setSelectedReport("");
    setPeriodType(defaultPeriodType);
    setReferenceDate(new Date());
    setStartDate(new Date());
    setEndDate(new Date());
    setSelectedUnit("all");
  };

  // Gerar relatório
  const handleGenerateClick = () => {
    if (!selectedReport) {
      alert("Por favor, selecione um tipo de relatório");
      return;
    }

    // Preparar parâmetros
    const params = {
      reportType: selectedReport,
      periodType,
      referenceDate,
      startDate: isCustomPeriod ? startDate : undefined,
      endDate: isCustomPeriod ? endDate : undefined,
      unitId: selectedUnit === "all" ? undefined : selectedUnit
    };

    // Chamar callback
    onGenerateReport(params);
  };

  return (
    <Paper sx={{ p: 3, width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Filtros do Relatório
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3}>
        {/* Tipo de Relatório */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Tipo de Relatório</InputLabel>
            <Select
              value={selectedReport}
              label="Tipo de Relatório"
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <MenuItem value="" disabled>
                Selecione um tipo de relatório
              </MenuItem>
              {reportTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  <Box>
                    <Typography variant="body1">{type.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Unidade */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Unidade</InputLabel>
            <Select
              value={selectedUnit}
              label="Unidade"
              onChange={(e) => setSelectedUnit(e.target.value)}
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

        {/* Tipo de Período */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Período</InputLabel>
            <Select
              value={periodType}
              label="Período"
              onChange={(e) => setPeriodType(e.target.value)}
            >
              {periodOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Data de Referência (para dia/semana/mês/ano) */}
        {!isCustomPeriod && (
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <DatePicker
                label={
                  periodType === "day"
                    ? "Selecione o dia"
                    : periodType === "week"
                    ? "Selecione a semana"
                    : periodType === "month"
                    ? "Selecione o mês"
                    : "Selecione o ano"
                }
                value={referenceDate}
                onChange={(newDate) => setReferenceDate(newDate)}
                slots={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
        )}

        {/* Período Personalizado */}
        {isCustomPeriod && (
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Inicial"
                    value={startDate}
                    onChange={(newDate) => setStartDate(newDate)}
                    slots={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <DatePicker
                    label="Data Final"
                    value={endDate}
                    onChange={(newDate) => setEndDate(newDate)}
                    slots={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>
        )}

        {/* Botões de Ação */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={loading}
            >
              Limpar Filtros
            </Button>
            <Button
              variant="contained"
              startIcon={<FilterAltIcon />}
              onClick={handleGenerateClick}
              disabled={loading || !selectedReport}
              sx={{
                bgcolor: "#FEC32E",
                "&:hover": { bgcolor: "#e6b32a" }
              }}
            >
              {loading ? "Gerando..." : "Gerar Relatório"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};






