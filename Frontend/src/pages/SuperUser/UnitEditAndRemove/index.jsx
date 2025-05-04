import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { IconButton, Switch, FormControlLabel, CircularProgress } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import InputMask from "react-input-mask";
import Swal from "sweetalert2";

import Api from "../../../helpers/Api";
import { InputTextField } from "../../../components/InputTextField/InputTextField";
import { ButtonMui } from "../../../components/ButtonMui/ButtonMui";

import {
  Container,
  BackButtonContainer,
  FormContainer,
  FilterContainer,
  LoadingContainer
} from "./styles";

const UnitEditAndRemove = () => {
  const navigate = useNavigate();
  const api = Api();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [ativo, setAtivo] = useState(false);

  // Estados de loading
  const [loading, setLoading] = useState(false);

  // Ao clicar em "Voltar"
  const handleGoBack = () => {
    navigate("/unitsList");
  };

  // Busca dados da unidade para preencher o formulário
  const handleGetUnit = async () => {
    try {
      setLoading(true);
      const result = await api.getUnit(id); // Ex: GET /unidades/:id
      if (result.success) {
        const data = result.data;
        setNome(data.nome || "");
        setEndereco(data.endereco || "");
        setTelefone(data.telefone || "");
        setAtivo(data.ativo || false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao buscar unidade",
          text: result.error
        });
        navigate("/unitsList");
      }
    } catch (error) {
      console.error("Erro ao buscar unidade:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao buscar unidade",
        text: "Tente novamente mais tarde."
      });
      navigate("/unitsList");
    } finally {
      setLoading(false);
    }
  };

  // Confirma ao ativar ou inativar a unidade
  const handleAtivoChange = () => {
    if (!ativo) {
      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Tem certeza de que deseja ativar esta unidade?",
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
        text: "Tem certeza de que deseja inativar esta unidade?",
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

  // Ao enviar o formulário (atualizar a unidade)
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validação do telefone
    if (telefone.includes("_")) {
      Swal.fire({
        icon: "warning",
        title: "Telefone inválido!",
        text: "Preencha o telefone corretamente."
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome,
        endereco,
        telefone,
        ativo
      };
      // Ajuste para o método de atualização que você tiver na API
      const result = await api.updateUnit(id, payload);

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Unidade atualizada com sucesso!",
        }).then(() => {
          navigate("/unitsList");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao atualizar unidade",
          text: result.error
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar unidade:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao atualizar unidade",
        text: "Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  // Deletar unidade
  const handleDelete = async () => {
    const resultConfirm = await Swal.fire({
      icon: "warning",
      title: "Confirma exclusão?",
      text: "Esta ação não pode ser desfeita.",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });
    if (!resultConfirm.isConfirmed) return;

    setLoading(true);
    try {
      // Ajuste para o método de exclusão que você tiver na API
      const result = await api.deleteUnit(id);
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Unidade excluída com sucesso!",
        }).then(() => {
          navigate("/unitsList");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao excluir unidade",
          text: result.error
        });
      }
    } catch (error) {
      console.error("Erro ao excluir unidade:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao excluir unidade",
        text: "Tente novamente mais tarde."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetUnit();
  }, [id]);

  return (
    <Container>
      {/* Botão de Voltar */}
      <BackButtonContainer>
        <IconButton onClick={handleGoBack} sx={{ color: "#f4b400" }}>
          <ArrowBackIosIcon />
        </IconButton>
      </BackButtonContainer>

      {/* Formulário */}
      <FormContainer onSubmit={handleSubmit}>
        <h1 style={{ margin: 20 }} className="fullWidth">
          Editar/Excluir Unidade
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
          {() => <InputTextField label="Telefone" required className="inputStyle" />}
        </InputMask>

        {/* Switch para marcar se está ativa ou não */}
        <FilterContainer className="fullWidth adminLabel">
          <FormControlLabel
            className="fullWidth adminLabel"
            control={<Switch checked={ativo} onChange={handleAtivoChange} />}
            label="Ativo"
          />
        </FilterContainer>

        {/* Loading Spinner (opcional) */}
        {loading && (
          <LoadingContainer className="fullWidth">
            <CircularProgress />
          </LoadingContainer>
        )}

        <div className="buttonWrapper">
          <ButtonMui
            name="Cancelar"
            variant="cancel"
            onClick={handleGoBack}
            disabled={loading}
            className="inputStyle"
          />
          <ButtonMui
            name="Excluir"
            variant="cancel"
            onClick={handleDelete}
            disabled={loading}
            className="inputStyle"
          />
          <ButtonMui
            name="Salvar"
            type="submit"
            disabled={loading}
            isLoading={loading}
            className="inputStyle"
          />
        </div>
      </FormContainer>
    </Container>
  );
};

export default UnitEditAndRemove;
