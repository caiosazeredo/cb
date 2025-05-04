// Ferramenta para debug de autenticação no Firebase/JWT
import axios from 'axios';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const API_URL = 'http://localhost:3000';
const TIMEOUT = 10000;

// Função para carregar credenciais Firebase de múltiplos locais possíveis
const loadFirebaseCredentials = () => {
  const possiblePaths = [
    path.join(__dirname, 'casadobiscoito-55734-firebase-adminsdk-fbsvc-d5bf889b83.json'),
    path.join(__dirname, '../database/casadobiscoito-55734-firebase-adminsdk-fbsvc-d5bf889b83.json'),
    path.join(__dirname, './database/casadobiscoito-55734-firebase-adminsdk-fbsvc-d5bf889b83.json'),
    path.join(__dirname, '../config/casadobiscoito-55734-firebase-adminsdk-fbsvc-d5bf889b83.json')
  ];

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`✅ Arquivo de credenciais encontrado em: ${filePath}`);
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (error) {
      console.error(`❌ Erro ao ler arquivo ${filePath}:`, error.message);
    }
  }

  console.error('❌ Arquivo de credenciais não encontrado em nenhum dos caminhos testados');
  return null;
};

// Inicializa o Firebase Admin
const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    console.log('🔄 Firebase Admin já inicializado');
    return true;
  }

  const serviceAccount = loadFirebaseCredentials();
  if (!serviceAccount) {
    return false;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin inicializado com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
    console.error(error);
    return false;
  }
};

// Testa a conexão com o Firestore
const testFirestoreConnection = async () => {
  try {
    const db = admin.firestore();
    console.log('🔍 Testando conexão com Firestore...');
    
    const testRef = db.collection('test-connection').doc('test');
    await testRef.set({ timestamp: new Date().toISOString() });
    const doc = await testRef.get();
    
    if (doc.exists) {
      console.log('✅ Conexão com Firestore verificada com sucesso!');
      return true;
    } else {
      console.error('❌ Erro: documento criado, mas não encontrado na leitura');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar conexão com Firestore:', error);
    return false;
  }
};

// Lista usuários no Firebase Auth
const listFirebaseUsers = async (limit = 10) => {
  try {
    console.log('🔍 Listando usuários no Firebase Auth...');
    const listUsersResult = await admin.auth().listUsers(limit);
    
    if (listUsersResult.users.length > 0) {
      console.log(`✅ ${listUsersResult.users.length} usuários encontrados:`);
      listUsersResult.users.forEach((user) => {
        console.log(`   - UID: ${user.uid} | Email: ${user.email || 'N/A'} | Nome: ${user.displayName || 'N/A'}`);
      });
      return true;
    } else {
      console.log('⚠️ Nenhum usuário encontrado no Firebase Auth');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao listar usuários Firebase:', error);
    return false;
  }
};

// Busca um usuário específico no Firebase Auth
const findFirebaseUser = async (uid) => {
  try {
    console.log(`🔍 Buscando usuário com UID: ${uid}`);
    const userRecord = await admin.auth().getUser(uid);
    
    console.log('✅ Usuário encontrado:');
    console.log(`   - UID: ${userRecord.uid}`);
    console.log(`   - Email: ${userRecord.email || 'N/A'}`);
    console.log(`   - Nome: ${userRecord.displayName || 'N/A'}`);
    console.log(`   - Telefone: ${userRecord.phoneNumber || 'N/A'}`);
    console.log(`   - Desativado: ${userRecord.disabled ? 'Sim' : 'Não'}`);
    
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Usuário com UID ${uid} não encontrado`);
    } else {
      console.error('❌ Erro ao buscar usuário:', error);
    }
    return null;
  }
};

// Cria um token personalizado
const createCustomToken = async (uid) => {
  try {
    console.log(`🔍 Criando token personalizado para UID: ${uid}`);
    const token = await admin.auth().createCustomToken(uid);
    console.log(`✅ Token criado com sucesso: ${token.substring(0, 20)}...`);
    return token;
  } catch (error) {
    console.error('❌ Erro ao criar token personalizado:', error);
    return null;
  }
};

// Verifica um token ID
const verifyIdToken = async (idToken) => {
  try {
    console.log('🔍 Verificando token ID...');
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('✅ Token verificado com sucesso:');
    console.log(`   - UID: ${decodedToken.uid}`);
    console.log(`   - Email: ${decodedToken.email || 'N/A'}`);
    console.log(`   - Emitido em: ${new Date(decodedToken.iat * 1000).toISOString()}`);
    console.log(`   - Expira em: ${new Date(decodedToken.exp * 1000).toISOString()}`);
    return decodedToken;
  } catch (error) {
    console.error('❌ Erro ao verificar token ID:', error);
    return null;
  }
};

// Testa uma rota da API com autenticação
const testApiRoute = async (route, method = 'GET', token, data = null) => {
  console.log(`🔍 Testando ${method} ${route}...`);
  
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      timeout: TIMEOUT
    };
    
    let response;
    switch (method.toUpperCase()) {
      case 'GET':
        response = await axios.get(`${API_URL}${route}`, config);
        break;
      case 'POST':
        response = await axios.post(`${API_URL}${route}`, data || {}, config);
        break;
      case 'PUT':
        response = await axios.put(`${API_URL}${route}`, data || {}, config);
        break;
      case 'DELETE':
        response = await axios.delete(`${API_URL}${route}`, config);
        break;
      default:
        throw new Error(`Método HTTP não suportado: ${method}`);
    }
    
    console.log(`✅ Sucesso! Status: ${response.status}`);
    console.log('Resposta:', JSON.stringify(response.data, null, 2).substring(0, 300));
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error(`❌ Falha! Status: ${error.response.status}`);
      console.error('Resposta:', JSON.stringify(error.response.data, null, 2).substring(0, 300));
      return { 
        success: false, 
        status: error.response.status, 
        data: error.response.data,
        error: error.message 
      };
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('❌ Sem resposta do servidor!');
      return { success: false, error: 'Sem resposta do servidor', details: error.message };
    } else {
      // Erro na configuração da requisição
      console.error('❌ Erro:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Examina o código do middleware de autenticação
const examineAuthMiddleware = () => {
  const possiblePaths = [
    path.join(__dirname, '../middlewares/authenticate-jwt.js'),
    path.join(__dirname, './middlewares/authenticate-jwt.js'),
    path.join(__dirname, 'authenticate-jwt.js')
  ];

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        console.log(`🔍 Analisando middleware de autenticação em: ${filePath}`);
        const content = fs.readFileSync(filePath, 'utf8');
        console.log('📄 Conteúdo do middleware:');
        console.log('='.repeat(50));
        console.log(content);
        console.log('='.repeat(50));
        return content;
      }
    } catch (error) {
      console.error(`❌ Erro ao ler arquivo ${filePath}:`, error.message);
    }
  }

  console.log('❌ Arquivo do middleware de autenticação não encontrado');
  return null;
};

// Função para verificar a rota de teste
const testDefaultRoute = async () => {
  try {
    const response = await axios.get(`${API_URL}/teste`, { timeout: TIMEOUT });
    console.log(`✅ Rota de teste OK! Status: ${response.status}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao acessar rota de teste:', error.message);
    return false;
  }
};

// Função principal que executa uma série de testes para diagnóstico
const runDiagnostics = async () => {
  console.log('🔧 INICIANDO DIAGNÓSTICO DE AUTENTICAÇÃO 🔧');
  console.log('==========================================');
  
  // Passo 1: Testar conectividade básica
  console.log('\n📌 Passo 1: Verificar conectividade com o servidor');
  if (!await testDefaultRoute()) {
    console.error('❌ ERRO CRÍTICO: Servidor não está respondendo');
    console.log('⚠️ Verifique se o servidor está rodando na porta 3000');
    console.log('⚠️ Execute o servidor com: node src/server.js');
    return;
  }
  
  // Passo 2: Inicializar Firebase
  console.log('\n📌 Passo 2: Inicializar Firebase Admin SDK');
  if (!initializeFirebase()) {
    console.error('❌ ERRO CRÍTICO: Não foi possível inicializar o Firebase Admin');
    console.log('⚠️ Verifique o arquivo de credenciais');
    return;
  }
  
  // Passo 3: Testar conexão com Firestore
  console.log('\n📌 Passo 3: Testar conexão com Firestore');
  if (!await testFirestoreConnection()) {
    console.error('❌ ERRO CRÍTICO: Não foi possível conectar ao Firestore');
    console.log('⚠️ Verifique as permissões da conta de serviço');
    return;
  }
  
  // Passo 4: Listar usuários
  console.log('\n📌 Passo 4: Listar usuários no Firebase Auth');
  await listFirebaseUsers();
  
  // Passo 5: Testar usuário específico
  console.log('\n📌 Passo 5: Verificar usuário de teste');
  const testUid = 'jwx5473wunaycoDgilsghRohOkz2'; // Este é o UID que está sendo usado nos testes
  const userRecord = await findFirebaseUser(testUid);
  
  if (!userRecord) {
    console.log('\n⚠️ Usuário de teste não encontrado. Tente um uid diferente ou crie este usuário.');
    // Tentar encontrar outro usuário para testar
    console.log('🔍 Procurando por qualquer usuário disponível...');
    await listFirebaseUsers(1);
  }
  
  // Passo 6: Criar token personalizado
  console.log('\n📌 Passo 6: Criar token de autenticação');
  const uid = userRecord ? userRecord.uid : testUid;
  const customToken = await createCustomToken(uid);
  
  if (!customToken) {
    console.error('❌ ERRO CRÍTICO: Não foi possível criar token de autenticação');
    console.log('⚠️ Verifique as permissões da conta de serviço');
    return;
  }
  
  // Passo 7: Examinar middleware de autenticação
  console.log('\n📌 Passo 7: Analisar middleware de autenticação');
  examineAuthMiddleware();
  
  // Passo 8: Testar uma rota da API com autenticação
  console.log('\n📌 Passo 8: Testar rota da API com autenticação');
  const testResult = await testApiRoute('/api/unidades', 'GET', customToken);
  
  // Análise do resultado
  console.log('\n📊 RESULTADO DO DIAGNÓSTICO 📊');
  console.log('====================================');
  
  if (testResult.success) {
    console.log('✅ SUCESSO! A autenticação está funcionando corretamente');
  } else {
    console.log('❌ FALHA! A autenticação ainda apresenta problemas');
    
    console.log('\n🔍 ANÁLISE DE CAUSAS POSSÍVEIS:');
    
    if (testResult.status === 401) {
      console.log('1. O token não está sendo aceito pelo middleware');
      console.log('   - O middleware pode estar esperando um token JWT do Firebase Auth Client, não um Custom Token');
      console.log('   - Pode haver um problema na verificação do token');
      console.log('   - O formato do token na requisição pode estar incorreto');
      
      console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
      console.log('1. Modifique o middleware authenticate-jwt.js para aceitar Custom Tokens');
      console.log('2. Adicione mais logs no middleware para identificar o problema exato');
      console.log('3. Verifique se o formato correto é "Bearer TOKEN"');
    } else {
      console.log('1. Há um problema no processamento da requisição após a autenticação');
      console.log('2. Verifique os logs do servidor para mais detalhes');
    }
  }
  
  console.log('\n📝 PRÓXIMOS PASSOS:');
  console.log('1. Modifique o middleware authenticate-jwt.js conforme sugerido');
  console.log('2. Adicione logs detalhados para debug');
  console.log('3. Reinicie o servidor e execute este diagnóstico novamente');
};

// Executar os diagnósticos
runDiagnostics();