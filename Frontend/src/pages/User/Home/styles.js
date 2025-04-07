import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  padding: 50px 20px;
  width: 100%;
`;

export const SearchContainer = styled.div`
  width: 100%;
  max-width: 1200px; /* Limita a largura total do container */
  margin-bottom: 20px; /* Espaçamento entre o campo e os cards */

  .searchItem {
    max-width: 350px; /* Garante que o campo não ultrapasse o tamanho dos cards */
    width: 100%; /* O campo ocupa toda a largura disponível */
  }
`;


export const CardList = styled.div`
  display: flex;
  flex-wrap: wrap; /* Permite que os cards quebrem linha */
  gap: 20px; /* Espaçamento entre os cards */
  justify-content: center; /* Centraliza os cards horizontalmente */
  width: 100%;
  max-width: 1200px; /* Limita a largura máxima para telas grandes */
`;