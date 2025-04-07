import MenuOptionCard from "../../../components/MenuOptionCard";
import { Container, CardList } from "./styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import { useNavigate } from "react-router-dom";

const HomeS = () => {
  const navigate = useNavigate();

  const menuOptions = [
    { icon: DashboardIcon, text: "Dashboard", link: "/" },  
    { icon: PersonAddIcon, text: "Cadastrar Funcionário", link: "/userRegistration" },
    { icon: PeopleIcon, text: "Listar Funcionários", link: "/employeesList" },
    { icon: AddBusinessIcon, text: "Cadastrar Unidade", link: "/createUnit" },
    { icon: StorefrontIcon, text: "Listar Unidades", link: "/unitsList" },
    { icon: AssessmentIcon, text: "Relatórios", link: "/" },
    // Novo card para acessar unidades como usuário normal
    { icon: PointOfSaleIcon, text: "Acessar Caixas", link: "/unidades" },
  ];

  return (
    <Container>
      <h1>Administrador</h1>
      <CardList>
        {menuOptions.map((option, index) => (
          <MenuOptionCard
            key={index}
            icon={<option.icon />}
            text={option.text}
            onClick={() => {
              if(option.text === "Dashboard" || option.text === "Relatórios"){
                alert("Página em construção")
                return
              }
              navigate(option.link)
            }}
          />
        ))}
      </CardList>
    </Container>
  );
};

export default HomeS;