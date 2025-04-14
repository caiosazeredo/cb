// src/pages/SuperUser/Reports/styles.js
import styled from "styled-components";
import { Paper } from "@mui/material";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  padding: 50px 20px;
  width: 100%;
  position: relative;
`;

export const FilterSection = styled(Paper)`
  padding: 24px;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 30px;
`;

export const ReportContainer = styled(Paper)`
  padding: 24px;
  width: 100%;
  max-width: 1200px;
  margin-top: 20px;
  margin-bottom: 50px;
`;

export const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  margin: 20px 0;
`;

export const ReportCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  margin: 20px 0;
`;

export const ReportCard = styled(Paper)`
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
`;

export const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
`;