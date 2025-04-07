import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const HistoricoMovimentacao = ({ movements, paymentMethods, onDeleteMovement, loading }) => {
  const getPaymentMethodLabel = (id) => {
    const method = paymentMethods.find(m => m.id === id);
    return method?.label || '-';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    
    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else {
        date = new Date(timestamp);
      }
    }
    
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Nenhuma movimentação registrada para esta data.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Horário</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Forma</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movements.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell>{formatTime(movement.timestamp)}</TableCell>
              <TableCell>
                <Chip
                  label={movement.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  color={movement.tipo === 'entrada' ? 'success' : 'error'}
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              <TableCell>
                {movement.paymentStatus === 'pendente' ? (
                  <Tooltip title="Pendente de recebimento">
                    <Chip
                      icon={<AccessTimeIcon />}
                      label="Pendente"
                      color="warning"
                      variant="outlined"
                      size="small"
                    />
                  </Tooltip>
                ) : (
                  <Chip
                    label="Realizado"
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                )}
              </TableCell>
              <TableCell>{getPaymentMethodLabel(movement.forma)}</TableCell>
              <TableCell align="right">
                <Typography
                  sx={{
                    color: movement.tipo === 'entrada' ? 'success.main' : 'error.main',
                    fontWeight: 'medium'
                  }}
                >
                  {movement.tipo === 'saida' ? '- ' : ''}R$ {Number(movement.valor).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell>
                <Tooltip title={movement.descricao || ''} arrow placement="top">
                  <Typography
                    sx={{
                      maxWidth: 150,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {movement.descricao || '-'}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => onDeleteMovement(movement.id)} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HistoricoMovimentacao;
