// src/helpers/Api.js
import FirebaseService from "../services/Firebase";

// This is a wrapper around the Firebase service
// It keeps the same API interface but uses Firebase directly
const Api = () => {
  const firebaseService = FirebaseService();
  
  return {
    // ==================== AUTENTICAÇÃO ====================
    login: async (email, password) => {
      return await firebaseService.login(email, password);
    },

    resetPassword: async (email) => {
      return await firebaseService.resetPassword(email);
    },

    signout: async () => {
      return await firebaseService.signout();
    },

    // ==================== UNIDADES ====================
    allUnits: async () => {
      return await firebaseService.allUnits();
    },

    getUnit: async (unidadeId) => {
      return await firebaseService.getUnit(unidadeId);
    },

    createUnit: async (dadosUnidade) => {
      return await firebaseService.createUnit(dadosUnidade);
    },

    updateUnit: async (unidadeId, dadosUnidade) => {
      return await firebaseService.updateUnit(unidadeId, dadosUnidade);
    },

    deleteUnit: async (unidadeId) => {
      return await firebaseService.deleteUnit(unidadeId);
    },

    // ==================== CAIXAS ====================
    allCaixas: async (unidadeId) => {
      return await firebaseService.allCaixas(unidadeId);
    },

    getCaixa: async (unidadeId, caixaId) => {
      return await firebaseService.getCaixa(unidadeId, caixaId);
    },

    createCaixa: async (unidadeId) => {
      return await firebaseService.createCaixa(unidadeId);
    },

    updateCaixa: async (unidadeId, caixaId, dados) => {
      return await firebaseService.updateCaixa(unidadeId, caixaId, dados);
    },

    deleteCaixa: async (unidadeId, caixaId) => {
      return await firebaseService.deleteCaixa(unidadeId, caixaId);
    },

    // ==================== MOVIMENTOS ====================
    getMovements: async (unidadeId, caixaId, data) => {
      return await firebaseService.getMovements(unidadeId, caixaId, data);
    },

    createMovement: async (unidadeId, caixaId, dados) => {
      return await firebaseService.createMovement(unidadeId, caixaId, dados);
    },

    deleteMovement: async (unidadeId, caixaId, movimentoId) => {
      return await firebaseService.deleteMovement(unidadeId, caixaId, movimentoId);
    },
    
    createMovementsBatch: async (unidadeId, caixaId, listaDeMovimentos) => {
      return await firebaseService.createMovementsBatch(unidadeId, caixaId, listaDeMovimentos);
    },

    // ==================== USUÁRIOS ====================
    createUser: async (dadosUsuario) => {
      return await firebaseService.createUser(dadosUsuario);
    },

    getUser: async (userId) => {
      return await firebaseService.getUser(userId);
    },

    getAllUsers: async () => {
      return await firebaseService.getAllUsers();
    },

    updateUser: async (id, dadosUsuario) => {
      return await firebaseService.updateUser(id, dadosUsuario);
    },

    deleteUser: async (id) => {
      return await firebaseService.deleteUser(id);
    },

    // ==================== LOGS ====================
    createLog: async (logData) => {
      // Esta função pode não ser implementada diretamente sem backend
      console.warn("Função createLog não está disponível na versão de cliente");
      return { success: false, error: "Função não disponível no cliente" };
    },

    getLogs: async () => {
      // Esta função pode não ser implementada diretamente sem backend
      console.warn("Função getLogs não está disponível na versão de cliente");
      return { success: false, error: "Função não disponível no cliente" };
    },

    // ==================== MÉTODOS DE PAGAMENTO ====================
    allPaymentMethods: async () => {
      return await firebaseService.allPaymentMethods();
    }
  };
};