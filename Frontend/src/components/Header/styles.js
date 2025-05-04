import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 20px;
  background-color: #f5f5f5;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  height: 60px; /* Altura fixa */
  flex-shrink: 0; /* Impede que o Header seja redimensionado */
`;



export const RightSection = styled.div`
  display: flex;
  align-items: center; /* Alinhar os ícones verticalmente */
  gap: 20px; /* Espaçamento horizontal entre os ícones */
`;
