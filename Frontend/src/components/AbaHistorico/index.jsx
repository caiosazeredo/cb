import React from "react";
import HistoricoMovimentacao from "../HistoricoMovimentacao";
import { Box } from "@mui/material";

const AbaHistorico = ({ movements, paymentMethods, onDeleteMovement, loadingMovs }) => {
  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      <HistoricoMovimentacao
        movements={movements}
        paymentMethods={paymentMethods}
        onDeleteMovement={onDeleteMovement}
        loading={loadingMovs}
      />
    </Box>
  );
};

export default AbaHistorico;
