// src/Routes.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import { useContext, useEffect } from "react";

import { RequireAuth } from "./helpers/RequireAuth";
import AuthContext from "./helpers/AuthContext";

//super usuario
import HomeS from "./pages/SuperUser/Home/index.jsx";
import UserRegistration from "./pages/SuperUser/UserRegistration";
import EmployeesList from "./pages/SuperUser/EmployeesList";
import EmployeesEditAndRemove from "./pages/SuperUser/EmployeesEditAndRemove";
import UnitsList from "./pages/SuperUser/UnitsList";
import CreateUnit from "./pages/SuperUser/CreateUnit";
import UnitEditAndRemove from "./pages/SuperUser/UnitEditAndRemove";
//usuario
import Home from "./pages/User/Home";
import Caixas from "./pages/User/Caixas/index.jsx";
import Movimentacao from "./pages/User/Movimentacao";
//geral
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Header from "./components/Header";

export const AllRoutes = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Atualiza a lista de rotas que exibem o Header
  const headerRoutes = [
    "/",
    "/unidade/:id",
    "/unidade/:unidadeId/caixas",
    "/unidade/:unidadeId/caixa/:caixaId/movimentacao",
    "/userRegistration",
    "/employeesList",
    "/unitsList",
    "/createUnit",
    "/employeesEditAndRemove/:id",
    "/userMenu"
  ];

  // Verifica se deve mostrar o header baseado no padrão da rota atual
  const shouldShowHeader = user && headerRoutes.some(route => {
    const routePattern = new RegExp(
      `^${route.replace(/:[^\s/]+/g, '[^\\s/]+')}$`
    );
    return routePattern.test(location.pathname);
  });

  useEffect(() => {
    if (user) {
      if (user.superusuario) {
        console.log("SOU SUPER USUÁRIO")
      } else {
        console.log("NÃO SOU SUPER")
      }
      console.log("USEEER: ", user)
    }
  }, [user])

  return (
    <>
      {shouldShowHeader && <Header />}
      <Routes>

        {/* Rotas super usuário */}
        {user && user.superusuario &&
          <>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <HomeS />
                </RequireAuth>
              }
            />
            <Route
              path="/userRegistration"
              element={
                <RequireAuth>
                  <UserRegistration />
                </RequireAuth>
              }
            />
            <Route
              path="/employeesList"
              element={
                <RequireAuth>
                  <EmployeesList />
                </RequireAuth>
              }
            />
            <Route
              path="/unitsList"
              element={
                <RequireAuth>
                  <UnitsList />
                </RequireAuth>
              }
            />
            <Route
              path="/createUnit"
              element={
                <RequireAuth>
                  <CreateUnit />
                </RequireAuth>
              }
            />
            <Route
              path="/employeesEditAndRemove/:id"
              element={
                <RequireAuth>
                  <EmployeesEditAndRemove />
                </RequireAuth>
              }
            />
            <Route
              path="/unitEditAndRemove/:id"
              element={
                <RequireAuth>
                  <UnitEditAndRemove />
                </RequireAuth>
              }
            />
            <Route
              path="/userMenu"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
          </>
        }

        {/* Rotas usuário */}
        {user && !user.superusuario &&
          <>
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
          </>
        }

        <Route
          path="/unidade/:unidadeId/caixas"
          element={
            <RequireAuth>
              <Caixas />
            </RequireAuth>
          }
        />
        <Route
          path="/unidade/:unidadeId/caixa/:caixaId/movimentacao"
          element={
            <RequireAuth>
              <Movimentacao />
            </RequireAuth>
          }
        />
        {/* Rotas */}
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </>
  );
};