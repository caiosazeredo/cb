import React from "react";
import { Box } from "@mui/material";
import FormularioMovimentacaoEmLinhas from "../FormularioMovimentacaoEmLinhas";
import ResumoMovimentacao from "../ResumoMovimentacao";

const AbaRegistroEmLotes = ({
  tempMovements,
  onTempMovementsChange,
  onSaveAll,
  paymentMethods,
  movements,
  loadingMovs
}) => {
  const combinedMovements = [
    ...movements,
    ...tempMovements.map((item) => ({
      tipo: item.tipo,
      forma: item.forma,
      valor: parseFloat((item.valor || "").replace(",", ".")) || 0,
      paymentStatus: item.paymentStatus || "realizado",
    })),
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 2
      }}
    >
      <Box sx={{ flex: 1 }}>
        <FormularioMovimentacaoEmLinhas
          tempMovements={tempMovements}
          onTempMovementsChange={onTempMovementsChange}
          onSaveAll={onSaveAll}
          paymentMethods={paymentMethods}
        />
      </Box>
      <Box sx={{ width: { xs: "100%", md: "250px" } }}>
        <ResumoMovimentacao
          movements={combinedMovements}
          paymentMethods={paymentMethods}
          loading={loadingMovs}
        />
      </Box>
    </Box>
  );
};

export default AbaRegistroEmLotes;