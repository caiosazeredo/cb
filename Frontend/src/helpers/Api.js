// helpers/Api.js
import axios from "axios";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../services/Firebase";
import { getDoc, doc } from "firebase/firestore";

// Definição da URL base da API
const BASEAPI = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

// Criação de uma instância do axios com configurações padrão
const api = axios.create({
  baseURL: BASEAPI,
  timeout: 10000, // 10 segundos
});

// Interceptor para adicionar token de autenticação a todas as requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem('authtoken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros de resposta (incluindo token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Verifica se o erro é 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Token expirado ou inválido
      try {
        // Tenta atualizar o token
        const currentUser = auth.currentUser;
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true);
          localStorage.setItem('authtoken', newToken);

          // Refaz a requisição original com o novo token
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Se não há usuário, limpa o token e rejeita
          localStorage.removeItem('authtoken');
          localStorage.removeItem('authUser');
          return Promise.reject({
            ...error,
            customError: true,
            message: 'Sessão expirada. Por favor, faça login novamente.'
          });
        }
      } catch (refreshError) {
        // Se falhar ao atualizar o token, limpa o token e rejeita
        localStorage.removeItem('authtoken');
        localStorage.removeItem('authUser');
        return Promise.reject({
          ...error,
          customError: true,
          message: 'Sessão expirada. Por favor, faça login novamente.'
        });
      }
    }

    // Para outros erros, apenas rejeita com informações adicionais
    return Promise.reject({
      ...error,
      customError: true,
      message: error.response?.data?.error || 'Erro ao processar requisição'
    });
  }
);

// Função para formatar a resposta da API em um padrão consistente
const formatResponse = (response) => ({
  success: true,
  data: response.data,
  message: response.data.message || 'Operação realizada com sucesso'
});

// Função para formatar o erro em um padrão consistente
const formatError = (error) => ({
  success: false,
  error: error.message || 'Erro ao processar requisição',
  status: error.response?.status || 0
});

// Definição do serviço de API com todos os métodos necessários
const Api = () => {
  return {
    // ==================== AUTENTICAÇÃO ====================
    login: async (email, password) => {
      try {
        const response = await signInWithEmailAndPassword(auth, email, password);

        // Busca o documento do usuário no Firestore, usando o ID do usuário autenticado
        const userId = response.user.uid;
        const userDocRef = doc(db, "Users", userId);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          return {
            connect: false,
            user: null,
            token: '',
            error: "Erro ao estabelecer conexão ao banco de dados.\nTente novamente mais tarde."
          };
        }
        const userData = userDoc.data();
        const token = await response.user.getIdToken();

        const user = {
          uid: response.user.uid,
          email: response.user.email,
          ...userData
        };

        return {
          connect: true,
          user: user,
          token: token,
          error: ''
        };

      } catch (error) {
        console.log("ERROR: ", error);
        let errorMessage = '';

        switch (error.code) {
          case 'auth/wrong-password':
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
            errorMessage = 'Usuário ou senha inválidos.\n Por favor, verifique as informações e tente novamente.';
            break;
          case 'auth/invalid-api-key':
            errorMessage = 'Estamos com um problema técnico no momento. Por favor, tente novamente mais tarde.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'O formato do email informado está inválido. Por favor, verifique e tente novamente.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Não foi possível conectar. Verifique sua conexão com a internet e tente novamente.';
            break;
          default:
            errorMessage = 'Algo deu errado. Por favor, tente novamente mais tarde.';
        }

        return {
          connect: false,
          user: null,
          token: '',
          error: errorMessage
        };
      }
    },

    resetPassword: async (email) => {
      try {
        await sendPasswordResetEmail(auth, email);
        return {
          success: true,
          message: `E-mail para redefinir senha enviado para ${email} com sucesso!`
        };
      } catch (error) {
        console.log("ERROR: ", error);
        let errorMessage = '';
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Não encontramos um usuário com esse e-mail.';
        } else {
          errorMessage = 'Erro ao enviar e-mail de redefinição. Tente novamente mais tarde.';
        }
        return {
          success: false,
          error: errorMessage
        };
      }
    },

    // ==================== UNIDADES ====================
    allUnits: async () => {
      try {
        const response = await api.get('/unidades');
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    getUnit: async (unidadeId) => {
      try {
        const response = await api.get(`/unidades/${unidadeId}`);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    createUnit: async (dadosUnidade) => {
      try {
        const response = await api.post('/unidades', dadosUnidade);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    updateUnit: async (unidadeId, dadosUnidade) => {
      try {
        const response = await api.put(`/unidades/${unidadeId}`, dadosUnidade);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    deleteUnit: async (unidadeId) => {
      try {
        const response = await api.delete(`/unidades/${unidadeId}`);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    // ==================== CAIXAS ====================
    allCaixas: async (unidadeId) => {
      try {
        const response = await api.get(`/unidades/${unidadeId}/caixas`);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    getCaixa: async (unidadeId, caixaId) => {
      try {
        const response = await api.get(`/unidades/${unidadeId}/caixas/${caixaId}`);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    createCaixa: async (unidadeId) => {
      try {
        const response = await api.post(`/unidades/${unidadeId}/caixas`, {});
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    updateCaixa: async (unidadeId, caixaId, dados) => {
      try {
        const response = await api.put(`/unidades/${unidadeId}/caixas/${caixaId}`, dados);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    deleteCaixa: async (unidadeId, caixaId) => {
      try {
        const response = await api.delete(`/unidades/${unidadeId}/caixas/${caixaId}`);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    // ==================== MOVIMENTOS ====================
    getMovements: async (unidadeId, caixaId, data) => {
      try {
        const params = data ? { data } : {};
        const response = await api.get(
          `/unidades/${unidadeId}/caixas/${caixaId}/movimentos`,
          { params }
        );
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    createMovement: async (unidadeId, caixaId, dados) => {
      try {
        const response = await api.post(
          `/unidades/${unidadeId}/caixas/${caixaId}/movimentos`,
          dados
        );
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    deleteMovement: async (unidadeId, caixaId, movimentoId) => {
      try {
        const response = await api.delete(
          `/unidades/${unidadeId}/caixas/${caixaId}/movimentos/${movimentoId}`
        );
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    // ==================== USUÁRIOS ====================
    createUser: async (dadosUsuario) => {
      try {
        const response = await api.post('/usuarios', dadosUsuario);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    getUser: async (userId) => {
      try {
        const response = await api.get(`/usuarios/${userId}`);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    getAllUsers: async () => {
      try {
        const response = await api.get(`/usuarios`);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    // ==================== LOGS ====================
    createLog: async (logData) => {
      try {
        const response = await api.post('/logs', logData);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    updateUser: async (id, dadosUsuario) => {
      try {
        const response = await api.put(`/usuarios/${id}`, dadosUsuario);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    deleteUser: async (id) => {
      try {
        const response = await api.delete(`/usuarios/${id}`);
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    },

    getLogs: async () => {
      try {
        const response = await api.get('/logs');
        return formatResponse(response);
      } catch (error) {
        return formatError(error);
      }
    }
  };
};

export default Api;