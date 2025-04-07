import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BackButtonContainer,
  Container,
  FormContainer,
  FilterContainer,
  LoadingContainer
} from "./styles";
import { InputTextField } from "../../../components/InputTextField/InputTextField";
import { ButtonMui } from "../../../components/ButtonMui/ButtonMui";
import { IconButton, FormControlLabel, Switch, CircularProgress } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Swal from "sweetalert2";

// Importe sua instância de API
import Api from "../../../helpers/Api";

// Importar a biblioteca de máscara
import InputMask from "react-input-mask";

const CreateUnit = () => {
  const navigate = useNavigate();
  const api = Api();

  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    navigate("/");
  };

  const handleAtivoChange = () => {
    if (!ativo) {
      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Tem certeza que deseja ativar esta unidade?",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          setAtivo(true);
        }
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Tem certeza que deseja inativar esta unidade?",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          setAtivo(false);
        }
      });
    }
  };

  // Função para validar campos obrigatórios
  const validarCampos = () => {
    if (!nome.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo obrigatório!",
        text: "O campo Nome da Unidade é obrigatório."
      });
      return false;
    }

    if (!endereco.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo obrigatório!",
        text: "O campo Endereço é obrigatório."
      });
      return false;
    }

    // Verifica se a máscara do telefone está completa (sem underscores)
    if (telefone.includes("_")) {
      Swal.fire({
        icon: "warning",
        title: "Telefone inválido!",
        text: "Preencha o telefone corretamente."
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validarCampos()) return;

    setLoading(true);
    try {
      const dadosUnidade = {
        nome,
        endereco,
        telefone,
        ativo
      };

      const result = await api.createUnit(dadosUnidade);

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Unidade cadastrada!",
          text: `Nome: ${nome}\nEndereço: ${endereco}\nTelefone: ${telefone}\nAtivo: ${ativo ? "Sim" : "Não"}`
        }).then(() => {
          navigate("/");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao cadastrar unidade",
          text: result.error
        });
      }
    } catch (error) {
      console.log("Error: ", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao cadastrar unidade",
        text: "Tente novamente mais tarde."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <BackButtonContainer>
        <IconButton onClick={handleGoBack} sx={{ color: "#f4b400" }}>
          <ArrowBackIosIcon />
        </IconButton>
      </BackButtonContainer>

      <FormContainer onSubmit={handleSubmit}>
        <h1 style={{ margin: 20 }} className="fullWidth">
          Cadastrar Unidade
        </h1>

        <InputTextField
          label="Nome da Unidade"
          value={nome}
          setValue={setNome}
          required
          className="inputStyle"
        />

        <InputTextField
          label="Endereço"
          value={endereco}
          setValue={setEndereco}
          required
          className="inputStyle"
        />

        {/* Telefone com máscara */}
        <InputMask
          mask="(99) 99999-9999"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        >
          {() => (
            <InputTextField
              label="Telefone"
              required
              className="inputStyle"
            />
          )}
        </InputMask>

        <FilterContainer className="fullWidth adminLabel">
          <FormControlLabel
            className="fullWidth adminLabel"
            control={<Switch checked={ativo} onChange={handleAtivoChange} />}
            label="Ativo"
          />
        </FilterContainer>

        <div className="buttonWrapper">
          <ButtonMui
            name="Cancelar"
            variant="cancel"
            onClick={handleGoBack}
            className="inputStyle"
            disabled={loading}
          />
          <ButtonMui
            name="Salvar"
            type="submit"
            className="inputStyle"
            disabled={loading}
            isLoading={loading}
          />
        </div>
      </FormContainer>
    </Container>
  );
};

export default CreateUnit;
