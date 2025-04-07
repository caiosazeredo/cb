import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InputMask from "react-input-mask";
import { BackButtonContainer, Container, FilterContainer, FormContainer, LoadingContainer } from "./styles";
import { InputTextField } from "../../../components/InputTextField/InputTextField";
import { ButtonMui } from "../../../components/ButtonMui/ButtonMui";
import Swal from "sweetalert2";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Checkbox, CircularProgress, IconButton } from "@mui/material";
import Api from "../../../helpers/Api";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const EmployeesEditAndRemove = () => {
  const navigate = useNavigate();
  const api = Api();
  const { id } = useParams();

  // Estados para inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [ativo, setAtivo] = useState(false);

  // Estados de loading e lista de unidades
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [unitsList, setUnitsList] = useState([]);

  // Atualiza a lista de unidades selecionadas
  const handleCheckboxChange = (event) => {
    const unitId = event.target.value;
    setSelectedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((unit) => unit !== unitId) : [...prev, unitId]
    );
  };

  // Confirma ao tornar usuário superusuário
  const handleSuperUserChange = () => {
    if (!isSuperUser) {
      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Tem certeza que deseja conceder acesso de Administrador?",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          setIsSuperUser(true);
        }
      });
    } else {
      setIsSuperUser(false);
    }
  };

  // Confirma ao ativar ou inativar usuário
  const handleAtivoChange = () => {
    if (!ativo) {
      // Se está "false" e quer ativar
      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Tem certeza de que deseja ativar este usuário?",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
      }).then((result) => {
        if (result.isConfirmed) {
          setAtivo(true);
        }
      });
    } else {
      // Se está "true" e quer inativar
      Swal.fire({
        icon: "warning",
        title: "Atenção!",
        text: "Tem certeza de que deseja inativar este usuário?",
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

  // Buscar dados do usuário e preencher inputs
  const handleGetUser = async () => {
    try {
      setLoading(true);
      const result = await api.getUser(id); // Chama a API para buscar os dados do usuário
      if (!result.error) {

        // Se veio o usuário, preenche nos estados
        const data = result.data;
        setName(data.name || "");
        setEmail(data.email || "");
        setCpf(data.cpf || "");
        setPhone(data.phone || "");
        setRole(data.role || "");
        setIsSuperUser(data.superusuario || false);
        setSelectedUnits(data.selectedUnits || []);
        setAtivo(data.ativo || false);
      } else {
        console.log("Erro ao buscar usuário:", result.error);
        Swal.fire({
          icon: "error",
          title: "Erro ao buscar usuário",
          text: result.error
        });
        navigate("/employeesList");
      }
    } catch (error) {
      console.log("Error: ", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao buscar usuário",
        text: "Tente novamente mais tarde."
      });
      navigate("/employeesList");
    } finally {
      setLoading(false);
    }
  };

  // Buscar lista de unidades
  const handleAllUnits = async () => {
    try {
      setLoadingList(true);
      setLoading(true);
      const result = await api.allUnits();
      if (!result.error) {
        setUnitsList(result.data);
      } else {
        console.log("Error: ", result.error);
        Swal.fire({
          icon: "error",
          title: "Erro ao se comunicar com banco de dados",
          text: "Tente novamente mais tarde."
        });
        navigate("/employeesList");
      }
    } catch (error) {
      console.log("Error: ", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao se comunicar com banco de dados",
        text: "Tente novamente mais tarde."
      });
      navigate("/employeesList");
    } finally {
      setLoadingList(false);
      setLoading(false);
    }
  };

  // Salvar alterações (ou criar se fosse outro caso)
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validações de formulário
    if (cpf.includes("_")) {
      Swal.fire({ icon: "warning", title: "CPF inválido!", text: "Preencha o CPF corretamente." });
      return;
    }
    if (phone.includes("_")) {
      Swal.fire({ icon: "warning", title: "Telefone inválido!", text: "Preencha o telefone corretamente." });
      return;
    }
    if (!isSuperUser && selectedUnits.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Seleção de Unidade Obrigatória!",
        text: "Usuários não administradores devem selecionar pelo menos uma unidade."
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        cpf,
        phone,
        role,
        isSuperUser,
        selectedUnits,
        ativo
      };
      // Aqui você pode chamar a rota de update
      const result = await api.updateUser(id, payload);

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Usuário atualizado com sucesso!",
        }).then(() => {
          navigate("/employeesList");
        });
      } else {
        Swal.fire({ icon: "error", title: "Erro ao atualizar", text: result.error });
      }
    } catch (error) {
      console.log("Erro ao atualizar:", error);
      Swal.fire({ icon: "error", title: "Erro ao atualizar usuário", text: "Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  //Deletar um usuário
  const handleDelete = async () => {
    // Confirmação
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
      const result = await api.deleteUser(id);
      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Usuário excluído com sucesso!",
        }).then(() => {
          navigate("/employeesList");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao excluir",
          text: result.error
        });
      }
    } catch (error) {
      console.log("Erro ao excluir:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao excluir",
        text: "Tente novamente mais tarde."
      });
    } finally {
      setLoading(false);
    }
  };

  // Voltar para listagem
  const handleGoBack = () => {
    navigate("/employeesList");
  };

  // Ao montar o componente, buscar Unidades e dados do Usuário
  useEffect(() => {
    handleAllUnits();
    handleGetUser();
  }, [id]);

  return (
    <Container>
      <BackButtonContainer>
        <IconButton onClick={handleGoBack} sx={{ color: "#f4b400" }}>
          <ArrowBackIosIcon />
        </IconButton>
      </BackButtonContainer>

      <FormContainer onSubmit={handleSubmit}>
        <h1 style={{ margin: 20 }} className="fullWidth">
          Editar/Excluir Usuário
        </h1>

        <InputTextField
          label="Nome"
          value={name}
          setValue={setName}
          required
          className="inputStyle"
        />

        <InputTextField
          label="Email"
          type="email"
          value={email}
          setValue={setEmail}
          required
          className="inputStyle"
        />

        {/* CPF com máscara */}
        <InputMask
          mask="999.999.999-99"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
        >
          {() => <InputTextField label="CPF" required className="inputStyle" />}
        </InputMask>

        {/* Telefone com máscara */}
        <InputMask
          mask="(99) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        >
          {() => <InputTextField label="Telefone" required className="inputStyle" />}
        </InputMask>

        <InputTextField
          label="Cargo"
          value={role}
          setValue={setRole}
          required
          className="inputStyle"
        />

        <FilterContainer className="fullWidth adminLabel">
          <FormControlLabel
            className="fullWidth adminLabel"
            control={<Switch checked={isSuperUser} onChange={handleSuperUserChange} />}
            label="Administrador"
          />
          <FormControlLabel
            className="fullWidth adminLabel"
            control={<Switch checked={ativo} onChange={handleAtivoChange} />}
            label="Ativo"
          />
        </FilterContainer>

        <h3 className="fullWidth">Selecionar Unidades</h3>

        {loadingList ? (
          <LoadingContainer className="fullWidth">
            <CircularProgress />
          </LoadingContainer>
        ) : (
          <div className="checkboxContainer fullWidth">
            {unitsList.map((unit) => (
              <FormControlLabel
                key={unit.id}
                control={
                  <Checkbox
                    checked={selectedUnits.includes(unit.id)}
                    onChange={handleCheckboxChange}
                    value={unit.id}
                  />
                }
                label={unit.nome}
              />
            ))}
          </div>
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

export default EmployeesEditAndRemove;
