// src/components/FormularioMovimentacao/index.jsx
import { 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  FormLabel,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  FormHelperText,
  InputAdornment,
  Divider,
  Collapse
} from '@mui/material';
import { useState, useEffect } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CoinCounter from '../CoinCounter';

const FormularioMovimentacao = ({ 
  newMovement, 
  setNewMovement, 
  paymentMethods, 
  onAddMovement,
  loading,
  unidadeId,
  caixaId,
  api 
}) => {
  // Novo estado para controlar a visibilidade do contador de moedas
  const [showCoinCounter, setShowCoinCounter] = useState(false);
  
  // Estado para armazenar o troco disponível no caixa
  const [trocoDisponivel, setTrocoDisponivel] = useState({});
  
  // Estado para armazenar a informação do troco da transação atual
  const [trocoInfo, setTrocoInfo] = useState({
    receivedAmount: 0,
    change: 0,
    denominations: {}
  });
  
  // Log para diagnóstico inicial
  useEffect(() => {
    console.log("FormularioMovimentacao montado com props:", {
      unidadeId,
      caixaId,
      apiDisponivel: !!api,
      paymentMethods
    });
    
    // Verificar quais métodos API estão disponíveis
    if (api) {
      console.log("API methods disponíveis:", Object.keys(api));
      console.log("getTroco disponível:", typeof api.getTroco === 'function');
      console.log("updateTroco disponível:", typeof api.updateTroco === 'function');
    }
  }, []);
  
  // Buscar o troco disponível quando o componente montar ou quando mudar de caixa
  useEffect(() => {
    if (unidadeId && caixaId && api && api.getTroco) {
      console.log("Buscando troco para unidade", unidadeId, "e caixa", caixaId);
      fetchTrocoDisponivel();
    } else {
      console.warn("Não foi possível buscar troco:", {
        unidadeId: !!unidadeId,
        caixaId: !!caixaId,
        api: !!api,
        getTroco: api && !!api.getTroco
      });
    }
  }, [unidadeId, caixaId, api]);
  
  // Buscar o troco disponível no caixa
  const fetchTrocoDisponivel = async () => {
    try {
      console.log("Chamando api.getTroco(", unidadeId, ",", caixaId, ")");
      const response = await api.getTroco(unidadeId, caixaId);
      console.log("Resposta de getTroco:", response);
      
      if (response.success) {
        setTrocoDisponivel(response.data || {});
        console.log("Troco disponível atualizado:", response.data);
      } else {
        console.error("Erro ao buscar troco:", response.error);
      }
    } catch (error) {
      console.error("Exceção ao buscar troco:", error);
    }
  };

  // Atualizar a visibilidade do contador de moedas quando o método de pagamento mudar
  useEffect(() => {
    console.log("Payment method mudou para:", newMovement.paymentMethod);
    console.log("É dinheiro?", newMovement.paymentMethod === 'dinheiro');
    
    // Verificar se existe 'dinheiro' nos métodos de pagamento
    const hasDinheiro = paymentMethods.some(m => m.id === 'dinheiro');
    console.log("'dinheiro' existe nos métodos de pagamento:", hasDinheiro);
    
    setShowCoinCounter(newMovement.paymentMethod === 'dinheiro');
  }, [newMovement.paymentMethod, paymentMethods]);
  
  // Efeito adicional para verificar quando o valor muda
  useEffect(() => {
    console.log("Valor atualizado:", newMovement.amount);
    console.log("Condição do contador:", {
      showCoinCounter,
      paymentIsDinheiro: newMovement.paymentMethod === 'dinheiro',
      hasAmount: newMovement.amount > 0,
      shouldShow: showCoinCounter && newMovement.amount > 0
    });
  }, [newMovement.amount, showCoinCounter]);

  // Valida se os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    return (
      newMovement.paymentMethod && 
      newMovement.amount && 
      newMovement.paymentStatus && 
      // Se for dinheiro, verificar se o valor recebido é suficiente
      (newMovement.paymentMethod !== 'dinheiro' || trocoInfo.receivedAmount >= parseFloat(newMovement.amount))
    );
  };

  // Handler para processar o cálculo de troco
  const handleCalculateChange = (info) => {
    console.log("Troco calculado:", info);
    setTrocoInfo(info);
  };

  // Handler para quando o usuário clica em adicionar movimentação
  const handleAddClick = () => {
    // Se for pagamento em dinheiro, incluir as informações de troco
    if (newMovement.paymentMethod === 'dinheiro') {
      const movementWithChange = {
        ...newMovement,
        trocoInfo: {
          valorRecebido: trocoInfo.receivedAmount,
          troco: trocoInfo.change,
          denominacoesRecebidas: trocoInfo.denominations
        }
      };
      onAddMovement(movementWithChange);
    } else {
      onAddMovement(newMovement);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      p: 2, 
      bgcolor: '#f9fafb', 
      borderRadius: 1,
      border: '1px solid #e0e0e0'
    }}>
      {/* Debug area - remova após identificar o problema */}
      <Box sx={{ display: 'none' }}>
        <div>unidadeId: {unidadeId}</div>
        <div>caixaId: {caixaId}</div>
        <div>API disponível: {api ? 'Sim' : 'Não'}</div>
        <div>Payment Method: {newMovement.paymentMethod}</div>
        <div>showCoinCounter: {showCoinCounter ? 'Sim' : 'Não'}</div>
        <div>hasAmount: {newMovement.amount > 0 ? 'Sim' : 'Não'}</div>
      </Box>

      {/* Tipo de Movimentação: Entrada ou Saída */}
      <FormControl>
        <FormLabel id="movement-type-label">Tipo de Movimentação</FormLabel>
        <RadioGroup
          row
          aria-labelledby="movement-type-label"
          value={newMovement.type}
          onChange={(e) => setNewMovement({...newMovement, type: e.target.value})}
        >
          <FormControlLabel 
            value="entrada" 
            control={<Radio />} 
            label="Entrada" 
          />
          <FormControlLabel 
            value="saida" 
            control={<Radio />} 
            label="Saída" 
          />
        </RadioGroup>
      </FormControl>

      {/* Status de Pagamento (apenas para entradas) */}
      {newMovement.type === 'entrada' && (
        <FormControl required error={!newMovement.paymentStatus}>
          <FormLabel id="payment-status-label">Status do Pagamento</FormLabel>
          <RadioGroup
            row
            aria-labelledby="payment-status-label"
            value={newMovement.paymentStatus || ''}
            onChange={(e) => setNewMovement({...newMovement, paymentStatus: e.target.value})}
          >
            <FormControlLabel 
              value="realizado" 
              control={<Radio />} 
              label="Valor Recebido" 
            />
            <FormControlLabel 
              value="pendente" 
              control={<Radio />} 
              label="Pendente de Recebimento" 
            />
          </RadioGroup>
          {!newMovement.paymentStatus && (
            <FormHelperText>Status do pagamento é obrigatório</FormHelperText>
          )}
        </FormControl>
      )}

      <Divider />
  
      {/* Forma de Pagamento */}
      <FormControl fullWidth required error={!newMovement.paymentMethod}>
        <FormLabel>Forma de Pagamento</FormLabel>
        <Select
          value={newMovement.paymentMethod || ''}
          onChange={(e) => setNewMovement({...newMovement, paymentMethod: e.target.value})}
          displayEmpty
        >
          <MenuItem value="" disabled>Selecione uma forma de pagamento</MenuItem>
          {paymentMethods.map(method => (
            <MenuItem key={method.id} value={method.id}>
              {method.label}
            </MenuItem>
          ))}
        </Select>
        {!newMovement.paymentMethod && (
          <FormHelperText>Forma de pagamento é obrigatória</FormHelperText>
        )}
      </FormControl>
  
      {/* Valor */}
      <FormControl fullWidth required error={!newMovement.amount}>
        <FormLabel>Valor</FormLabel>
        <TextField
          type="number"
          value={newMovement.amount || ''}
          onChange={(e) => setNewMovement({...newMovement, amount: e.target.value})}
          placeholder="0,00"
          InputProps={{
            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            inputProps: { 
              step: "0.01",
              min: "0.01"
            }
          }}
        />
        {!newMovement.amount && (
          <FormHelperText>Valor é obrigatório</FormHelperText>
        )}
      </FormControl>
  
      {/* Descrição */}
      <FormControl fullWidth>
        <FormLabel>Descrição</FormLabel>
        <TextField
          value={newMovement.description || ''}
          onChange={(e) => setNewMovement({...newMovement, description: e.target.value})}
          multiline
          rows={2}
          placeholder="Adicione uma descrição (opcional)"
        />
      </FormControl>
  
      {/* Campos adicionais para TICKET */}
      {newMovement.paymentMethod === 'ticket' && (
        <>
          <FormControl fullWidth required error={!newMovement.clientName && newMovement.paymentMethod === 'ticket'}>
            <FormLabel>Nome do Cliente</FormLabel>
            <TextField
              value={newMovement.clientName || ''}
              onChange={(e) => setNewMovement({...newMovement, clientName: e.target.value})}
              placeholder="Nome do cliente"
            />
            {!newMovement.clientName && (
              <FormHelperText>Nome do cliente é obrigatório para Ticket</FormHelperText>
            )}
          </FormControl>
  
          <FormControl fullWidth>
            <FormLabel>Número do Documento</FormLabel>
            <TextField
              value={newMovement.documentNumber || ''}
              onChange={(e) => setNewMovement({...newMovement, documentNumber: e.target.value})}
              placeholder="Número do documento (opcional)"
            />
          </FormControl>
        </>
      )}
      
      {/* Contador de Moedas (aparece quando forma de pagamento é dinheiro) */}
      <Box sx={{ border: '1px dashed #ccc', p: 1, display: showCoinCounter && newMovement.amount > 0 ? 'block' : 'none' }}>
        <p>Debug: Contador de Moedas deveria aparecer aqui (showCoinCounter: {String(showCoinCounter)}, amount {'>'} 0: {String(newMovement.amount > 0)})</p>
      </Box>
      
      <Collapse in={showCoinCounter && newMovement.amount > 0}>
        <CoinCounter
          visible={showCoinCounter && newMovement.amount > 0}
          totalAmount={parseFloat(newMovement.amount) || 0}
          onCalculateChange={handleCalculateChange}
          currentCoinsInDrawer={trocoDisponivel}
        />
      </Collapse>
  
      {/* Botão de Adicionar */}
      <Button
        variant="contained"
        onClick={handleAddClick}
        startIcon={<AddCircleIcon />}
        disabled={!isFormValid() || loading}
        sx={{ 
          bgcolor: '#FEC32E',
          '&:hover': {
            bgcolor: '#e6b32a'
          },
          mt: 2
        }}
      >
        {loading ? 'Processando...' : 'Adicionar Movimentação'}
      </Button>
    </Box>
  );
};

export default FormularioMovimentacao;