import { useState, useEffect } from 'react';
import Api from "./Api";
import { auth, db } from "../services/Firebase";
import { getDoc, doc } from "firebase/firestore";

import AuthContext from './AuthContext';

// eslint-disable-next-line react/prop-types
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const api = Api();

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken(true);
        const userDocRef = doc(db, "Users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.error("Documento do usuário não encontrado no Firestore!");
          signout();
          return;
        }

        const userFullData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...userDoc.data()
        };

        // Salva token e objeto de usuário
        setToken(token);
        setUserData(userFullData);
        setUser(userFullData);

      } else {
        localStorage.removeItem("authtoken");
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signin = async (email, password) => {
    const data = await api.login(email, password);
    if (data.connect) {
      setUser(data.user);
      setToken(data.token);
      setUserData(data.user);
      return { connect: true, error: "" };
    } else {
      setUser(null);
      setToken("");
      setUserData("");
      return { connect: false, error: data.error };
    }
  };

  const signout = () => {
    //navigate("/login")
    auth.signOut()
      .then(() => {
        setUser(null);
        setToken("");
        setUserData("");
        localStorage.removeItem("authtoken");
      })
      .catch((error) => {
        console.error("Erro ao deslogar:", error);
      });
  };

  const setToken = (token) => {
    localStorage.setItem("authtoken", token);
  };

  const setUserData = (user) => {
    localStorage.setItem("authUser", JSON.stringify(user));
  };

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}