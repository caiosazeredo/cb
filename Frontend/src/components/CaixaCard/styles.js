// src/components/CaixaCard/styles.js
import styled from "styled-components";
import { Paper } from "@mui/material";

export const CardContainer = styled(Paper)`
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #ffffff;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  }

  width: 100%;
  max-width: 300px;
  min-width: 250px;
  height: 180px;
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
    color: #fec32e;
  }
`;

export const StatusIndicator = styled.div`
  padding: 8px;
  border-radius: 4px;
  background-color: ${props => props.color}15;
  border: 1px solid ${props => props.color};

  p {
    color: ${props => props.color};
    font-weight: 500;
    margin: 0;
  }
`;