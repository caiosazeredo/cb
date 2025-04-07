import { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import { Container, SearchContainer, CardList, BackButtonContainer } from "./styles";
import UnitCard from "../../../components/UnitCard";
import { useNavigate } from "react-router-dom";
import { InputTextField } from "../../../components/InputTextField/InputTextField";
import Api from "../../../helpers/Api";
import AuthContext from "../../../helpers/AuthContext";
import { IconButton, FormControlLabel, Switch, CircularProgress } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const UnitsList = () => {
  const navigate = useNavigate();
  const api = Api();
  const auth = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterActive, setFilterActive] = useState(true);

  const handleAllUnits = async () => {
    try {
      setLoading(true);
      const response = await api.allUnits();
      if (response.success) {
        // Aqui, mantemos todos os dados, sem filtrar por ativo (pois o switch fará esse filtro)
        const unidadesFormatadas = response.data
          .map(unit => ({
            id: unit.id,
            name: unit.nome,
            address: unit.endereco,
            telefone: unit.telefone,
            ativo: unit.ativo
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setUnits(unidadesFormatadas);
      } else {
        if (response.error === "Autenticação necessária. Por favor, faça login novamente.") {
          auth.signout();
          Swal.fire({
            icon: "warning",
            title: response.error,
            showConfirmButton: true
          }).then(() => {
            navigate("/login");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: response.error,
            showConfirmButton: true
          });
        }
      }
    } catch (error) {
      console.log("Error: ", error);
      setError("Não foi possível carregar as unidades. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAllUnits();
  }, []);

  const filteredUnits = units.filter((unit) => {
    const termo = search.toLowerCase();
    const matchSearch =
      unit.name.toLowerCase().includes(termo) ||
      unit.address.toLowerCase().includes(termo) ||
      unit.telefone.toLowerCase().includes(termo);
    const matchActive = filterActive ? unit.ativo : true;
    return matchSearch && matchActive;
  });

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container>
      <BackButtonContainer>
        <IconButton onClick={handleGoHome} sx={{ color: "#f4b400" }}>
          <ArrowBackIosIcon />
        </IconButton>
      </BackButtonContainer>
      <h1 style={{ margin: 20 }}>Listar Unidades</h1>
      
      <SearchContainer>
        <InputTextField
          required
          label="Unidade"
          type="text"
          value={search}
          setValue={setSearch}
          className="searchItem"
        />
      </SearchContainer>

      {/* Switch para filtrar unidades ativas */}
      <FormControlLabel
        control={
          <Switch
            checked={filterActive}
            onChange={() => setFilterActive(!filterActive)}
            color="warning"
          />
        }
        label="Mostrar apenas unidades ativas"
      />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <CircularProgress color="warning" />
        </div>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <CardList>
          {filteredUnits.length > 0 ? (
            filteredUnits.map((unit) => (
              <UnitCard
                key={unit.id}
                name={unit.name}
                address={unit.address}
                telefone={unit.telefone}
                ativo={unit.ativo}
                onClick={()=>{navigate(`/unitEditAndRemove/${unit.id}`)}}
              />
            ))
          ) : (
            <p>Nenhuma unidade encontrada com esse termo.</p>
          )}
        </CardList>
      )}
    </Container>
  );
};

export default UnitsList;
