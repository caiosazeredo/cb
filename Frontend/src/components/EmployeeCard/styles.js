import styled from "styled-components";

export const CardContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 22px;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center; 
  gap: 12px;
  cursor: pointer; 
  transition: box-shadow 0.2s, transform 0.2s;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  text-align: center;

  &:hover {
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    transform: translateY(-3px);
  }
`;

export const UserIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: #fff3cd; /* Cor de fundo amarela suave */
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  text-align: left;

  h3 {
    margin: 0;
    font-size: 1.2em;
    color: #333;
  }

  p {
    margin: 0;
    font-size: 0.9em;
    color: #555;
  }
`;
