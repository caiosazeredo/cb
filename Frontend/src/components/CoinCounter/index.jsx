// src/components/CoinCounter/index.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Paper, 
  Divider,
  Grid,
  InputAdornment
} from '@mui/material';

const CoinCounter = ({ 
  visible, 
  totalAmount, 
  onCalculateChange, 
  currentCoinsInDrawer = {} 
}) => {
  // Lista de notas e moedas em reais
  const denominations = [
    { value: 200, label: "R$ 200" },
    { value: 100, label: "R$ 100" },
    { value: 50, label: "R$ 50" },
    { value: 20, label: "R$ 20" },
    { value: 10, label: "R$ 10" },
    { value: 5, label: "R$ 5" },
    { value: 2, label: "R$ 2" },
    { value: 1, label: "R$ 1" },
    { value: 0.5, label: "R$ 0,50" },
    { value: 0.25, label: "R$ 0,25" },
    { value: 0.1, label: "R$ 0,10" },
    { value: 0.05, label: "R$ 0,05" },
  ];

  // Estado para armazenar a quantidade de cada cédula/moeda
  const [quantities, setQuantities] = useState({});
  
  // Estado para mostrar o valor total recebido
  const [receivedAmount, setReceivedAmount] = useState(0);
  
  // Estado para o troco
  const [change, setChange] = useState(0);

  // Inicializa as quantidades
  useEffect(() => {
    const initialQuantities = {};
    denominations.forEach(denom => {
      initialQuantities[denom.value] = 0;
    });
    setQuantities(initialQuantities);
    setReceivedAmount(0);
    setChange(0);
  }, [visible, totalAmount]);

  // Atualiza o valor total e o troco quando as quantidades mudam
  useEffect(() => {
    let total = 0;
    Object.entries(quantities).forEach(([value, quantity]) => {
      total += parseFloat(value) * parseInt(quantity || 0);
    });
    
    setReceivedAmount(total);
    const changeAmount = total - totalAmount;
    setChange(changeAmount > 0 ? changeAmount : 0);
    
    // Callback para o componente pai
    if (onCalculateChange) {
      onCalculateChange({
        receivedAmount: total,
        change: changeAmount > 0 ? changeAmount : 0,
        denominations: quantities
      });
    }
  }, [quantities, totalAmount, onCalculateChange]);

  // Handler para alteração de quantidade
  const handleQuantityChange = (value, newQuantity) => {
    // Garante que o valor não seja negativo
    const sanitizedQuantity = newQuantity < 0 ? 0 : newQuantity;
    
    setQuantities(prev => ({
      ...prev,
      [value]: sanitizedQuantity
    }));
  };

  if (!visible) return null;

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Contagem de Cédulas e Moedas
      </Typography>
      <Box sx={{ my: 2 }}>
        <Typography>
          <strong>Valor a pagar:</strong> R$ {totalAmount.toFixed(2)}
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {denominations.map((denom) => (
          <Grid item xs={6} sm={4} md={3} key={denom.value}>
            <TextField
              label={denom.label}
              type="number"
              value={quantities[denom.value] || ""}
              onChange={(e) => handleQuantityChange(denom.value, parseInt(e.target.value) || 0)}
              fullWidth
              size="small"
              InputProps={{
                inputProps: { min: 0 }
              }}
            />
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1">
          <strong>Total Recebido:</strong>
        </Typography>
        <Typography variant="subtitle1" color="primary.main">
          R$ {receivedAmount.toFixed(2)}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1">
          <strong>Troco:</strong>
        </Typography>
        <Typography 
          variant="subtitle1" 
          color={change > 0 ? "success.main" : "text.secondary"}
        >
          R$ {change.toFixed(2)}
        </Typography>
      </Box>

      {/* Mostrar o troco disponível no caixa */}
      {Object.keys(currentCoinsInDrawer).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Troco disponível no caixa:
          </Typography>
          <Grid container spacing={1}>
            {denominations.map((denom) => (
              currentCoinsInDrawer[denom.value] > 0 && (
                <Grid item xs={6} sm={4} md={3} key={`drawer-${denom.value}`}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{denom.label}:</Typography>
                    <Typography variant="body2">{currentCoinsInDrawer[denom.value] || 0}x</Typography>
                  </Box>
                </Grid>
              )
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default CoinCounter;