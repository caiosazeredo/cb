import { useState, useEffect, useContext } from "react";
import Swal from 'sweetalert2';
import { Container, SearchContainer, CardList } from "./styles";
import UnitCard from "../../../components/UnitCard";
import { useNavigate } from "react-router-dom";
import { InputTextField } from "../../../components/InputTextField/InputTextField";
import Api from "../../../helpers/Api";
import AuthContext from "../../../helpers/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const api = Api();
  const auth = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleAllUnits = async () => {
    try {
      setLoading(true);
      const response = await api.allUnits();
      if (response.success) {
        const unidadesFormatadas = response.data
          .filter(unit => unit.ativo)
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
        if (response.error === 'Autenticação necessária. Por favor, faça login novamente.') {
          auth.signout();
          Swal.fire({
            icon: 'warning',
            title: response.error,
            showConfirmButton: true,
          }).then(() => {
            navigate('/login');
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: response.error,
            showConfirmButton: true,
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

  // Filtra as unidades com base no termo de busca
  const filteredUnits = units.filter(
    (unit) =>
      unit.name.toLowerCase().includes(search.toLowerCase()) ||
      unit.address.toLowerCase().includes(search.toLowerCase()) ||
      unit.telefone.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <p>Carregando unidades...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <p style={{ color: 'red' }}>{error}</p>
      </Container>
    );
  }

  return (
    <Container>
      <SearchContainer>
        <InputTextField
          required
          label={"Unidade"}
          type="text"
          value={search}
          setValue={setSearch}
          className={"searchItem"}
        />
      </SearchContainer>

      <CardList>
        {filteredUnits.map((unit) => (
          <UnitCard
            key={unit.id}
            name={unit.name}
            address={unit.address}
            telefone={unit.telefone}
            ativo={unit.ativo}
            onClick={() => navigate(`/unidade/${unit.id}/caixas`)}
          />
        ))}
        {filteredUnits.length === 0 && (
          <p>Nenhuma unidade encontrada com esse termo.</p>
        )}
      </CardList>
    </Container>
  );
};

export default Home;