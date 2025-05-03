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

const HistoricoMovimentacao = ({
  movements,
  paymentMethods = [], // array de objetos { id, name, category }
  onDeleteMovement,
  loading
}) => {
  // Função que busca no array de métodos o objeto cujo id === movement.forma
  const findPaymentMethod = (id) => paymentMethods.find((m) => m.id === id);

  /*if(movements && movements.length>0){
    movements.sort((a, b) => b.id.localeCompare(a.id));
  }*/

  // Formata o horário exibido na tabela
  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    let date;
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return '-';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Verifica se pelo menos uma movimentação é em dinheiro
  // para saber se exibimos colunas de moedas (entrada/saída)
  const hasDinheiro = movements.some((mov) => mov.forma === 'dinheiro');

  // Se estiver carregando
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Se não há nenhuma movimentação
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
    <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Horário</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Status</TableCell>
            {/* Nova coluna: Categoria de Pagamento */}
            <TableCell>Categoria de Pagamento</TableCell>
            {/* Nova coluna: Forma de Pagamento */}
            <TableCell>Forma de Pagamento</TableCell>

            {hasDinheiro && (
              <>
                <TableCell align="right">Entrada de moedas</TableCell>
                <TableCell align="right">Saída de moedas</TableCell>
              </>
            )}
            <TableCell align="right">Valor</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {movements.map((movement) => {
            // Busca o método de pagamento pelo ID armazenado em movement.forma
            const method = findPaymentMethod(movement.forma);

            // Gera uma label de categoria (ex.: "credito" => "Credito")
            const categoryLabel = method?.category
              ? method.category[0].toUpperCase() + method.category.slice(1)
              : '-';

            return (
              <TableRow key={movement.id}>
                {/* Horário formatado */}
                <TableCell>{formatTime(movement.timestamp)}</TableCell>

                {/* Tipo (Entrada ou Saída) */}
                <TableCell>
                  <Chip
                    label={movement.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    color={movement.tipo === 'entrada' ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>

                {/* Status (Realizado ou Pendente) */}
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

                {/* Categoria de Pagamento (ex.: "Credito", "Debito", "Ticket", etc.) */}
                <TableCell>{categoryLabel}</TableCell>

                {/* Forma de Pagamento (ex.: "Cielo Crédito", "VR Refeição", etc.) */}
                <TableCell>{method?.name || '-'}</TableCell>

                {/* Se for dinheiro, exibir colunas de Entrada e Saída de moedas */}
                {hasDinheiro && (
                  <>
                    <TableCell align="right">
                      {movement.forma === 'dinheiro' ? movement.moedasEntrada || 0 : 0}
                    </TableCell>
                    <TableCell align="right">
                      {movement.forma === 'dinheiro' ? movement.moedasSaida || 0 : 0}
                    </TableCell>
                  </>
                )}

                {/* Valor (ex.: R$ 50.00) */}
                <TableCell align="right">
                  <Typography
                    sx={{
                      color: movement.tipo === 'entrada' ? 'success.main' : 'error.main',
                      fontWeight: 'medium'
                    }}
                  >
                    {movement.tipo === 'saida' ? '- ' : ''}
                    R$ {Number(movement.valor).toFixed(2)}
                  </Typography>
                </TableCell>

                {/* Descrição (com Tooltip se ficar grande) */}
                <TableCell>
                  <Tooltip
                    title={movement.descricao || ''}
                    arrow
                    placement="top"
                  >
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

                {/* Ações (ex.: excluir) */}
                <TableCell>
                  <IconButton
                    onClick={() => onDeleteMovement(movement.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HistoricoMovimentacao;
