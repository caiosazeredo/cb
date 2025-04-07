import { useEffect, useState } from "react";
import { Container, SearchContainer, CardList, FilterContainer, BackButtonContainer } from "./styles";
import { InputTextField } from "../../../components/InputTextField/InputTextField";
import EmployeeCard from "../../../components/EmployeeCard";
import { CircularProgress, FormControlLabel, Switch, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Api from "../../../helpers/Api";

const EmployeesList = () => {
  const navigate = useNavigate();
  const api = Api();

  const [search, setSearch] = useState("");
  const [filterSuperUser, setFilterSuperUser] = useState(false);
  const [filterActiveUser, setFilterActiveUser] = useState(true);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtra os funcionários de acordo com o termo de busca e o filtro de superusuário
  const filteredEmployees = funcionarios.filter((func) => {
    const termo = search.toLowerCase();
    return (
      (func.name?.toLowerCase().includes(termo) ||
        func.email?.toLowerCase().includes(termo) ||
        func.phone?.toLowerCase().includes(termo) ||
        func.role?.toLowerCase().includes(termo) ||
        func.cpf?.replace(/\D/g, "").includes(termo)) &&
      (!filterSuperUser || func.superusuario) &&
      (!filterActiveUser || func.ativo) 
    );
  });

  const handleAllUsers = async () => {
    try {
      setLoading(true);
      const result = await api.getAllUsers(); // Chama o endpoint /usuarios
      if (!result.error) {
        setFuncionarios(result.data);
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
      setLoading(false);
    }
  };

  // Ao montar o componente, buscamos os usuários
  useEffect(() => {
    handleAllUsers();
  }, []);

  // Função para voltar à página Home
  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container>
      {/* Botão de Voltar */}
      <BackButtonContainer>
        <IconButton onClick={handleGoHome} sx={{ color: "#f4b400" }}>
          <ArrowBackIosIcon />
        </IconButton>
      </BackButtonContainer>

      <h2>Lista de Funcionários</h2>

      <SearchContainer>
        <InputTextField
          required
          label="Buscar funcionário"
          type="text"
          value={search}
          setValue={setSearch}
          className="searchItem"
          placeholder="Digite nome, e-mail, telefone, CPF..."
        />
      </SearchContainer>

      <FilterContainer>
        <FormControlLabel
          control={
            <Switch
              checked={filterSuperUser}
              onChange={() => setFilterSuperUser(!filterSuperUser)}
              color="warning"
            />
          }
          label="Mostrar apenas superusuários"
        />
        <FormControlLabel
          control={
            <Switch
              checked={filterActiveUser}
              onChange={() => setFilterActiveUser(!filterActiveUser)}
              color="warning"
            />
          }
          label="Mostrar apenas uauários ativos"
        />
      </FilterContainer>

      {loading ? (
        // Mostra um loading enquanto os dados estão sendo carregados
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress color="warning" />
        </div>
      ) : (
        <CardList>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((func) => (
              <EmployeeCard key={func.id} funcionario={func} onClick={()=>{navigate(`/employeesEditAndRemove/${func.id}`)}}/>
            ))
          ) : (
            <p>Nenhum funcionário encontrado com este termo.</p>
          )}
        </CardList>
      )}
    </Container>
  );
};

export default EmployeesList;
