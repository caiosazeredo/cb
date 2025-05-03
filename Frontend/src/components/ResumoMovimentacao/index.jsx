import { Paper, Typography, Box, Divider, CircularProgress, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const ResumoMovimentacao = ({ movements, paymentMethods = [], loading }) => {

  const fix2 = (n) => Number((n ?? 0).toFixed(2));

  const categoryLabels = {
    dinheiro: 'Dinheiro',
    credito: 'Crédito',
    debito: 'Débito',
    pix: 'PIX',
    ticket: 'Ticket'
  };

  const categories = ['dinheiro', 'credito', 'debito', 'pix', 'ticket'];

  /* ================================================================
     CÁLCULO DOS TOTAIS
     ================================================================ */
  const calculateTotals = () => {
    const t = {
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

    if (!movements?.length) return t;

    movements.forEach((mov) => {
      const valor       = Number(mov.valor) || 0;
      const isPendente  = mov.paymentStatus === 'pendente';
      const multiplier  = mov.tipo === 'entrada' ? 1 : -1;
      const ajustado    = valor * multiplier;

      const method      = paymentMethods.find((m) => m.id === mov.forma);
      if (!method) return;

      const cat         = method.category;
      const isCash      = cat === 'dinheiro';

      if (isPendente && mov.tipo === 'entrada') {
        t.pendente[cat]      += valor;
        t.pendente.total     += valor;
        if (isCash) {
          t.pendente.coinsIn  += Number(mov.moedasEntrada || 0);
          t.pendente.coinsOut += Number(mov.moedasSaida   || 0);
        }
      } else {
        t[cat]          += ajustado;
        t.total         += ajustado;
        if (isCash) {
          t.coinsIn     += Number(mov.moedasEntrada || 0);
          t.coinsOut    += Number(mov.moedasSaida   || 0);
        }
      }
    });

    [...categories, 'total', 'coinsIn', 'coinsOut'].forEach((k) => {
      t[k] = fix2(t[k]);
    });
    [...categories, 'total', 'coinsIn', 'coinsOut'].forEach((k) => {
      t.pendente[k] = fix2(t.pendente[k]);
    });

    return t;
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Paper sx={{ p: 2, bgcolor: '#f9fafb', display: 'flex', justifyContent: 'center',
                   alignItems: 'center', height: '100%', minHeight: 300 }}>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, bgcolor: '#f9fafb', width: { xs: '100%', md: 400 },
                 maxWidth: '100%', maxHeight: 650, overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ fontSize: '1rem' }} gutterBottom>
          Resumo do Dia
        </Typography>
        <Tooltip title="Valores positivos indicam entradas no caixa. Valores negativos indicam saídas.">
          <InfoIcon sx={{ ml: 1, fontSize: 16, color: 'info.main' }} />
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }} gutterBottom>
          Valores por Categoria:
        </Typography>

        {categories.map((cat) => (
          <Box key={cat} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              {categoryLabels[cat]}:
            </Typography>
            <Typography variant="body2" sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: totals[cat] >= 0 ? 'success.main' : 'error.main'
            }}>
              R$ {totals[cat].toFixed(2)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 1 }} />

        {(totals.coinsIn > 0 || totals.coinsOut > 0) && (
          <>
            <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }} gutterBottom>
              Moedas Recebidas
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Entrada de moedas:</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'success.main' }}>
                {totals.coinsIn.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Saída de moedas:</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'error.main' }}>
                {totals.coinsOut.toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* ------------- valores pendentes ------------- */}
        {totals.pendente.total > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', color: 'warning.main' }} gutterBottom>
              Valores Pendentes de Recebimento:
            </Typography>
            {categories.map((cat) =>
              totals.pendente[cat] > 0 && (
                <Box key={`pend-${cat}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    {categoryLabels[cat]}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'warning.main' }}>
                    R$ {totals.pendente[cat].toFixed(2)}
                  </Typography>
                </Box>
              )
            )}

            {(totals.pendente.coinsIn > 0 || totals.pendente.coinsOut > 0) && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    Entrada de moedas pendentes:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'warning.main' }}>
                    {totals.pendente.coinsIn.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    Saída de moedas pendentes:
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'warning.main' }}>
                    {totals.pendente.coinsOut.toFixed(2)}
                  </Typography>
                </Box>
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'warning.main' }}>
                Total Pendente:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: 'warning.main' }}>
                R$ {totals.pendente.total.toFixed(2)}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
            Total Geral:
          </Typography>
          <Typography variant="body1" sx={{
            fontSize: '1rem', fontWeight: 'bold',
            color: totals.total >= 0 ? 'success.main' : 'error.main'
          }}>
            R$ {totals.total.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ResumoMovimentacao;
