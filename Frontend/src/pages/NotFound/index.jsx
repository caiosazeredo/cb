import { useNavigate } from "react-router-dom";
import { ButtonMui } from "../../components/ButtonMui/ButtonMui";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Container, ErrorIcon, Message, Title } from "./styles";
import AuthContext from "../../helpers/AuthContext";
import { useContext, useEffect } from "react";

function NotFound() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  useEffect(()=>{
    if(!auth.user){
      navigate("/login")
    }
  },[])


  return (
    <Container>
      <ErrorIcon>
        <ErrorOutlineIcon sx={{ fontSize: 120 }}/>
      </ErrorIcon>
      <Title>404 - Página Não Encontrada</Title>
      <Message>
        Desculpe, a página que você está tentando acessar não existe.
      </Message>
      <ButtonMui
        name="Voltar para Home"
        onClick={() => navigate("/")}
        variant="contained"
      />
    </Container>
  );
}

export default NotFound;
