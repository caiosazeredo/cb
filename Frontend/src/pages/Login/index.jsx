// src/pages/Login/index.jsx
// ARQUIVO SUBSTITUÍDO DIRETAMENTE - NÃO MODIFICAR MANUALMENTE

import { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import {
  Container,
  BoxLogin,
  LogoImage,
  TitlePage,
  BoxTop,
  BoxMiddle
} from "./styles";

import Logo from '../../assets/logo.png';
import { InputTextField } from "../../components/InputTextField/InputTextField";
import { ButtonMui } from "../../components/ButtonMui/ButtonMui";
import AuthContext from "../../helpers/AuthContext";

// Import Firebase auth diretamente
import { auth } from "../../services/Firebase";
import { sendPasswordResetEmail } from "firebase/auth";

function Login() {
  const navigate = useNavigate();
  const { user, signin, loading } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Se o usuário já está logado, redireciona para home
  useEffect(() => {
    if (user) {
      console.log("Usuário já está logado:", user.email);
      navigate('/');
    }
  }, [user, navigate]);

  // Função para login
  const handleSubmitLogin = async (event) => {
    event.preventDefault();
    
    // Validação simples
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Por favor, preencha email e senha.",
        timer: 3000
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Tentando login para:", email);
    
    try {
      // Tenta login através do AuthContext
      const result = await signin(email, password);
      
      if (result.error) {
        console.error("Erro de login:", result.error);
        Swal.fire({
          icon: "error",
          title: "Erro de login",
          text: result.error,
          showConfirmButton: true
        });
      } else {
        console.log("Login bem-sucedido, redirecionando...");
        navigate('/');
      }
    } catch (error) {
      console.error("Erro no processo de login:", error);
      
      Swal.fire({
        icon: "error",
        title: "Erro ao fazer login",
        text: "Ocorreu um erro ao processar seu login. Tente novamente.",
        showConfirmButton: true
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para redefinição de senha
  const handleForgetPasswordSwal = async () => {
    try {
      const { isConfirmed, value: userEmail } = await Swal.fire({
        title: "Redefinir senha",
        input: "text",
        inputValue: email, // Pré-preenche com o email já digitado
        inputLabel: "Informe o seu e-mail",
        inputPlaceholder: "Digite seu e-mail.",
        showCancelButton: true,
        confirmButtonText: "Enviar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#FEC32E",
        cancelButtonColor: "#999999",
        color: "#333333",
        background: "#FFFFFF",
        inputValidator: (value) => {
          if (!value) {
            return "Por favor, insira um e-mail.";
          }
          
          const emailRegex = /\S+@\S+\.\S+/;
          if (!emailRegex.test(value)) {
            return "Por favor, insira um e-mail válido.";
          }
        },
      });

      if (isConfirmed) {
        console.log("Enviando email de recuperação para:", userEmail);
        // Tenta enviar email de redefinição
        await sendPasswordResetEmail(auth, userEmail);
        
        Swal.fire({
          icon: "success",
          title: "E-mail enviado!",
          text: `Um e-mail de redefinição de senha foi enviado para ${userEmail}.`,
          showConfirmButton: true
        });
      }
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error);
      
      let errorMessage = "Erro ao enviar e-mail de recuperação. Tente novamente mais tarde.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "Não foi encontrado um usuário com este e-mail.";
      }
      
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: errorMessage,
        showConfirmButton: true
      });
    }
  };

  // Se estiver carregando a autenticação, mostra mensagem
  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center' }}>Carregando...</div>
      </Container>
    );
  }

  return (
    <Container>
      <BoxLogin>
        <BoxTop>
          <LogoImage src={Logo} alt="Logo" />
          <TitlePage>Entrar</TitlePage>
        </BoxTop>

        <BoxMiddle onSubmit={handleSubmitLogin}>
          <InputTextField
            required
            label={"Email"}
            type="email"
            value={email}
            setValue={setEmail}
          />

          <InputTextField
            required
            showPasswordToggle={true}
            label={"Password"}
            value={password}
            type="password"
            setValue={setPassword}
          />

          <ButtonMui
            onClick={(e) => {
              e.preventDefault();
              handleForgetPasswordSwal();
            }}
            name={"Esqueci minha senha"}
            variant="text"
          />

          <ButtonMui
            name={"ENTRAR"}
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          />
        </BoxMiddle>
      </BoxLogin>
    </Container>
  );
}

export default Login;