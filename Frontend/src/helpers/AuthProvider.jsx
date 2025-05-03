// src/helpers/AuthProvider.jsx
// ARQUIVO SUBSTITUÍDO DIRETAMENTE - NÃO MODIFICAR MANUALMENTE

import { useState, useEffect } from 'react';
import { auth, db } from "../services/Firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

import AuthContext from './AuthContext';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effect para lidar com a mudança de estado de autenticação
  useEffect(() => {
    console.log("AuthProvider inicializado");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Estado de autenticação alterado:", firebaseUser ? "Logado" : "Deslogado");
      
      if (firebaseUser) {
        try {
          // Usuário logado, buscar dados adicionais no Firestore
          const token = await firebaseUser.getIdToken(true);
          console.log("Token obtido para usuário:", firebaseUser.uid);
          
          // Tentar buscar dados nas coleções 'users' e 'Users'
          let userData = null;
          let collection = "";
          
          try {
            // Tentar primeira coleção (users - minúsculo)
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              userData = userDoc.data();
              collection = "users";
              console.log("Documento encontrado na coleção 'users'");
            } else {
              // Tentar segunda coleção (Users - maiúsculo)
              const userDocRefCap = doc(db, "Users", firebaseUser.uid);
              const userDocCap = await getDoc(userDocRefCap);
              
              if (userDocCap.exists()) {
                userData = userDocCap.data();
                collection = "Users";
                console.log("Documento encontrado na coleção 'Users'");
              }
            }
          } catch (docError) {
            console.error("Erro ao buscar documento do usuário:", docError);
          }

          if (!userData) {
            console.warn("Documento do usuário não encontrado no Firestore!");
            await signOut(auth);
            setUser(null);
            localStorage.removeItem("authtoken");
            localStorage.removeItem("authUser");
          } else {
            // Dados encontrados, montar objeto de usuário completo
            const userFullData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData,
              _collection: collection // Para debug
            };

            // Salvar token e dados
            localStorage.setItem("authtoken", token);
            localStorage.setItem("authUser", JSON.stringify(userFullData));
            setUser(userFullData);
            console.log("Usuário autenticado com sucesso:", userFullData.email);
          }
        } catch (error) {
          console.error("Erro no processo de autenticação:", error);
          await signOut(auth);
          setUser(null);
          localStorage.removeItem("authtoken");
          localStorage.removeItem("authUser");
        }
      } else {
        // Usuário deslogado
        localStorage.removeItem("authtoken");
        localStorage.removeItem("authUser");
        setUser(null);
        console.log("Usuário deslogado");
      }
      
      setLoading(false);
    });

    // Cleanup function para remover o listener quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  // Função de login
  const signin = async (email, password) => {
    console.log("Tentando login para:", email);
    try {
      // Autenticação direta com Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login bem-sucedido com Firebase Auth!");
      
      // O listener onAuthStateChanged vai cuidar de buscar os dados do usuário
      // e atualizar o estado, então não precisamos fazer isso aqui.
      
      return { connect: true, error: "" };
    } catch (error) {
      console.error("Erro de login:", error.code, error.message);
      
      let errorMessage = "";
      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
        case 'auth/invalid-email':
          errorMessage = 'Email ou senha inválidos. Por favor, verifique suas credenciais.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          break;
        default:
          errorMessage = 'Ocorreu um erro durante o login. Tente novamente mais tarde.';
      }
      
      return { connect: false, error: errorMessage };
    }
  };

  // Função de logout
  const signout = async () => {
    console.log("Iniciando logout");
    try {
      await signOut(auth);
      // O listener onAuthStateChanged vai cuidar de limpar os dados
      console.log("Logout bem-sucedido");
      return true;
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      return false;
    }
  };

  if (loading) {
    // Você pode adicionar um componente de loading aqui se desejar
    console.log("AuthProvider carregando...");
    return <div>Carregando autenticação...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, signin, signout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}