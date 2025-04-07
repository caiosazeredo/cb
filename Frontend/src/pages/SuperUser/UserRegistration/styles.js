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

  .infoBox {
    background-color: #f8f9fa;
    border-left: 4px solid #FEC32E;
    padding: 12px 15px;
    margin: 10px 0;
    border-radius: 4px;
    text-align: left;
    
    p {
      margin: 0;
      font-size: 14px;
      color: #555;
    }
  }

  .checkboxContainer {
    max-width: 100%;
    width: 100%;
    max-height: 200px;
    border: 1px solid #ccc;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 10px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    overflow-y: auto;
    overflow-x: hidden;

    label {
      font-size: 18px;
      font-weight: 500;
    }
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

    .checkboxContainer {
      grid-template-columns: repeat(2, 1fr);
    }

    .buttonWrapper {
      flex-direction: column;
      width: 100%;
    }
  }

  @media (max-width: 400px) {
    .checkboxContainer {
      grid-template-columns: 1fr;
    }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;