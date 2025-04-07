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
  Divider
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const FormularioMovimentacao = ({ 
  newMovement, 
  setNewMovement, 
  paymentMethods, 
  onAddMovement,
  loading 
}) => {
  // Valida se os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    return (
      newMovement.paymentMethod && 
      newMovement.amount && 
      newMovement.paymentStatus
    );
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
  
      {/* Botão de Adicionar */}
      <Button
        variant="contained"
        onClick={onAddMovement}
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