import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  padding: 20px 20px;
  width: 100%;
  position: relative;
`;

export const BackButtonContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
`;

export const FormContainer = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: 800px;

  .inputStyle {
    max-width: 100%;
    width: 100%;
  }

  .fullWidth {
    grid-column: span 2;
  }

  .buttonWrapper {
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: center;
    width: 100%;
    grid-column: span 2;
    margin-top: 20px;
  }

  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: center;

    .buttonWrapper {
      flex-direction: column;
      width: 100%;
    }
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  gap: 10px;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;
