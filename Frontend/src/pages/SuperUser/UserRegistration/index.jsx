import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import { Container, BackButtonContainer, FormContainer, LoadingContainer } from "./styles"; // Import atualizado
import { InputTextField } from "../../../components/InputTextField/InputTextField";
import { ButtonMui } from "../../../components/ButtonMui/ButtonMui";
import Swal from "sweetalert2";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Checkbox, CircularProgress, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Api from "../../../helpers/Api";
import AuthContext from "../../../helpers/AuthContext";

const UserRegistration = () => {
  const navigate = useNavigate();
  const api = Api();
  const { user } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [unitsList, setUnitsList] = useState([]);

  const handleCheckboxChange = (event) => {
    const id = event.target.value;
    setSelectedUnits((prev) =>
      prev.includes(id) ? prev.filter((unit) => unit !== id) : [...prev, id]
    );
  };

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

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      const result = await api.createUser({
        uuidCriador: user.uid ? user.uid : '',
        name,
        email,
        cpf,
        phone,
        role,
        isSuperUser,
        selectedUnits
      });

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Usuário cadastrado com sucesso!",
          html: `
            <p>Forneça esta senha provisória ao usuário:</p>
            <div style="margin: 15px; padding: 15px; background: #f5f5f5; border-left: 3px solid #FEC32E; text-align: center; font-size: 20px; letter-spacing: 1px; font-family: monospace;">
              <strong>${result.data.senhaProvisoria}</strong>
            </div>
            <small style="display: block; text-align: left; color: #666; margin-top: 5px;">
              Esta senha atende aos requisitos de segurança do sistema.
            </small>
            <p>O usuário será solicitado a alterar esta senha no primeiro login.</p>
          `,
          confirmButtonText: "Ok, entendi"
        }).then(() => {
          navigate("/");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erro ao cadastrar usuário",
          text: result.error
        });
      }
    } catch (error) {
      console.log("Erro no cadastro:", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao cadastrar usuário",
        text: "Tente novamente mais tarde."
      });
    } finally {
      setLoading(false);
    }
  };

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
        navigate("/");
      }
    } catch (error) {
      console.log("Error: ", error);
      Swal.fire({
        icon: "error",
        title: "Erro ao se comunicar com banco de dados",
        text: "Tente novamente mais tarde."
      });
      navigate("/");
    } finally {
      setLoadingList(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAllUnits();
  }, []);

  return (
    <Container>
      <BackButtonContainer>
        <IconButton onClick={() => navigate("/")} sx={{ color: "#f4b400" }}>
          <ArrowBackIosIcon />
        </IconButton>
      </BackButtonContainer>
      <FormContainer onSubmit={handleSubmit}>
        <h1 style={{ margin: 20 }} className="fullWidth">
          Cadastrar Usuário
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

        <FormControlLabel
          className="fullWidth adminLabel"
          control={<Switch checked={isSuperUser} onChange={handleSuperUserChange} />}
          label="Administrador"
        />

        <div className="fullWidth infoBox">
          <p>Uma senha aleatória será gerada e enviada para o e-mail do usuário junto com as instruções de acesso.</p>
        </div>

        <h3 className="fullWidth">Selecionar Unidades</h3>
        {loadingList && (
          <LoadingContainer className="fullWidth">
            <CircularProgress />
          </LoadingContainer>
        )}
        {!loadingList && (
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
            onClick={() => navigate("/")} 
            disabled={loading} 
            className="inputStyle" 
          />
          <ButtonMui 
            name="Cadastrar" 
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

export default UserRegistration;