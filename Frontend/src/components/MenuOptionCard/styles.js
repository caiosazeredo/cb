import styled from "styled-components";
import { Paper } from "@mui/material";

export const CardContainer = styled(Paper)`
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #ffffff;
  border-radius: 12px;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  }

  width: 100%;
  max-width: 300px;
  min-width: 250px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;

  @media (max-width: 768px) {
    height: 120px;
  }
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
`;

export const CardIcon = styled.div`
  margin-bottom: 8px;
  display: flex;
  justify-content: center;

  svg {
    font-size: 64px;
    color: #fec32e;
    
    @media (max-width: 768px) {
      font-size: 32px;
    }
  }
`;
