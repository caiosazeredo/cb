import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  padding: 50px 20px;
  width: 100%;
  position: relative; /* para posicionar o botão em relação ao container */
`;

export const BackButtonContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
`;

export const SearchContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  gap: 20px;
  margin-block: 20px;

  .searchItem {
    max-width: 350px;
    width: 100%;
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;

  @media (max-width: 690px) {
    flex-direction: column;
  }
`;

export const CardList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(250px, 1fr));
  gap: 25px;
  justify-items: center;
  width: 100%;
  max-width: 1300px;
  padding: 20px;

  @media (max-width: 1450px) {
    grid-template-columns: repeat(3, minmax(250px, 1fr));
  }

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(250px, 1fr));
  }

  @media (max-width: 690px) {
    grid-template-columns: repeat(1, minmax(250px, 1fr));
  }
`;
