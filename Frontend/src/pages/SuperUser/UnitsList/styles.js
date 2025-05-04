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
