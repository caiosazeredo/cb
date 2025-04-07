// src/api-tester-updated.js
// Versão melhorada com IDs de teste específicos

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IDs específicos para teste (que sabemos que existem no banco)
const TEST_UNIT_ID = '001';
const TEST_CAIXA_ID = '001';
const TEST_USER_ID = 'jwx5473wunaycoDgilsghRohOkz2'; // O ID que estava sendo usado nos testes
const SUPER_USER_ID = 'superuser123';      // ID do superusuário criado pelo script setup-test-data.js

// Configuração
const API_BASE_URL = 'http://localhost:3000';
const TIMEOUT_MS = 5000;
let authToken = '';
const results = [];

// Inicializar Firebase Admin
try {
  // Tentar encontrar o arquivo de credenciais em vários locais possíveis
  const possiblePaths = [
    path.join(__dirname, 'database/casadobiscoito-55734-firebase-adminsdk-fbsvc-d5bf889b83.json'),
    path.join(__dirname, '../database/casadobiscoito-55734-firebase-adminsdk-fbsvc-d5bf889b83.json'),
    path.join(__dirname, 'casadobiscoito-55734-firebase-adminsdk-fbsvc-d5bf889b83.json'),
    path.join(__dirname, './database/casadobiscoito-55734-firebase-adminsdk-fbsvc-d5bf889b83.json')
  ];
  
  let serviceAccountPath = null;
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      serviceAccountPath = testPath;
      console.log(`✅ Arquivo de credenciais encontrado em: ${serviceAccountPath}`);
      break;
    }
  }
  
  if (serviceAccountPath) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin inicializado com sucesso');
  } else {
    console.error('❌ Arquivo de credenciais não encontrado nos caminhos testados. Testes serão realizados sem autenticação válida.');
  }
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
}

// Função para obter um token de autenticação válido
const getAuthToken = async (useSuper = false) => {
  try {
    if (!admin.apps.length) {
      console.log('❌ Firebase Admin não inicializado. Pulando autenticação.');
      return false;
    }

    // Usar o UID escolhido
    const uid = useSuper ? SUPER_USER_ID : TEST_USER_ID;
    
    console.log(`🔑 Criando token para ${useSuper ? 'superusuário' : 'usuário normal'} (UID: ${uid})`);
    authToken = await admin.auth().createCustomToken(uid);
    console.log('✅ Token de autenticação gerado com sucesso');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao gerar token de autenticação:', error.message);
    return false;
  }
};

// Rotas a serem testadas (atualizadas com os IDs corretos)
const routes = [
  // Rota de teste
  { path: '/teste', method: 'GET', description: 'Teste básico do servidor' },
  
  // Unidades
  { path: '/api/unidades', method: 'GET', description: 'Listar unidades' },
  { path: `/api/unidades/${TEST_UNIT_ID}`, method: 'GET', description: 'Obter unidade específica' },
  { path: '/api/unidades', method: 'POST', description: 'Criar unidade', data: { nome: 'Unidade Teste', endereco: 'Rua de Teste, 123', telefone: '(21) 99999-9999' } },
  
  // Caixas
  { path: `/api/unidades/${TEST_UNIT_ID}/caixas`, method: 'GET', description: 'Listar caixas' },
  { path: `/api/unidades/${TEST_UNIT_ID}/caixas/${TEST_CAIXA_ID}`, method: 'GET', description: 'Obter caixa específica' },
  { path: `/api/unidades/${TEST_UNIT_ID}/caixas`, method: 'POST', description: 'Criar caixa', data: {} },
  { path: `/api/unidades/${TEST_UNIT_ID}/caixas/${TEST_CAIXA_ID}`, method: 'PUT', description: 'Atualizar caixa', data: { formasPagamento: { dinheiro: true, credito: true, debito: true, pix: true, ticket: true } } },
  { path: `/api/unidades/${TEST_UNIT_ID}/caixas/${TEST_CAIXA_ID}`, method: 'DELETE', description: 'Deletar caixa' },
  
  // Movimentos
  { path: `/api/unidades/${TEST_UNIT_ID}/caixas/${TEST_CAIXA_ID}/movimentos`, method: 'GET', description: 'Listar movimentos' },
  { path: `/api/unidades/${TEST_UNIT_ID}/caixas/${TEST_CAIXA_ID}/movimentos?data=2024-03-01`, method: 'GET', description: 'Listar movimentos com filtro de data' },
  { path: `/api/unidades/${TEST_UNIT_ID}/caixas/${TEST_CAIXA_ID}/movimentos`, method: 'POST', description: 'Criar movimento', data: { tipo: 'entrada', forma: 'dinheiro', valor: 100, paymentStatus: 'realizado', descricao: 'Teste' } },
  { path: `/api/unidades/${TEST_UNIT_ID}/caixas/${TEST_CAIXA_ID}/movimentos/000001`, method: 'DELETE', description: 'Deletar movimento' },
  
  // Usuários
  { path: '/api/usuarios', method: 'GET', description: 'Listar usuários' },
  { path: `/api/usuarios/${TEST_USER_ID}`, method: 'GET', description: 'Buscar usuário por ID' },
  { path: '/api/usuarios', method: 'POST', description: 'Criar usuário', data: { uuidCriador: TEST_USER_ID, name: 'Teste', email: 'teste@teste.com' }, useSuperUser: true },
  { path: `/api/usuarios/${TEST_USER_ID}`, method: 'PUT', description: 'Atualizar usuário', data: { name: 'Teste Atualizado' } },
  { path: `/api/usuarios/${TEST_USER_ID}/acessos`, method: 'GET', description: 'Buscar acessos do usuário' },
  { path: `/api/usuarios/${TEST_USER_ID}`, method: 'DELETE', description: 'Deletar usuário', useSuperUser: true },
  
  // Logs
  { path: '/api/logs', method: 'GET', description: 'Listar logs' },
  { path: '/api/logs', method: 'POST', description: 'Criar log', data: { uuidUser: TEST_USER_ID, funcionalidade: 'Teste', status: 'success', mensagem: 'Teste' } }
];

// Função para testar uma rota
const testRoute = async (route) => {
  // Se a rota precisar de superusuário, trocar o token
  const needSuperUser = route.useSuperUser === true;
  
  if (needSuperUser) {
    await getAuthToken(true); // Obter token de superusuário
  }
  
  console.log(`🔍 Testando ${route.method} ${route.path} (${route.description})...`);
  
  try {
    const config = {
      headers: { Authorization: `Bearer ${authToken}` },
      timeout: TIMEOUT_MS
    };
    
    let response;
    switch (route.method) {
      case 'GET':
        response = await axios.get(`${API_BASE_URL}${route.path}`, config);
        break;
      case 'POST':
        response = await axios.post(`${API_BASE_URL}${route.path}`, route.data || {}, config);
        break;
      case 'PUT':
        response = await axios.put(`${API_BASE_URL}${route.path}`, route.data || {}, config);
        break;
      case 'DELETE':
        response = await axios.delete(`${API_BASE_URL}${route.path}`, config);
        break;
      default:
        throw new Error(`Método não suportado: ${route.method}`);
    }
    
    results.push({
      path: route.path,
      method: route.method,
      description: route.description,
      success: true,
      status: response.status,
      message: `OK (HTTP ${response.status})`
    });
    
    console.log(`✅ Sucesso! Status: ${response.status}`);
    
    // Voltar para o token de usuário normal se usamos superusuário
    if (needSuperUser) {
      await getAuthToken(false);
    }
    
    return true;
  } catch (error) {
    let errorMessage;
    let errorStatus;
    
    if (error.response) {
      // A requisição foi feita e o servidor respondeu com um status fora do intervalo de 2xx
      errorStatus = error.response.status;
      errorMessage = error.response.data?.error || JSON.stringify(error.response.data) || 'Erro no servidor';
    } else if (error.code === 'ECONNABORTED') {
      errorStatus = 'TIMEOUT';
      errorMessage = 'Requisição excedeu o tempo limite';
    } else if (error.code === 'ECONNREFUSED') {
      errorStatus = 'CONN_REFUSED';
      errorMessage = 'Conexão recusada. Servidor está rodando?';
    } else if (error.request) {
      // A requisição foi feita mas nenhuma resposta foi recebida
      errorStatus = 'NO_RESPONSE';
      errorMessage = 'Servidor não respondeu';
    } else {
      // Algo aconteceu na configuração da requisição que acionou um erro
      errorStatus = 'ERROR';
      errorMessage = error.message;
    }
    
    results.push({
      path: route.path,
      method: route.method,
      description: route.description,
      success: false,
      status: errorStatus,
      message: errorMessage
    });
    
    console.log(`❌ Falha! Status: ${errorStatus}, Erro: ${errorMessage}`);
    
    // Voltar para o token de usuário normal se usamos superusuário
    if (needSuperUser) {
      await getAuthToken(false);
    }
    
    return false;
  }
};

// Função para testar rota sem autenticação
const testRouteWithoutAuth = async (route) => {
  console.log(`🔎 Testando ${route.method} ${route.path} sem autenticação...`);
  
  try {
    const config = { timeout: TIMEOUT_MS };
    
    let response;
    switch (route.method) {
      case 'GET':
        response = await axios.get(`${API_BASE_URL}${route.path}`, config);
        break;
      case 'POST':
        response = await axios.post(`${API_BASE_URL}${route.path}`, route.data || {}, config);
        break;
      default:
        return false;
    }
    
    console.log(`✅ Requisição sem autenticação funcionou! Status: ${response.status}`);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✓ Rota requer autenticação corretamente (401 Unauthorized)');
    } else {
      console.log(`❌ Erro sem autenticação: ${error.message}`);
    }
    return false;
  }
};

// Gerar relatório detalhado
const generateReport = () => {
  // Estatísticas gerais
  const total = results.length;
  const successCount = results.filter(r => r.success).length;
  const failureCount = total - successCount;
  
  console.log('\n📊 RESUMO DOS TESTES 📊');
  console.log(`Total de rotas testadas: ${total}`);
  console.log(`Sucesso: ${successCount}`);
  console.log(`Falha: ${failureCount}`);
  
  if (failureCount > 0) {
    console.log('\n⚠️ DETALHES DAS FALHAS ⚠️');
    
    // Agrupar por código de status HTTP
    const failuresByStatus = results
      .filter(r => !r.success)
      .reduce((acc, result) => {
        const status = result.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(result);
        return acc;
      }, {});
    
    // Exibir falhas agrupadas
    Object.entries(failuresByStatus).forEach(([status, failures]) => {
      console.log(`\n🔴 Status ${status} (${failures.length} rotas):`);
      failures.forEach(failure => {
        console.log(`   - ${failure.method} ${failure.path}: ${failure.message}`);
      });
    });
    
    // Diagnóstico e soluções específicas
    provideDiagnosticHelp(failuresByStatus);
  }
  
  // Exportar relatório em JSON para análise posterior
  const reportPath = path.join(__dirname, 'api-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total,
      success: successCount,
      failure: failureCount
    },
    results
  }, null, 2));
  
  console.log(`\n📄 Relatório detalhado salvo em: ${reportPath}`);
};

// Fornecer diagnóstico e soluções para problemas comuns
const provideDiagnosticHelp = (failuresByStatus) => {
  console.log('\n🔧 DIAGNÓSTICO E SOLUÇÕES 🔧');
  
  // Problemas de Autenticação (401)
  if (failuresByStatus['401']) {
    console.log('\n📌 PROBLEMAS DE AUTENTICAÇÃO (401):');
    console.log('Causas possíveis:');
    console.log('1. Token JWT inválido ou expirado');
    console.log('2. Middleware authenticateToken rejeitando o token');
    
    console.log('\nSoluções sugeridas:');
    console.log('1. Verifique a implementação em authenticate-jwt.js');
    console.log('2. Verifique se o token está sendo gerado corretamente');
    console.log('3. Verifique se o Firebase Auth está configurado corretamente');
    console.log('4. Adicione logs detalhados no middleware de autenticação');
    
    const authRoutes = failuresByStatus['401'].map(f => f.path);
    console.log('\nConsidere adicionar logs em routes.js para as rotas:');
    authRoutes.forEach(route => console.log(`   - ${route}`));
  }
  
  // Rotas não encontradas (404)
  if (failuresByStatus['404']) {
    console.log('\n📌 ROTAS NÃO ENCONTRADAS (404):');
    console.log('Causas possíveis:');
    console.log('1. A rota não está definida em routes.js');
    console.log('2. Parâmetros de URL incorretos');
    console.log('3. Controller não encontrado');
    console.log('4. O registro não existe no banco de dados');
    
    console.log('\nSoluções sugeridas:');
    console.log('1. Verifique o mapeamento em routes.js para as seguintes rotas:');
    const notFoundRoutes = failuresByStatus['404'].map(f => f.path);
    notFoundRoutes.forEach(route => console.log(`   - ${route}`));
    console.log('2. Execute o script setup-test-data.js para criar os dados necessários');
    console.log('3. Verifique se os controllers correspondentes existem');
    console.log('4. Adicione logs de requisição no app.js para debugar');
    
    // Diagnóstico específico para registros não encontrados
    if (notFoundRoutes.some(r => r.includes('/caixas/001'))) {
      console.log('\n📍 Erro com caixa 001:');
      console.log('1. Execute: node src/setup-test-data.js');
      console.log('2. Verifique se o caixa 001 existe no Firestore na coleção unidades/001/caixas');
    }
    
    if (notFoundRoutes.some(r => r.includes(`/usuarios/${TEST_USER_ID}`))) {
      console.log(`\n📍 Erro com usuário ${TEST_USER_ID}:`);
      console.log('1. Execute: node src/setup-test-data.js');
      console.log(`2. Verifique se o usuário existe no Firestore na coleção Users`);
    }
  }
  
  // Erros internos (500)
  if (failuresByStatus['500']) {
    console.log('\n📌 ERROS INTERNOS DO SERVIDOR (500):');
    console.log('Causas possíveis:');
    console.log('1. Erro não tratado no controller');
    console.log('2. Problema na conexão com o Firestore');
    console.log('3. Erro na lógica de negócio');
    
    console.log('\nSoluções sugeridas:');
    console.log('1. Verifique os logs do servidor para mensagens de erro detalhadas');
    console.log('2. Adicione try/catch em todos os controllers');
    console.log('3. Teste a conexão com o Firestore separadamente');
    console.log('4. Verifique se os dados enviados estão corretamente formatados');
    
    // Listar rotas com erro 500
    const serverErrorRoutes = failuresByStatus['500'].map(f => `${f.method} ${f.path}`);
    console.log('\nRotas com erro interno:');
    serverErrorRoutes.forEach(route => console.log(`   - ${route}`));
  }
  
  // Problemas de conexão
  if (failuresByStatus['CONN_REFUSED'] || failuresByStatus['TIMEOUT'] || failuresByStatus['NO_RESPONSE']) {
    console.log('\n📌 PROBLEMAS DE CONEXÃO:');
    console.log('Causas possíveis:');
    console.log('1. Servidor não está rodando');
    console.log('2. Porta incorreta');
    console.log('3. Firewall bloqueando a conexão');
    console.log('4. Operações muito lentas no servidor');
    
    console.log('\nSoluções sugeridas:');
    console.log('1. Verifique se o servidor está rodando com: node src/server.js');
    console.log('2. Verifique a porta configurada (padrão é 3000)');
    console.log('3. Aumente o timeout para operações lentas');
    console.log('4. Verifique se o Firebase está respondendo');
  }
  
  console.log('\n📌 PRÓXIMOS PASSOS:');
  console.log('1. Execute: node src/setup-test-data.js para criar os dados de teste necessários');
  console.log('2. Reinicie o servidor: node src/server.js');
  console.log('3. Execute este teste novamente');
};

// Testar conexão com o Firebase
const testFirestoreConnection = async () => {
  if (!admin.apps.length) {
    console.log('❌ Firebase Admin não inicializado. Pulando teste de conexão.');
    return false;
  }
  
  try {
    console.log('🔍 Testando conexão com o Firestore...');
    const db = admin.firestore();
    
    // Tentar ler uma coleção (test-connection)
    const testRef = db.collection('test-connection').doc('test');
    await testRef.set({ timestamp: new Date().toISOString() });
    const doc = await testRef.get();
    
    if (doc.exists) {
      console.log('✅ Conexão com o Firestore verificada com sucesso!');
      return true;
    } else {
      console.log('❌ Erro ao verificar conexão com o Firestore: documento não encontrado');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao testar conexão com o Firestore:', error);
    return false;
  }
};

// Função principal para executar todos os testes
const runAllTests = async () => {
  console.log('🚀 Iniciando testes da API Casa do Biscoito...\n');
  
  // Verificar se o servidor está ativo
  try {
    console.log('🔍 Verificando se o servidor está online...');
    await axios.get(`${API_BASE_URL}/teste`, { timeout: TIMEOUT_MS });
    console.log('✅ Servidor online!');
  } catch (error) {
    console.error('❌ Servidor não está respondendo! Certifique-se que está rodando na porta correta.');
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Tente iniciar o servidor com: npm run dev ou node src/server.js');
    }
    return;
  }
  
  // Testar conexão com o Firebase
  await testFirestoreConnection();
  
  // Obter token de autenticação (usuário normal por padrão)
  await getAuthToken(false);
  
  // Testar cada rota
  for (const route of routes) {
    await testRoute(route);
    
    // Para rotas GET e POST, também testa sem autenticação para verificar se o middleware está funcionando
    if (['GET', 'POST'].includes(route.method)) {
      await testRouteWithoutAuth(route);
    }
  }
  
  // Gerar relatório
  generateReport();
};

// Executar os testes
runAllTests();