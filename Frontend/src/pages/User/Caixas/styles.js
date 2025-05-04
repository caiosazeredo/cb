import styled from "styled-components";

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

export const BackButtonContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
`;

export const SearchContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin-bottom: 20px;
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  .searchItem {
    max-width: 350px;
    width: 100%;
  }
`;

export const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
`;

export const LoadingMessage = styled.p`
  font-size: 18px;
  font-weight: bold;
  color: #666;
`;

export const ErrorMessage = styled.p`
  font-size: 18px;
  font-weight: bold;
  color: red;
`;
