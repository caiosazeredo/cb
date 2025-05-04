import React from "react";
import { Box } from "@mui/material";
import FormularioMovimentacao from "../FormularioMovimentacao";
import ResumoMovimentacao from "../ResumoMovimentacao";

const AbaRegistrarMovimentacao = ({
  newMovement,
  setNewMovement,
  paymentMethods,
  onAddMovement,
  loading,
  movements,
  loadingMovs
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2
      }}
    >
      <Box sx={{ flex: 1 }}>
        <FormularioMovimentacao
          newMovement={newMovement}
          setNewMovement={setNewMovement}
          paymentMethods={paymentMethods}
          onAddMovement={onAddMovement}
          loading={loading}
        />
      </Box>
      <Box sx={{ width: { xs: "100%", md: "250px" } }}>
        <ResumoMovimentacao
          movements={movements}
          paymentMethods={paymentMethods}
          loading={loadingMovs}
        />
      </Box>
    </Box>
  );
};

export default AbaRegistrarMovimentacao;