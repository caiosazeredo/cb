import styled from 'styled-components';

export const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background-color: #f5f5f5; /* Fundo claro */
  padding: 0 20px; /* Margem lateral para melhorar leitura no celular */
`;

export const ErrorIcon = styled.div`
  color: #f44336; /* Cor vermelha para o ícone */
  margin-bottom: 20px;

  svg {
    font-size: 150px; /* Tamanho grande no desktop */
  }

  @media (max-width: 768px) {
    svg {
      font-size: 120px; /* Reduz o tamanho no celular */
    }
  }
`;

export const Title = styled.h1`
  font-size: 48px; /* Tamanho maior no desktop */
  color: #fec32e; /* Amarelo do tema */
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 32px; /* Reduz o tamanho no celular */
  }
`;

export const Message = styled.p`
  font-size: 18px; /* Tamanho maior no desktop */
  color: #666; /* Cinza para o texto */
  margin-bottom: 30px;
  line-height: 1.5; /* Melhor espaçamento entre linhas */
  max-width: 600px; /* Limita a largura para leitura confortável */

  @media (max-width: 768px) {
    font-size: 16px; /* Tamanho maior no celular */
    margin-left: 10px;
    margin-right: 10px; /* Adiciona margem lateral no celular */
  }
`;
