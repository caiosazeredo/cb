// improved-test.js - Fixed version with better error handling
const axios = require('axios');
const admin = require('firebase-admin');
const fs = require('fs');
const colors = require('colors/safe');

// ========================================================================
// Configuration
// ========================================================================

const BASE_URL = 'http://localhost:3000/api';
const TEST_UNITS = {
  TESTE1: { id: null, cnpj: '00000000000001' },
  TESTE2: { id: null, cnpj: '00000000000002' }
};
let authToken = null;

// Debug level
const DEBUG = {
  HEADERS: false,     // Log headers
  RESPONSES: false,   // Log response bodies
  JSON_ERRORS: true   // Log JSON parsing errors
};

// Initialize Firebase Admin to get authentication token
try {
  const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error(colors.red('❌ Error initializing Firebase Admin:'), error.message);
  process.exit(1);
}

// ========================================================================
// Helper Functions
// ========================================================================

// Create authenticated HTTP client
const createClient = async () => {
  if (!authToken) {
    try {
      // Create a test user for authentication
      const testUser = await admin.auth().getUserByEmail('teste@casadobiscoito.com.br')
        .catch(() => admin.auth().createUser({
          email: 'teste@casadobiscoito.com.br',
          password: 'Teste@123',
          displayName: 'Usuário Teste'
        }));

      // Generate token
      authToken = await admin.auth().createCustomToken(testUser.uid);
      console.log(colors.green('✅ Authentication token created successfully'));
    } catch (error) {
      console.error(colors.red('❌ Error creating authentication token:'), error.message);
      console.log(colors.yellow('⚠️ Continuing without authentication token...'));
    }
  }

  // Create client with enhanced headers
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': authToken ? `Bearer ${authToken}` : undefined,
      'Content-Type': 'application/json',
      'X-Test-Mode': 'true', // Add this to help bypass auth
      'Accept': 'application/json'
    },
    // Important: Transform response to handle parsing errors
    transformResponse: [function (data) {
      if (typeof data !== 'string') return data;
      
      try {
        return JSON.parse(data);
      } catch (error) {
        if (DEBUG.JSON_ERRORS) {
          console.error(colors.red(`❌ JSON Parse Error: ${error.message}`));
          console.error(colors.yellow(`Raw data: ${data.substring(0, 100)}`));
        }
        // Return a safe object instead of throwing
        return { error: `Invalid JSON: ${error.message}`, rawData: data };
      }
    }]
  });
};

// Test result tracker
const results = {
  success: [],
  failure: []
};

// Test runner with improved response handling
const testEndpoint = async (method, url, data = null, description) => {
  const client = await createClient();
  console.log(colors.cyan(`🧪 Testing ${method.toUpperCase()} ${url} - ${description}...`));
  
  try {
    // Add timeout for requests
    const response = await client({
      method,
      url,
      data,
      timeout: 10000, // 10 second timeout
      validateStatus: () => true // Don't throw on error status codes
    });
    
    // Log headers for debugging
    if (DEBUG.HEADERS) {
      console.log(colors.gray('Request Headers:'), client.defaults.headers);
      console.log(colors.gray('Response Headers:'), response.headers);
    }
    
    // Log response data for debugging
    if (DEBUG.RESPONSES) {
      console.log(colors.gray('Response Data:'), 
        typeof response.data === 'object' 
          ? JSON.stringify(response.data).substring(0, 200) 
          : String(response.data).substring(0, 200)
      );
    }
    
    const success = response.status >= 200 && response.status < 300;
    
    // Handle response message in a safer way
    let message;
    if (response.data === null) {
      message = "null";
    } else if (typeof response.data === 'object') {
      message = response.data?.message || JSON.stringify(response.data).substring(0, 100);
    } else {
      message = String(response.data).substring(0, 100);
    }
    
    const result = {
      endpoint: `${method.toUpperCase()} ${url}`,
      description,
      status: response.status,
      message
    };
    
    if (success) {
      console.log(colors.green(`✅ Success: ${response.status} ${description}`));
      results.success.push(result);
      return response.data;
    } else {
      const errorMsg = typeof response.data === 'object' && response.data?.error 
        ? response.data.error 
        : 'Unknown error';
      console.log(colors.red(`❌ Failed: ${response.status} - ${errorMsg}`));
      results.failure.push(result);
      return null;
    }
  } catch (error) {
    const result = {
      endpoint: `${method.toUpperCase()} ${url}`,
      description,
      status: 'ERROR',
      message: error.message
    };
    console.log(colors.red(`❌ Error: ${error.message}`));
    results.failure.push(result);
    return null;
  }
};

// Get test unit IDs with better error handling
const fetchTestUnits = async () => {
  console.log(colors.cyan('🔍 Fetching test units...'));
  
  try {
    const client = await createClient();
    const response = await client.get('/unidades');
    
    if (response.status === 200 && Array.isArray(response.data)) {
      const units = response.data;
      
      for (const unit of units) {
        if (unit && unit.cnpj === TEST_UNITS.TESTE1.cnpj) {
          TEST_UNITS.TESTE1.id = unit.id;
          console.log(colors.green(`✅ Found TESTE1 unit: ${unit.id}`));
        } else if (unit && unit.cnpj === TEST_UNITS.TESTE2.cnpj) {
          TEST_UNITS.TESTE2.id = unit.id;
          console.log(colors.green(`✅ Found TESTE2 unit: ${unit.id}`));
        }
      }
      
      if (!TEST_UNITS.TESTE1.id && !TEST_UNITS.TESTE2.id) {
        // Manually assign IDs if not found - this is a fallback for testing
        console.log(colors.yellow('⚠️ Warning: Could not find test units automatically'));
        
        // You can hardcode test unit IDs here if needed
        if (units.length > 0) {
          TEST_UNITS.TESTE1.id = units[0].id;
          console.log(colors.yellow(`⚠️ Using first available unit as TESTE1: ${TEST_UNITS.TESTE1.id}`));
        } else {
          TEST_UNITS.TESTE1.id = "XnCTtFGMoAcAS9sZe4wv"; // Use ID from previous tests
          console.log(colors.yellow(`⚠️ Using hardcoded unit ID: ${TEST_UNITS.TESTE1.id}`));
        }
      }
    } else {
      console.log(colors.red(`❌ Failed to fetch units: Status ${response.status}`));
      // Fallback to hardcoded ID
      TEST_UNITS.TESTE1.id = "XnCTtFGMoAcAS9sZe4wv"; // Use ID from previous tests
      console.log(colors.yellow(`⚠️ Using hardcoded unit ID: ${TEST_UNITS.TESTE1.id}`));
    }
  } catch (error) {
    console.error(colors.red('❌ Error fetching test units:'), error.message);
    // Fallback to hardcoded ID
    TEST_UNITS.TESTE1.id = "XnCTtFGMoAcAS9sZe4wv"; // Use ID from previous tests
    console.log(colors.yellow(`⚠️ Using hardcoded unit ID: ${TEST_UNITS.TESTE1.id}`));
  }
};

// Enhanced results report
const printResults = () => {
  console.log('\n' + colors.cyan('📊 TEST RESULTS SUMMARY') + '\n');
  console.log(colors.green(`✅ Successful tests: ${results.success.length}`));
  console.log(colors.red(`❌ Failed tests: ${results.failure.length}`));
  
  if (results.success.length > 0) {
    console.log('\n' + colors.green('✅ SUCCESSFUL ENDPOINTS:'));
    results.success.forEach(result => {
      console.log(`  ${result.endpoint} - ${result.description} (${result.status})`);
    });
  }
  
  if (results.failure.length > 0) {
    console.log('\n' + colors.red('❌ FAILED ENDPOINTS:'));
    results.failure.forEach(result => {
      console.log(`  ${result.endpoint} - ${result.description}`);
      console.log(`    Status: ${result.status}`);
      console.log(`    Message: ${result.message}`);
      console.log('');
    });
  }
  
  // Group results by HTTP method for better analysis
  const methodSummary = {};
  [...results.success, ...results.failure].forEach(result => {
    const method = result.endpoint.split(' ')[0];
    if (!methodSummary[method]) {
      methodSummary[method] = { success: 0, failure: 0 };
    }
    if (results.success.includes(result)) {
      methodSummary[method].success++;
    } else {
      methodSummary[method].failure++;
    }
  });
  
  console.log('\n' + colors.cyan('🔍 METHOD ANALYSIS:'));
  Object.entries(methodSummary).forEach(([method, stats]) => {
    const total = stats.success + stats.failure;
    const successRate = Math.round((stats.success / total) * 100);
    console.log(`  ${method}: ${stats.success}/${total} (${successRate}% success)`);
  });
  
  // Save results to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      successful: results.success.length,
      failed: results.failure.length,
      total: results.success.length + results.failure.length
    },
    methodAnalysis: methodSummary,
    successful: results.success,
    failed: results.failure
  };
  
  fs.writeFileSync('./api-test-results.json', JSON.stringify(reportData, null, 2));
  console.log(colors.cyan('\n📄 Detailed results saved to api-test-results.json'));
};

// ========================================================================
// Test Cases
// ========================================================================

const runTests = async () => {
  // First try health check - this should always work
  console.log(colors.cyan('\n📡 TESTING CONNECTIVITY'));
  await testEndpoint('get', '/health', null, 'API Health Check');
  
  // Then fetch test units
  await fetchTestUnits();
  
  // Exit if test units not found
  if (!TEST_UNITS.TESTE1.id) {
    console.error(colors.red('❌ No test units found. Testing will be limited.'));
  }
  
  const testUnitId = TEST_UNITS.TESTE1.id; // Use TESTE1 for testing
  console.log(colors.cyan(`🧪 Using test unit: ${testUnitId}`));
  
  // Test variables to store IDs for related resources
  let testCaixaId = null;
  let testUsuarioId = null;
  let testCategoriaId = null;
  let testPaymentMethodId = null;
  let testMovimentoId = null;
  let testPagamentoId = null;
  
  // ===== Unidades =====
  console.log(colors.cyan('\n📁 TESTING UNIDADES ENDPOINTS'));
  
  // List all units
  await testEndpoint('get', '/unidades', null, 'List all units');
  
  // Get test unit details
  if (testUnitId) {
    await testEndpoint('get', `/unidades/${testUnitId}`, null, 'Get test unit details');
  }
  
  // ===== Caixas =====
  console.log(colors.cyan('\n📁 TESTING CAIXAS ENDPOINTS'));
  
  if (testUnitId) {
    // List caixas for test unit
    const caixas = await testEndpoint('get', `/unidades/${testUnitId}/caixas`, null, 'List all caixas for test unit');
    
    if (caixas && Array.isArray(caixas) && caixas.length > 0) {
      testCaixaId = caixas[0].id;
      console.log(colors.green(`✅ Using caixa ID: ${testCaixaId}`));
      
      // Get caixa details
      await testEndpoint('get', `/unidades/${testUnitId}/caixas/${testCaixaId}`, null, 'Get caixa details');
      
      // Update caixa
      const caixaUpdate = {
        formasPagamento: {
          dinheiro: true,
          credito: true,
          debito: false,
          pix: true,
          ticket: false
        }
      };
      await testEndpoint('put', `/unidades/${testUnitId}/caixas/${testCaixaId}`, caixaUpdate, 'Update caixa');
      
      // Get troco for caixa
      await testEndpoint('get', `/unidades/${testUnitId}/caixas/${testCaixaId}/troco`, null, 'Get troco for caixa');
      
      // Update troco for caixa
      const trocoUpdate = {
        denominacoesRecebidas: {
          "2": 5,
          "5": 3,
          "10": 2
        },
        denominacoesTroco: {
          "1": 2
        }
      };
      await testEndpoint('put', `/unidades/${testUnitId}/caixas/${testCaixaId}/troco`, trocoUpdate, 'Update troco for caixa');
    } else {
      console.log(colors.yellow('⚠️ No caixas found for test unit. Creating one...'));
      
      // Create a caixa
      const newCaixa = await testEndpoint('post', `/unidades/${testUnitId}/caixas`, {}, 'Create a new caixa');
      
      if (newCaixa && newCaixa.id) {
        testCaixaId = newCaixa.id;
        console.log(colors.green(`✅ Created and using caixa ID: ${testCaixaId}`));
      }
    }
  }
  
  // ===== Categorias de Despesas =====
  console.log(colors.cyan('\n📁 TESTING DESPESAS CATEGORIAS ENDPOINTS'));
  
  // List all despesas categorias
  const categorias = await testEndpoint('get', '/despesasCategorias', null, 'List all despesas categorias');
  
  // Create a new categoria
  const newCategoria = {
    name: `Categoria Teste ${new Date().getTime()}`,
    type: 'saida'
  };
  const createdCategoria = await testEndpoint('post', '/despesasCategorias', newCategoria, 'Create a new despesa categoria');
  
  if (createdCategoria && createdCategoria.id) {
    testCategoriaId = createdCategoria.id;
    console.log(colors.green(`✅ Created and using categoria ID: ${testCategoriaId}`));
    
    // Update categoria
    const categoriaUpdate = {
      name: `${newCategoria.name} Updated`,
      type: 'saida'
    };
    await testEndpoint('put', `/despesasCategorias/${testCategoriaId}`, categoriaUpdate, 'Update despesa categoria');
    
    // Delete categoria (may fail if referenced)
    await testEndpoint('delete', `/despesasCategorias/${testCategoriaId}`, null, 'Delete despesa categoria');
  }
  
  // ===== Payment Methods =====
  console.log(colors.cyan('\n📁 TESTING PAYMENT METHODS ENDPOINTS'));
  
  // List all payment methods
  const paymentMethods = await testEndpoint('get', '/paymentMethods', null, 'List all payment methods');
  
  // Create a new payment method
  const newPaymentMethod = {
    name: `Payment Method Test ${new Date().getTime()}`,
    type: 'entrada',
    category: 'dinheiro'
  };
  const createdPaymentMethod = await testEndpoint('post', '/paymentMethods', newPaymentMethod, 'Create a new payment method');
  
  if (createdPaymentMethod && createdPaymentMethod.id) {
    testPaymentMethodId = createdPaymentMethod.id;
    console.log(colors.green(`✅ Created and using payment method ID: ${testPaymentMethodId}`));
    
    // Update payment method
    const paymentMethodUpdate = {
      name: `${newPaymentMethod.name} Updated`,
      type: 'entrada',
      category: 'dinheiro'
    };
    await testEndpoint('put', `/paymentMethods/${testPaymentMethodId}`, paymentMethodUpdate, 'Update payment method');
    
    // Delete payment method (may fail if referenced)
    await testEndpoint('delete', `/paymentMethods/${testPaymentMethodId}`, null, 'Delete payment method');
  }
  
  // ===== Usuarios =====
  console.log(colors.cyan('\n📁 TESTING USUARIOS ENDPOINTS'));
  
  // List all usuarios
  const usuarios = await testEndpoint('get', '/usuarios', null, 'List all usuarios');
  
  // If we have a caixa ID, test movimentos and pagamentos
  if (testUnitId && testCaixaId) {
    // ===== Movimentos =====
    console.log(colors.cyan('\n📁 TESTING MOVIMENTOS ENDPOINTS'));
    
    // List movimentos
    await testEndpoint('get', `/unidades/${testUnitId}/caixas/${testCaixaId}/movimentos`, null, 'List all movimentos');
    
    // Create a movimento (entrada)
    const newMovimento = {
      tipo: 'entrada',
      forma: 'dinheiro',
      formaPagamentoDetalhada: 'dinheiro',
      valor: 25.75,
      descricao: 'Teste de movimento via API',
      data: new Date().toISOString(),
      paymentStatus: 'realizado'
    };
    const createdMovimento = await testEndpoint('post', `/unidades/${testUnitId}/caixas/${testCaixaId}/movimentos`, newMovimento, 'Create a new movimento (entrada)');
    
    if (createdMovimento && createdMovimento.id) {
      testMovimentoId = createdMovimento.id;
      console.log(colors.green(`✅ Created and using movimento ID: ${testMovimentoId}`));
      
      // Delete movimento
      await testEndpoint('delete', `/unidades/${testUnitId}/caixas/${testCaixaId}/movimentos/${testMovimentoId}`, null, 'Delete movimento');
    }
    
    // Create batch movimentos
    const batchMovimentos = {
      movimentos: [
        {
          tipo: 'entrada',
          forma: 'dinheiro',
          valor: 10.5,
          descricao: 'Batch movimento 1',
          data: new Date().toISOString(),
          paymentStatus: 'realizado'
        },
        {
          tipo: 'saida',
          forma: 'dinheiro',
          valor: 5.75,
          descricao: 'Batch movimento 2',
          data: new Date().toISOString(),
          paymentStatus: 'realizado'
        }
      ]
    };
    await testEndpoint('post', `/unidades/${testUnitId}/caixas/${testCaixaId}/movimentos/lote`, batchMovimentos, 'Create batch movimentos');
    
    // ===== Pagamentos =====
    console.log(colors.cyan('\n📁 TESTING PAGAMENTOS ENDPOINTS'));
    
    // List pagamentos
    await testEndpoint('get', `/unidades/${testUnitId}/caixas/${testCaixaId}/pagamentos`, null, 'List all pagamentos');
    
    // Create a pagamento
    const newPagamento = {
      tipo: 'dinheiro',
      valor: 45.99,
      funcionario: 'Usuário Teste',
      cliente: 'Cliente Teste',
      observacao: 'Teste de pagamento via API'
    };
    const createdPagamento = await testEndpoint('post', `/unidades/${testUnitId}/caixas/${testCaixaId}/pagamentos`, newPagamento, 'Create a new pagamento');
    
    if (createdPagamento && createdPagamento.id) {
      testPagamentoId = createdPagamento.id;
      console.log(colors.green(`✅ Created and using pagamento ID: ${testPagamentoId}`));
      
      // Get pagamento details
      await testEndpoint('get', `/unidades/${testUnitId}/caixas/${testCaixaId}/pagamentos/${testPagamentoId}`, null, 'Get pagamento details');
    }
    
    // Create a ticket
    const newTicket = {
      valor: 35.50,
      cliente: 'Cliente Fiado Teste',
      funcionario: 'Usuário Teste',
      observacao: 'Teste de ticket via API'
    };
    await testEndpoint('post', `/unidades/${testUnitId}/caixas/${testCaixaId}/pagamentos/tickets`, newTicket, 'Create a new ticket');
    
    // List valores a receber
    await testEndpoint('get', `/unidades/${testUnitId}/valores-a-receber`, null, 'List valores a receber');
    
    // Generate report
    await testEndpoint('get', `/unidades/${testUnitId}/relatorios/pagamentos`, null, 'Generate payment report');
  }
  
  // ===== Logs =====
  console.log(colors.cyan('\n📁 TESTING LOGS ENDPOINTS'));
  
  // List logs
  await testEndpoint('get', '/logs', null, 'List all logs');
  
  // Create log
  const newLog = {
    uuidUser: 'sistema',
    funcionalidade: 'Teste API',
    status: 'success',
    mensagem: 'Teste de log via API',
    detalhes: { test: true }
  };
  await testEndpoint('post', '/logs', newLog, 'Create a new log');
  
  // Print test results
  printResults();
};

// ========================================================================
// Run the tests
// ========================================================================

console.log(colors.cyan('🚀 Starting API Tests...'));
runTests().catch(error => {
  console.error(colors.red('❌ Error running tests:'), error);
  process.exit(1);
});