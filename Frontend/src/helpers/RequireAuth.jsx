import { useContext } from 'react'
import { Navigate } from 'react-router-dom';
import AuthContext from '../helpers/AuthContext';
//import Login from '../pages/Login.jsx';
// eslint-disable-next-line react/prop-types
export const RequireAuth = ({ children }) => {
  const auth = useContext(AuthContext);
  if (auth.user === null) {
    return <Navigate to="/login" />;
  }
  return children;
}