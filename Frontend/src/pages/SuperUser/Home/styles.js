import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  flex: 1;
  padding: 50px 20px;
  width: 100%;
  
  .section-title {
    margin-top: 40px;
    margin-bottom: 20px;
    color: #333;
    position: relative;
    width: 100%;
    max-width: 1200px;
    text-align: left;
    padding-left: 20px;
    
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 70%;
      background-color: #FEC32E;
      border-radius: 3px;
    }
  }
`;

export const CardList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 30px;
`;