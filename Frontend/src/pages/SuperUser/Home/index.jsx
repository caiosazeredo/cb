import MenuOptionCard from "../../../components/MenuOptionCard";
import { Container, CardList } from "./styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import ListIcon from "@mui/icons-material/List";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import BusinessIcon from "@mui/icons-material/Business";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PeopleIcon from "@mui/icons-material/People";
import HistoryIcon from "@mui/icons-material/History";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ContactPageIcon from '@mui/icons-material/ContactPage';
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
    { icon: ContactPageIcon, text: "Página do Funcionário", link: "/userMenu" },
    /* { icon: HistoryIcon, text: "Histórico de Acesso", link: "/" },
    { icon: HistoryIcon, text: "Histórico de Atividades", link: "/" },
    { icon: LockOpenIcon, text: "Editar/Excluir Acesso a Unidade", link: "/" },
    { icon: PeopleIcon, text: "Listar Acessos a Unidades", link: "/" }, */
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