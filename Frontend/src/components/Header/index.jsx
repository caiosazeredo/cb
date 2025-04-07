import { useContext } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HomeIcon from '@mui/icons-material/Home';

import { Container, RightSection } from "./styles";
import { IconButtonMui } from "../IconButtonMui";
import AuthContext from "../../helpers/AuthContext";
import { useNavigate } from "react-router-dom";


const Header = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();


  return (
    <Container>
      {/* Aqui você pode adicionar um título, logo ou navegação */}

      {/* Ícones alinhados à direita */}
      <RightSection>
        {/* Comentei esses dois para não ter a certeza de implementar essa parte */}
        {/* <IconButtonMui
          icon={<NotificationsIcon />}
          color="default"
          onClick={() => console.log("Notificações clicado")}
        />
        <IconButtonMui
          icon={<AccountCircleIcon />}
          color="default"
          onClick={() => console.log("Conta clicada")}
        /> */}
        <IconButtonMui
          icon={<HomeIcon />}
          color="default"
          onClick={() => navigate("/")}
        />
        <IconButtonMui
          icon={<SettingsIcon />}
          color="default"
          onClick={() => alert("Tela de configuração em construção!\nOutros botões estão funcionando!")}
        />
        
        <IconButtonMui
          icon={<ExitToAppIcon />}
          color="error"
          onClick={async () => { 
            await auth.signout();
            navigate('/login')
          }}
        />
      </RightSection>
    </Container>
  );
};

export default Header;
