// src/services/Firebase.js
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut 
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKUShy6gvJdbDG_38KSG-KKiE9Hjv6P4E",
  authDomain: "casa-do-biscoito-producao.firebaseapp.com",
  projectId: "casa-do-biscoito-producao",
  storageBucket: "casa-do-biscoito-producao.firebasestorage.app",
  messagingSenderId: "251131987970",
  appId: "1:251131987970:web:c01c6fb19c62b5092b7f1b",
  measurementId: "G-2WRGJ9413X"
};

// Initialize Firebase - Forçar nova instância
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Log para verificação
console.log("Firebase inicializado com configuração:", {
  apiKey: firebaseConfig.apiKey.substring(0, 5) + "...",
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});
// Format the response in a consistent way
const formatResponse = (data) => ({
  success: true,
  data,
  message: 'Operação realizada com sucesso'
});

// Format error in a consistent way
const formatError = (error) => ({
  success: false,
  error: error.message || 'Erro ao processar requisição',
  status: error.code || 0
});

// Helper function to extract data from doc snapshots
const extractData = (doc) => ({
  id: doc.id,
  ...doc.data()
});

export default function FirebaseService() {
  return {
    // ==================== AUTENTICAÇÃO ====================
    login: async (email, password) => {
      try {
        const response = await signInWithEmailAndPassword(auth, email, password);
        
        // Fetch user document from Firestore
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
          user,
          token,
          error: ''
        };
      } catch (error) {
        console.log("ERROR: ", error);
        let errorMessage = '';
        
        switch (error.code) {
          case 'auth/wrong-password':
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
            errorMessage = 'Usuário ou senha inválidos.\nPor favor, verifique as informações e tente novamente.';
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
        return formatResponse({ message: `E-mail para redefinir senha enviado para ${email} com sucesso!` });
      } catch (error) {
        console.log("ERROR: ", error);
        let errorMessage = '';
        
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Não encontramos um usuário com esse e-mail.';
        } else {
          errorMessage = 'Erro ao enviar e-mail de redefinição. Tente novamente mais tarde.';
        }
        
        return formatError({ message: errorMessage });
      }
    },
    
    signout: async () => {
      try {
        await signOut(auth);
        return formatResponse({ message: 'Logout realizado com sucesso' });
      } catch (error) {
        return formatError(error);
      }
    },
    
    // ==================== UNIDADES ====================
    allUnits: async () => {
      try {
        const unitsRef = collection(db, 'unidades');
        const snapshot = await getDocs(unitsRef);
        
        const units = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          nome: doc.data().nome,
          endereco: doc.data().endereco?.nomeLogradouro || doc.data().endereco || '',
          telefone: doc.data().telefone || doc.data().contatoResponsavel || '',
          ativo: doc.data().status === 'ativo'
        }));
        
        return formatResponse(units);
      } catch (error) {
        return formatError(error);
      }
    },
    
    getUnit: async (unidadeId) => {
      try {
        const unitRef = doc(db, 'unidades', unidadeId);
        const docSnap = await getDoc(unitRef);
        
        if (!docSnap.exists()) {
          return formatError({ message: 'Unidade não encontrada' });
        }
        
        const unitData = docSnap.data();
        
        return formatResponse({
          id: docSnap.id,
          ...unitData,
          nome: unitData.nome,
          endereco: unitData.endereco?.nomeLogradouro || unitData.endereco || '',
          telefone: unitData.telefone || unitData.contatoResponsavel || '',
          ativo: unitData.status === 'ativo'
        });
      } catch (error) {
        return formatError(error);
      }
    },
    
    createUnit: async (dadosUnidade) => {
      try {
        const newUnit = {
          nome: dadosUnidade.nome,
          endereco: dadosUnidade.endereco,
          telefone: dadosUnidade.telefone,
          status: dadosUnidade.ativo ? 'ativo' : 'inativo',
          dataCriacao: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'unidades'), newUnit);
        
        return formatResponse({
          id: docRef.id,
          ...newUnit
        });
      } catch (error) {
        return formatError(error);
      }
    },
    
    updateUnit: async (unidadeId, dadosUnidade) => {
      try {
        const unitRef = doc(db, 'unidades', unidadeId);
        
        const updateData = {
          nome: dadosUnidade.nome,
          endereco: dadosUnidade.endereco,
          telefone: dadosUnidade.telefone,
          status: dadosUnidade.ativo ? 'ativo' : 'inativo',
          ultimaAtualizacao: serverTimestamp()
        };
        
        await updateDoc(unitRef, updateData);
        
        return formatResponse({
          id: unidadeId,
          ...updateData
        });
      } catch (error) {
        return formatError(error);
      }
    },
    
    deleteUnit: async (unidadeId) => {
      try {
        const unitRef = doc(db, 'unidades', unidadeId);
        await deleteDoc(unitRef);
        
        return formatResponse({ message: 'Unidade excluída com sucesso' });
      } catch (error) {
        return formatError(error);
      }
    },
    
    // ==================== CAIXAS ====================
    allCaixas: async (unidadeId) => {
      try {
        const caixasRef = collection(db, `unidades/${unidadeId}/caixas`);
        const snapshot = await getDocs(caixasRef);
        
        const caixas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        return formatResponse(caixas);
      } catch (error) {
        return formatError(error);
      }
    },
    
    getCaixa: async (unidadeId, caixaId) => {
      try {
        const caixaRef = doc(db, `unidades/${unidadeId}/caixas`, caixaId);
        const docSnap = await getDoc(caixaRef);
        
        if (!docSnap.exists()) {
          return formatError({ message: 'Caixa não encontrada' });
        }
        
        return formatResponse({
          id: docSnap.id,
          ...docSnap.data()
        });
      } catch (error) {
        return formatError(error);
      }
    },
    
    createCaixa: async (unidadeId) => {
      try {
        // Primeiro, vamos buscar todas as caixas existentes para determinar o próximo número
        const caixasRef = collection(db, `unidades/${unidadeId}/caixas`);
        const snapshot = await getDocs(caixasRef);
        
        // Encontra o maior número de caixa
        let maxNumero = 0;
        snapshot.docs.forEach(doc => {
          const numero = doc.data().numero || 0;
          if (numero > maxNumero) maxNumero = numero;
        });
        
        // Cria a nova caixa com o próximo número
        const newCaixa = {
          numero: maxNumero + 1,
          status: 'fechado',
          saldoInicial: 0,
          saldoAtual: 0,
          formasPagamento: {
            debito: true,
            credito: true,
            pix: true,
            dinheiro: true,
            ticket: false
          },
          dataCriacao: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, `unidades/${unidadeId}/caixas`), newCaixa);
        
        return formatResponse({
          id: docRef.id,
          ...newCaixa
        });
      } catch (error) {
        return formatError(error);
      }
    },
    
    // ==================== MOVIMENTOS ====================
    getMovements: async (unidadeId, caixaId, data) => {
      try {
        const movimentosRef = collection(db, `unidades/${unidadeId}/caixas/${caixaId}/movimentos`);
        
        let movimentos = [];
        
        if (data) {
          // Converter a data string para objetos Date
          const startDate = new Date(data);
          startDate.setHours(0, 0, 0, 0);
          
          const endDate = new Date(data);
          endDate.setHours(23, 59, 59, 999);
          
          // Criar query com filtro de data
          const q = query(
            movimentosRef,
            where("data", ">=", Timestamp.fromDate(startDate)),
            where("data", "<=", Timestamp.fromDate(endDate)),
            orderBy("data", "desc")
          );
          
          const snapshot = await getDocs(q);
          movimentos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().data?.toDate() || new Date() // Normalizar o timestamp
          }));
        } else {
          // Buscar todos os movimentos ordenados por data
          const q = query(movimentosRef, orderBy("data", "desc"));
          const snapshot = await getDocs(q);
          
          movimentos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().data?.toDate() || new Date() // Normalizar o timestamp
          }));
        }
        
        return formatResponse(movimentos);
      } catch (error) {
        return formatError(error);
      }
    },
    
    createMovement: async (unidadeId, caixaId, dados) => {
      try {
        const movimentosRef = collection(db, `unidades/${unidadeId}/caixas/${caixaId}/movimentos`);
        
        // Preparar dados para salvar no Firestore
        const movimento = {
          tipo: dados.tipo,
          forma: dados.forma,
          valor: parseFloat(dados.valor),
          descricao: dados.descricao || '',
          nomeCliente: dados.nomeCliente || '',
          numeroDocumento: dados.numeroDocumento || '',
          data: Timestamp.fromDate(new Date(dados.data)),
          paymentStatus: dados.paymentStatus || 'realizado',
          moedasEntrada: dados.moedasEntrada || '',
          moedasSaida: dados.moedasSaida || '',
          timestamp: serverTimestamp() // Quando foi criado
        };
        
        const docRef = await addDoc(movimentosRef, movimento);
        
        // Atualizar o saldo do caixa
        const caixaRef = doc(db, `unidades/${unidadeId}/caixas`, caixaId);
        const caixaSnap = await getDoc(caixaRef);
        
        if (caixaSnap.exists()) {
          const caixaData = caixaSnap.data();
          let novoSaldo = caixaData.saldoAtual || 0;
          
          if (movimento.tipo === 'entrada') {
            novoSaldo += movimento.valor;
          } else {
            novoSaldo -= movimento.valor;
          }
          
          await updateDoc(caixaRef, { saldoAtual: novoSaldo });
        }
        
        return formatResponse({
          id: docRef.id,
          ...movimento
        });
      } catch (error) {
        return formatError(error);
      }
    },
    
    deleteMovement: async (unidadeId, caixaId, movimentoId) => {
      try {
        // Primeiro, busca o movimento para saber o valor e tipo
        const movimentoRef = doc(db, `unidades/${unidadeId}/caixas/${caixaId}/movimentos`, movimentoId);
        const movimentoSnap = await getDoc(movimentoRef);
        
        if (!movimentoSnap.exists()) {
          return formatError({ message: 'Movimento não encontrado' });
        }
        
        const movimentoData = movimentoSnap.data();
        
        // Exclui o movimento
        await deleteDoc(movimentoRef);
        
        // Atualiza o saldo do caixa
        const caixaRef = doc(db, `unidades/${unidadeId}/caixas`, caixaId);
        const caixaSnap = await getDoc(caixaRef);
        
        if (caixaSnap.exists()) {
          const caixaData = caixaSnap.data();
          let novoSaldo = caixaData.saldoAtual || 0;
          
          // Se for uma entrada, subtrai do saldo; se for saída, adiciona
          if (movimentoData.tipo === 'entrada') {
            novoSaldo -= movimentoData.valor;
          } else {
            novoSaldo += movimentoData.valor;
          }
          
          await updateDoc(caixaRef, { saldoAtual: novoSaldo });
        }
        
        return formatResponse({ message: 'Movimento excluído com sucesso' });
      } catch (error) {
        return formatError(error);
      }
    },
    
    createMovementsBatch: async (unidadeId, caixaId, listaDeMovimentos) => {
      try {
        const movimentosRef = collection(db, `unidades/${unidadeId}/caixas/${caixaId}/movimentos`);
        
        // Para calcular o impacto no saldo
        let impactoSaldo = 0;
        
        // Adiciona cada movimento
        for (const mov of listaDeMovimentos) {
          const movimento = {
            tipo: mov.tipo,
            forma: mov.forma,
            valor: parseFloat(mov.valor),
            descricao: mov.descricao || '',
            data: Timestamp.fromDate(new Date(mov.data)),
            paymentStatus: mov.paymentStatus || 'realizado',
            moedasEntrada: mov.moedasEntrada || '',
            moedasSaida: mov.moedasSaida || '',
            timestamp: serverTimestamp()
          };
          
          await addDoc(movimentosRef, movimento);
          
          // Calcula o impacto no saldo
          if (movimento.tipo === 'entrada') {
            impactoSaldo += movimento.valor;
          } else {
            impactoSaldo -= movimento.valor;
          }
        }
        
        // Atualiza o saldo do caixa
        const caixaRef = doc(db, `unidades/${unidadeId}/caixas`, caixaId);
        const caixaSnap = await getDoc(caixaRef);
        
        if (caixaSnap.exists()) {
          const caixaData = caixaSnap.data();
          const novoSaldo = (caixaData.saldoAtual || 0) + impactoSaldo;
          await updateDoc(caixaRef, { saldoAtual: novoSaldo });
        }
        
        return formatResponse({ message: `${listaDeMovimentos.length} movimentos registrados com sucesso` });
      } catch (error) {
        return formatError(error);
      }
    },
    
    // ==================== USUÁRIOS ====================
    createUser: async (dadosUsuario) => {
      try {
        // Note: Esta função exigiria acesso a Firebase Admin SDK para criar usuários
        // Você precisaria implementar uma função Cloud Function para isso
        return formatError({ message: 'Criação de usuários diretamente pelo cliente não é suportada por segurança. Use Firebase Admin SDK em um backend.' });
      } catch (error) {
        return formatError(error);
      }
    },
    
    getUser: async (userId) => {
      try {
        const userRef = doc(db, 'Users', userId);
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
          return formatError({ message: 'Usuário não encontrado' });
        }
        
        return formatResponse({
          id: docSnap.id,
          ...docSnap.data()
        });
      } catch (error) {
        return formatError(error);
      }
    },
    
    getAllUsers: async () => {
      try {
        const usersRef = collection(db, 'Users');
        const snapshot = await getDocs(usersRef);
        
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        return formatResponse(users);
      } catch (error) {
        return formatError(error);
      }
    },
    
    // ==================== MÉTODOS DE PAGAMENTO ====================
    allPaymentMethods: async () => {
      try {
        // Esta é uma implementação mockada, já que o exemplo não mostra como estão armazenados os métodos de pagamento
        // Você precisaria adaptar conforme a estrutura real do seu banco
        const methodsRef = doc(db, 'formasPagamento', 'tipos');
        const docSnap = await getDoc(methodsRef);
        
        if (!docSnap.exists()) {
          return formatResponse([
            { id: 'dinheiro', name: 'Dinheiro', category: 'dinheiro' },
            { id: 'debito_rede', name: 'Débito - Rede', category: 'debito' },
            { id: 'credito_visa', name: 'Crédito - Visa', category: 'credito' },
            { id: 'pix_qrcode', name: 'PIX - QR Code', category: 'pix' }
          ]);
        }
        
        const formasPagamento = docSnap.data();
        const methods = [];
        
        // Processar métodos Débito
        if (formasPagamento.debito) {
          formasPagamento.debito.forEach(method => {
            methods.push({
              id: `debito_${method}`,
              name: `Débito - ${method.charAt(0).toUpperCase() + method.slice(1)}`,
              category: 'debito'
            });
          });
        }
        
        // Processar métodos Crédito
        if (formasPagamento.credito) {
          formasPagamento.credito.forEach(method => {
            methods.push({
              id: `credito_${method}`,
              name: `Crédito - ${method.charAt(0).toUpperCase() + method.slice(1)}`,
              category: 'credito'
            });
          });
        }
        
        // Processar métodos Ticket
        if (formasPagamento.ticket) {
          formasPagamento.ticket.forEach(ticket => {
            if (ticket.tipos && ticket.tipos.length > 0) {
              ticket.tipos.forEach(tipo => {
                methods.push({
                  id: `ticket_${ticket.nome}_${tipo}`,
                  name: `Ticket - ${ticket.nome.charAt(0).toUpperCase() + ticket.nome.slice(1)} (${tipo})`,
                  category: 'ticket'
                });
              });
            } else {
              methods.push({
                id: `ticket_${ticket.nome}`,
                name: `Ticket - ${ticket.nome.charAt(0).toUpperCase() + ticket.nome.slice(1)}`,
                category: 'ticket'
              });
            }
          });
        }
        
        // Processar métodos PIX
        if (formasPagamento.pix) {
          formasPagamento.pix.forEach(method => {
            methods.push({
              id: `pix_${method}`,
              name: `PIX - ${method.charAt(0).toUpperCase() + method.slice(1)}`,
              category: 'pix'
            });
          });
        }
        
        // Adicionar dinheiro
        methods.push({
          id: 'dinheiro',
          name: 'Dinheiro',
          category: 'dinheiro'
        });
        
        return formatResponse(methods);
      } catch (error) {
        // Retorna métodos padrão em caso de erro
        return formatResponse([
          { id: 'dinheiro', name: 'Dinheiro', category: 'dinheiro' },
          { id: 'debito_rede', name: 'Débito - Rede', category: 'debito' },
          { id: 'credito_visa', name: 'Crédito - Visa', category: 'credito' },
          { id: 'pix_qrcode', name: 'PIX - QR Code', category: 'pix' }
        ]);
      }
    }
  };
}

export { app, auth, db, analytics };