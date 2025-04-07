import { useContext, useState } from "react";
import Swal from "sweetalert2";

import {
  Container,
  BoxLogin,
  LogoImage,
  TitlePage,
  BoxTop,
  BoxMiddle
} from "./styles";
import { useNavigate } from "react-router-dom";

import Logo from '../../assets/logo.png';
import { InputTextField } from "../../components/InputTextField/InputTextField";
import { ButtonMui } from "../../components/ButtonMui/ButtonMui";
import AuthContext from "../../helpers/AuthContext";

import Api from "../../helpers/Api";




function Login() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const api = Api();



  const [email, setEmail] = useState("lfalmeida97@gmail.com");
  const [password, setPassword] = useState("123456");

  const [loading, setLoading] = useState(false);


  const handleSubmitLogin = async (event) => {
    event.preventDefault();
    setLoading(true)
    try {
      const json = await auth.signin(email, password);
      if (json.error) {
        Swal.fire({
          icon: "error",
          title: json.error,
          showConfirmButton: false,
          timer: 3000
        });
      } else {
        navigate('/')
      }
    } catch (error) {
      alert("ERROR: ", error)
    } finally {
      setLoading(false)
    }
  };

  const handleForgetPasswordSwal = async () => {
    const { isConfirmed, value: email } = await Swal.fire({
      title: "Redefinir senha",
      input: "text",
      inputLabel: "Informe o seu e-mail",
      inputPlaceholder: "Digite seu e-mail.",
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cancelar",

      //ajuste de cores
      confirmButtonColor: "#FEC32E",
      cancelButtonColor: "#999999",
      color: "#333333",
      background: "#FFFFFF",


      //verificação de dado do input
      inputValidator: (value) => {
        // Verifica se está vazio
        if (!value) {
          return "Por favor, insira um e-mail.";
        }
        // Verifica se o texto corresponde ao formato de um e-mail
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(value)) {
          return "Por favor, insira um e-mail válido.";
        }
      },
    });

    if (isConfirmed) {

      const handleSubmitForgetPassword = async (email) => {
        try {
          const json = await api.resetPassword(email);
          if (json.error) {
            Swal.fire({
              icon: "error",
              title: json.error,
              showConfirmButton: true,
            });
          } else {
            Swal.fire({
              icon: "success",
              title: json.message,
              showConfirmButton: false,
              timer: 3000,
            });
          }
        } catch (error) {
          console.log("Error: ", error)
          Swal.fire({
            icon: "error",
            title: "Erro ao se comunicar ao banco de dados.\nTente novamente mais tarde.",
            showConfirmButton: true,
          });
        }
      };

      await handleSubmitForgetPassword(email)

      // 'email' contém o valor digitado pelo usuário
      Swal.fire("Ótimo!", `E-mail encaminhado para ${email}.`, "success");
    }
  };



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
            onClick={() => handleForgetPasswordSwal()} //setOpenModal(true)}
            name={"Esqueci minha senha"}
            variant="text"
          />

          <ButtonMui
            name={"ENTRAR"}
            type="submit"
            disabled={loading}
            isLoading={loading}
          />

          {/* <ButtonMui
            name={"CADASTRAR"}
            variant="outlined"
            onClick={() => navigate('/signUp')}
            disabled={loading}
          /> */}

        </BoxMiddle>
      </BoxLogin>

    </Container>
  );
}

export default Login;