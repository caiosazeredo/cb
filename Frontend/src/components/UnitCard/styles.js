import styled from "styled-components";
import { Paper } from "@mui/material";

export const CardContainer = styled(Paper)`
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #ffffff; /* Cor de fundo direta */

  &:hover {
    transform: scale(1.02);
  }

  /* Controla o tamanho fixo do card */
  width: 100%;
  max-width: 200px; /* Tamanho máximo do card */
  min-width: 350px; /* Tamanho mínimo do card */
  height: 200px; /* Altura fixa */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const CardContent = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;

`;

export const CardIcon = styled.div`
  margin-right: 16px;

  svg {
    font-size: 32px;
    color: #fec32e; /* Cor primária direta */
  }
`;
