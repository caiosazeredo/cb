import { Paper, Typography, Box, Divider, CircularProgress, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const ResumoMovimentacao = ({ movements, paymentMethods, loading }) => {
  const calculateTotals = () => {
    const totals = {
      dinheiro: 0,
      credito: 0,
      debito: 0,
      pix: 0,
      ticket: 0,
      total: 0,
      coinsIn: 0,
      coinsOut: 0,

      pendente: {
        dinheiro: 0,
        credito: 0,
        debito: 0,
        pix: 0,
        ticket: 0,
        total: 0,
        coinsIn: 0,
        coinsOut: 0
      }
    };

    if (!movements || movements.length === 0) {
      return totals;
    }

    movements.forEach(movement => {
      const valor = Number(movement.valor || 0);
      const isPendente = movement.paymentStatus === 'pendente';
      const multiplier = movement.tipo === 'entrada' ? 1 : -1;
      const valorAjustado = valor * multiplier;

      // Verifica se é DINHEIRO, para somar as moedas:
      const isDinheiro = movement.forma === 'dinheiro';
      const moedasEntrada = Number(movement.moedasEntrada || 0);
      const moedasSaida = Number(movement.moedasSaida || 0);

      // Se for pendente + entrada, soma em totals.pendente
      if (isPendente && movement.tipo === 'entrada') {
        totals.pendente[movement.forma] += valor;
        totals.pendente.total += valor;

        // Se for dinheiro pendente, soma as moedas pendentes
        if (isDinheiro) {
          totals.pendente.coinsIn += moedasEntrada;
          totals.pendente.coinsOut += moedasSaida;
        }
      } else {
        // Caso contrário, soma nos valores já recebidos
        totals[movement.forma] += valorAjustado;
        totals.total += valorAjustado;

        // Se for dinheiro "já realizado" (ou saída pendente, se tiver),
        // soma nas moedas "confirmadas"
        if (isDinheiro) {
          // Repare que se for 'entrada', consideramos coinsIn; 
          // se for 'saida', consideramos coinsOut. Mas neste exemplo
          // adicionamos sempre os dois para manter a mesma lógica do que já existia.
          totals.coinsIn += moedasEntrada;
          totals.coinsOut += moedasSaida;
        }
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Paper
        sx={{
          p: 2,
          bgcolor: '#f9fafb',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: 300
        }}
      >
        <CircularProgress size={40} />
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: '#f9fafb',
        width: { xs: '100%', md: 400 },
        maxWidth: '100%',
        maxHeight: 600
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Resumo do Dia
        </Typography>
        <Tooltip title="Valores positivos indicam entradas no caixa. Valores negativos indicam saídas.">
          <InfoIcon sx={{ ml: 1, fontSize: 18, color: 'info.main' }} />
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Valores no Caixa:
        </Typography>
        {paymentMethods.map((method) => (
          <Box
            key={method.id}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography>{method.label}:</Typography>
            <Typography
              fontWeight="medium"
              sx={{ color: totals[method.id] >= 0 ? 'success.main' : 'error.main' }}
            >
              R$ {totals[method.id].toFixed(2)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Exibe moedas recebidas caso haja alguma */}
        {(totals.coinsIn > 0 || totals.coinsOut > 0) && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Moedas Recebidas
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography>Entrada de moedas:</Typography>
              <Typography fontWeight="medium" sx={{ color: 'success.main' }}>{totals.coinsIn}</Typography>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography>Saída de moedas:</Typography>
              <Typography fontWeight="medium" sx={{ color: 'error.main' }}>{totals.coinsOut}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Mostra valores pendentes, caso existam */}
        {totals.pendente.total > 0 && (
          <>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>
              Valores Pendentes de Recebimento:
            </Typography>
            {paymentMethods.map((method) => (
              totals.pendente[method.id] > 0 && (
                <Box
                  key={`pendente-${method.id}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography color="text.secondary">{method.label}:</Typography>
                  <Typography fontWeight="medium" sx={{ color: 'warning.main' }}>
                    R$ {totals.pendente[method.id].toFixed(2)}
                  </Typography>
                </Box>
              )
            ))}

            {/* Se houver moedas pendentes */}
            {(totals.pendente.coinsIn > 0 || totals.pendente.coinsOut > 0) && (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1
                  }}
                >
                  <Typography color="text.secondary">Entrada de moedas pendentes:</Typography>
                  <Typography fontWeight="medium" sx={{ color: 'warning.main' }}>
                    {totals.pendente.coinsIn}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Typography color="text.secondary">Saída de moedas pendentes:</Typography>
                  <Typography fontWeight="medium" sx={{ color: 'warning.main' }}>
                    {totals.pendente.coinsOut}
                  </Typography>
                </Box>
              </>
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1
              }}
            >
              <Typography fontWeight="medium" color="warning.main">
                Total Pendente:
              </Typography>
              <Typography fontWeight="medium" sx={{ color: 'warning.main' }}>
                R$ {totals.pendente.total.toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />
          </>
        )}

        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}
        >
          <Typography fontWeight="bold">Total Geral:</Typography>
          <Typography
            fontWeight="bold"
            variant="h6"
            sx={{ color: totals.total >= 0 ? 'success.main' : 'error.main' }}
          >
            R$ {totals.total.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ResumoMovimentacao;
