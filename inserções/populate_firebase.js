// populate_firebase.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Você precisará baixar essa chave do console do Firebase

// Inicializar o app Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Definição das formas de pagamento (baseado na imagem)
const formasPagamento = {
  debito: ['getnet', 'onebank', 'cielo', 'rede', 'outros'],
  credito: ['getnet', 'onebank', 'cielo', 'rede', 'outros'],
  ticket: [
    { nome: 'sodexo', tipos: ['alimentacao', 'refeicao'] },
    { nome: 'alelo', tipos: ['alimentacao', 'refeicao'] },
    { nome: 'vr', tipos: ['alimentacao', 'refeicao'] },
    { nome: 'ben', tipos: ['alimentacao', 'refeicao'] },
    { nome: 'greencard', tipos: [] },
    { nome: 'personalcard', tipos: [] },
    { nome: 'outros', tipos: [] }
  ],
  pix: ['maquina', 'qrcode']
};

// Categorias de despesas
const categoriasDespesas = [
  'Fornecedores',
  'Aluguel',
  'Energia',
  'Água',
  'Internet',
  'Telefone',
  'Folha de Pagamento',
  'Impostos',
  'Manutenção',
  'Material de Limpeza',
  'Material de Escritório',
  'Embalagens',
  'Frete',
  'Marketing',
  'Equipamentos',
  'Taxa de Cartão',
  'Software/Sistema',
  'Consultoria',
  'Outros'
];

// Função para criar um documento de forma de pagamento padrão para cada caixa
function createDefaultPaymentMethods() {
  const paymentMethods = {};
  
  // Débito
  formasPagamento.debito.forEach(method => {
    paymentMethods[`debito_${method}`] = false;
  });
  
  // Crédito
  formasPagamento.credito.forEach(method => {
    paymentMethods[`credito_${method}`] = false;
  });
  
  // Ticket - estrutura mais complexa
  formasPagamento.ticket.forEach(ticket => {
    if (ticket.tipos.length > 0) {
      ticket.tipos.forEach(tipo => {
        paymentMethods[`ticket_${ticket.nome}_${tipo}`] = false;
      });
    } else {
      paymentMethods[`ticket_${ticket.nome}`] = false;
    }
  });
  
  // Pix
  formasPagamento.pix.forEach(method => {
    paymentMethods[`pix_${method}`] = false;
  });
  
  // Adiciona dinheiro como método de pagamento
  paymentMethods['dinheiro'] = true;
  
  return paymentMethods;
}

// DADOS REAIS DAS UNIDADES - Sem nenhuma modificação ou invenção
const unidadesReais = [
  {
    nome: "DOÇURA DA PORTELA",
    numeroUnidade: 1,
    cnpj: "18343099000190",
    email: "cb142@recab.com.br",
    responsavel: "THALITA SILVA",
    contatoResponsavel: "21981729420",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "ESTRADA",
      nomeLogradouro: "ESTRADA DO PORTELA",
      numero: "106",
      complemento: "LOJA",
      bairro: "MADUREIRA",
      cep: "21351051"
    },
    quantidadeCaixas: 4,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "MARECHAL COMERCIO",
    numeroUnidade: 1,
    cnpj: "43209708000160",
    email: "CB47@RECAB.COM.BR",
    responsavel: "ADRIELY",
    contatoResponsavel: "21996786717",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "RUA",
      nomeLogradouro: "LATIFE LUVIZARO",
      numero: "81",
      complemento: "A LOJA",
      bairro: "MARECHAL HERMES",
      cep: "21555550"
    },
    quantidadeCaixas: 3,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "DELICIAS PAVUNA",
    numeroUnidade: 1,
    cnpj: "39956923000157",
    email: "CB49@RECAB.COM.BR",
    responsavel: "BERNARDO",
    contatoResponsavel: "21973566518",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "AVENIDA",
      nomeLogradouro: "SARGENTO DE MILICIAS",
      numero: "61",
      complemento: "LOJA",
      bairro: "PAVUNA",
      cep: "21532290"
    },
    quantidadeCaixas: 3,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "DELICIAS PAVUNA",
    numeroUnidade: 2,
    cnpj: "39956923000157", // Mesmo CNPJ conforme especificado
    email: "CB49@RECAB.COM.BR",
    responsavel: "BERNARDO",
    contatoResponsavel: "21973566518",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "AVENIDA",
      nomeLogradouro: "SARGENTO DE MILICIAS",
      numero: "61",
      complemento: "LOJA",
      bairro: "PAVUNA",
      cep: "21532290"
    },
    quantidadeCaixas: 2,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "PORTELA 2022",
    numeroUnidade: 2,
    cnpj: "48829270000136",
    email: "cb190@recab.com.br",
    responsavel: "THAMIRES",
    contatoResponsavel: "21982526867",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "ESTRADA",
      nomeLogradouro: "ESTRADA DO PORTELA",
      numero: "247",
      complemento: "LOJA",
      bairro: "MADUREIRA",
      cep: "21351050"
    },
    quantidadeCaixas: 2,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "BRT ALVORADA",
    numeroUnidade: 1,
    cnpj: "50840377000127",
    email: "CB202@RECAB.COM.BR",
    responsavel: "KAROL",
    contatoResponsavel: "21997059395",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "AVENIDA",
      nomeLogradouro: "DAS AMERICAS",
      numero: "",
      complemento: "LOJA 25 PLATAFORMA B",
      bairro: "BARRA DA TIJUCA",
      cep: "22631000"
    },
    quantidadeCaixas: 6,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "ROCHA MIRANDA",
    numeroUnidade: 1,
    cnpj: "19189544000171",
    email: "CB56@RECAB.COM.BR",
    responsavel: "RAQUEL",
    contatoResponsavel: "21992881230",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "RUA",
      nomeLogradouro: "DOS TOPÁZIOS",
      numero: "30",
      complemento: "LOJA A",
      bairro: "ROCHA MIRANDA",
      cep: "21540020"
    },
    quantidadeCaixas: 3,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "DELICIAS DE MARECHAL",
    numeroUnidade: 2,
    cnpj: "47005444000183",
    email: "CB184@RECAB.COM.BR",
    responsavel: "VICTOR",
    contatoResponsavel: "21987419593",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "AVENIDA",
      nomeLogradouro: "GENERAL OSVALDO C DE FARIAS",
      numero: "65",
      complemento: "",
      bairro: "MARECHAL HERMES",
      cep: "21610480"
    },
    quantidadeCaixas: 1,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "GULOSEIMAS PAVUNA",
    numeroUnidade: 2,
    cnpj: "43067975000140",
    email: "cb28@recab.com.br",
    responsavel: "BERNARDO",
    contatoResponsavel: "21973566518",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "LARGO",
      nomeLogradouro: "LARGO DA PAVUNA",
      numero: "45",
      complemento: "E OUTROS",
      bairro: "PAVUNA",
      cep: "21520310"
    },
    quantidadeCaixas: 2,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "BRT ALVORADA",
    numeroUnidade: 2,
    cnpj: "50840377000208",
    email: "CB213@RECAB.COM.BR",
    responsavel: "WILIANE",
    contatoResponsavel: "21990215774",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "AVENIDA",
      nomeLogradouro: "DAS AMERICAS",
      numero: "",
      complemento: "LOJA 24 PLATAFORMA A",
      bairro: "BARRA DA TIJUCA",
      cep: "22631000"
    },
    quantidadeCaixas: 8,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "VILA VALQUEIRE",
    numeroUnidade: 1,
    cnpj: "48042895000153",
    email: "CB189@RECAB.COM.BR",
    responsavel: "ISABELLE",
    contatoResponsavel: "2195058505",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "PRAÇA",
      nomeLogradouro: "PRAÇA VALQUEIRE 08",
      numero: "8",
      complemento: "LOJA A",
      bairro: "VILA VALQUEIRE",
      cep: "21330570"
    },
    quantidadeCaixas: 3,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Unidades de TESTE (apenas para fins de teste)
const unidadesTeste = [
  {
    nome: "TESTE1",
    numeroUnidade: 1,
    cnpj: "00000000000001",
    email: "teste1@casadobiscoito.com.br",
    responsavel: "TESTE",
    contatoResponsavel: "21999999999",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "RUA",
      nomeLogradouro: "RUA DE TESTE",
      numero: "100",
      complemento: "LOJA TESTE",
      bairro: "CENTRO",
      cep: "20000000"
    },
    quantidadeCaixas: 2,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    nome: "TESTE2",
    numeroUnidade: 1,
    cnpj: "00000000000002",
    email: "teste2@casadobiscoito.com.br",
    responsavel: "TESTE",
    contatoResponsavel: "21999999998",
    acessoMaster: "DANNYLLO",
    contatoMaster: "21995054241",
    endereco: {
      logradouro: "RUA",
      nomeLogradouro: "AVENIDA DE TESTE",
      numero: "200",
      complemento: "LOJA TESTE",
      bairro: "CENTRO",
      cep: "20000001"
    },
    quantidadeCaixas: 2,
    status: "ativo",
    dataCriacao: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Função para gerar um número de documento aleatório
function gerarNumeroDocumento() {
  return Math.floor(Math.random() * 9000000000) + 1000000000;
}

// Função para gerar um valor aleatório dentro de um intervalo
function valorAleatorio(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

// Função para gerar uma data aleatória nos últimos 30 dias
function dataAleatoria(dias = 30) {
  const hoje = new Date();
  const dataAnterior = new Date();
  dataAnterior.setDate(hoje.getDate() - dias);
  
  const timestamp = dataAnterior.getTime() + Math.random() * (hoje.getTime() - dataAnterior.getTime());
  return new Date(timestamp);
}

// Função para escolher aleatoriamente de um array
function escolherAleatorio(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Gera uma movimentação de entrada aleatória para UNIDADES DE TESTE
function gerarEntrada() {
  // Determine a forma de pagamento
  let tipoForma = escolherAleatorio(['debito', 'credito', 'ticket', 'pix', 'dinheiro']);
  let formaPagamento = '';
  let formaPagamentoDetalhada = '';
  
  if (tipoForma === 'debito') {
    formaPagamento = 'debito';
    formaPagamentoDetalhada = `debito_${escolherAleatorio(formasPagamento.debito)}`;
  } else if (tipoForma === 'credito') {
    formaPagamento = 'credito';
    formaPagamentoDetalhada = `credito_${escolherAleatorio(formasPagamento.credito)}`;
  } else if (tipoForma === 'ticket') {
    formaPagamento = 'ticket';
    const ticketEscolhido = escolherAleatorio(formasPagamento.ticket);
    if (ticketEscolhido.tipos.length > 0) {
      const tipoEscolhido = escolherAleatorio(ticketEscolhido.tipos);
      formaPagamentoDetalhada = `ticket_${ticketEscolhido.nome}_${tipoEscolhido}`;
    } else {
      formaPagamentoDetalhada = `ticket_${ticketEscolhido.nome}`;
    }
  } else if (tipoForma === 'pix') {
    formaPagamento = 'pix';
    formaPagamentoDetalhada = `pix_${escolherAleatorio(formasPagamento.pix)}`;
  } else {
    formaPagamento = 'dinheiro';
    formaPagamentoDetalhada = 'dinheiro';
  }
  
  return {
    tipo: 'entrada',
    data: admin.firestore.Timestamp.fromDate(dataAleatoria()),
    valor: parseFloat(valorAleatorio(5, 50)),
    descricao: 'Venda',
    nomeCliente: 'Cliente Teste',
    numeroDocumento: gerarNumeroDocumento().toString(),
    forma: formaPagamento,
    formaPagamentoDetalhada: formaPagamentoDetalhada,
    paymentStatus: Math.random() > 0.05 ? 'realizado' : 'pendente',
    categoriaEntrada: 'venda',
    moedasEntrada: formaPagamento === 'dinheiro' ? Math.floor(Math.random() * 10) : '',
    moedasSaida: formaPagamento === 'dinheiro' ? Math.floor(Math.random() * 5) : ''
  };
}

// Gera uma movimentação de saída aleatória para UNIDADES DE TESTE
function gerarSaida() {
  const categoria = escolherAleatorio(categoriasDespesas);
  
  return {
    tipo: 'saida',
    data: admin.firestore.Timestamp.fromDate(dataAleatoria()),
    valor: parseFloat(valorAleatorio(10, 100)),
    descricao: `Despesa de teste - ${categoria}`,
    categoria: categoria,
    fornecedor: 'Fornecedor Teste',
    fornecedorCnpj: '00000000000000',
    numeroDocumento: gerarNumeroDocumento().toString(),
    forma: 'dinheiro',
    paymentStatus: 'realizado'
  };
}

// Função para adicionar a coleção de formas de pagamento e categorias de despesas
async function addReferenceData() {
  const batch = db.batch();
  
  // Adiciona formas de pagamento
  const methodsRef = db.collection('formasPagamento').doc('tipos');
  batch.set(methodsRef, { 
    debito: formasPagamento.debito,
    credito: formasPagamento.credito,
    ticket: formasPagamento.ticket,
    pix: formasPagamento.pix,
    outros: ['dinheiro'],
    ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Adiciona categorias de despesas
  const categoriasRef = db.collection('categoriasDespesa').doc('tipos');
  batch.set(categoriasRef, {
    categorias: categoriasDespesas,
    ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp()
  });
  
  await batch.commit();
  console.log('Dados de referência adicionados com sucesso!');
}

// Função para adicionar unidades reais (SEM MOVIMENTAÇÕES)
async function addRealUnits() {
  try {
    // Processa cada unidade real
    for (const unidade of unidadesReais) {
      // Cria documento da unidade
      const unidadeRef = db.collection('unidades').doc();
      await unidadeRef.set(unidade);
      
      console.log(`Unidade ${unidade.nome} #${unidade.numeroUnidade} adicionada com ID: ${unidadeRef.id}`);
      
      // Cria as caixas para cada unidade (sem movimentações)
      const batch = db.batch();
      
      for (let i = 1; i <= unidade.quantidadeCaixas; i++) {
        const caixaRef = unidadeRef.collection('caixas').doc();
        
        // Criar um objeto caixa com valores padrão
        const caixa = {
          numero: i,
          status: 'fechado',
          saldoInicial: 0,
          saldoAtual: 0,
          formasPagamento: createDefaultPaymentMethods(),
          dataCriacao: admin.firestore.FieldValue.serverTimestamp(),
          ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp()
        };
        
        batch.set(caixaRef, caixa);
      }
      
      await batch.commit();
      console.log(`${unidade.quantidadeCaixas} caixas adicionadas para a unidade ${unidade.nome}`);
    }
    
    console.log('Unidades reais adicionadas com sucesso - SEM MOVIMENTAÇÕES');
    
  } catch (error) {
    console.error('Erro ao adicionar unidades reais:', error);
  }
}

// Função para adicionar unidades de teste COM MOVIMENTAÇÕES
async function addTestUnits() {
  try {
    // Processa cada unidade de teste
    for (const unidade of unidadesTeste) {
      // Cria documento da unidade
      const unidadeRef = db.collection('unidades').doc();
      await unidadeRef.set(unidade);
      
      console.log(`Unidade de teste ${unidade.nome} adicionada com ID: ${unidadeRef.id}`);
      
      // Cria as caixas para cada unidade
      for (let i = 1; i <= unidade.quantidadeCaixas; i++) {
        const caixaRef = unidadeRef.collection('caixas').doc();
        
        // Criar um objeto caixa com valores padrão
        const caixa = {
          numero: i,
          status: Math.random() > 0.5 ? 'fechado' : 'aberto',
          saldoInicial: parseFloat(valorAleatorio(100, 200)),
          saldoAtual: 0, // Será calculado após adicionar as movimentações
          formasPagamento: createDefaultPaymentMethods(),
          dataCriacao: admin.firestore.FieldValue.serverTimestamp(),
          ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp()
        };
        
        await caixaRef.set(caixa);
        console.log(`Caixa ${i} adicionado para a unidade de teste ${unidade.nome}`);
        
        // Gera movimentações aleatórias para cada caixa DE TESTE
        const numEntradas = Math.floor(Math.random() * 10) + 5; // 5-15 entradas
        const numSaidas = Math.floor(Math.random() * 5) + 2;    // 2-7 saídas
        
        let saldoAtual = caixa.saldoInicial;
        const movimentacoesBatch = db.batch();
        
        // Gera entradas para as unidades de TESTE
        for (let j = 0; j < numEntradas; j++) {
          const entrada = gerarEntrada();
          const entradaRef = caixaRef.collection('movimentacoes').doc();
          movimentacoesBatch.set(entradaRef, entrada);
          saldoAtual += entrada.valor;
        }
        
        // Gera saídas para as unidades de TESTE
        for (let j = 0; j < numSaidas; j++) {
          const saida = gerarSaida();
          const saidaRef = caixaRef.collection('movimentacoes').doc();
          movimentacoesBatch.set(saidaRef, saida);
          saldoAtual -= saida.valor;
        }
        
        // Commit das movimentações
        await movimentacoesBatch.commit();
        console.log(`${numEntradas} entradas e ${numSaidas} saídas adicionadas para o Caixa ${i} de teste`);
        
        // Atualiza o saldo atual do caixa
        await caixaRef.update({ saldoAtual: parseFloat(saldoAtual.toFixed(2)) });
        console.log(`Saldo atualizado para o Caixa ${i} de teste: R$ ${saldoAtual.toFixed(2)}`);
      }
    }
    
    console.log('Unidades de teste adicionadas com sucesso COM MOVIMENTAÇÕES');
    
  } catch (error) {
    console.error('Erro ao adicionar unidades de teste:', error);
  }
}

// Adicionar usuários básicos
async function addUsers() {
  try {
    const userRef = db.collection('usuarios').doc();
    await userRef.set({
      nome: "Dannyllo",
      email: "dannyllo@casadobiscoito.com.br",
      telefone: "21995054241",
      cargo: "Administrador",
      superusuario: true,
      selectedUnits: [], // Acesso a todas unidades como superusuário
      ultimoAcesso: admin.firestore.FieldValue.serverTimestamp(),
      dataCriacao: admin.firestore.FieldValue.serverTimestamp(),
      status: "ativo"
    });
    
    const testUserRef = db.collection('usuarios').doc();
    await testUserRef.set({
      nome: "Usuário Teste",
      email: "teste@casadobiscoito.com.br",
      telefone: "21999999999",
      cargo: "Teste",
      superusuario: false,
      selectedUnits: ["00000000000001", "00000000000002"], // Acesso às unidades de teste
      ultimoAcesso: admin.firestore.FieldValue.serverTimestamp(),
      dataCriacao: admin.firestore.FieldValue.serverTimestamp(),
      status: "ativo"
    });
    
    console.log('Usuários adicionados com sucesso!');
    
  } catch (error) {
    console.error('Erro ao adicionar usuários:', error);
  }
}

// Executar a função principal e adicionar usuários
// Add this to your executeAll function
async function addEmptyPagamentosCollections() {
  try {
    const unidadesSnapshot = await db.collection('unidades').get();
    
    for (const unidadeDoc of unidadesSnapshot.docs) {
      const caixasSnapshot = await unidadeDoc.ref.collection('caixas').get();
      
      for (const caixaDoc of caixasSnapshot.docs) {
        // Create an empty pagamentos collection by adding then deleting a placeholder document
        const placeholderRef = caixaDoc.ref.collection('pagamentos').doc('placeholder');
        await placeholderRef.set({ placeholder: true });
        await placeholderRef.delete();
        
        console.log(`Empty pagamentos collection created for caixa ${caixaDoc.id} in unidade ${unidadeDoc.id}`);
      }
    }
    
    console.log('Empty pagamentos collections created successfully');
  } catch (error) {
    console.error('Error creating empty pagamentos collections:', error);
  }
}

// Add this to your executeAll function
async function executeAll() {
  try {
    await addReferenceData();
    await addRealUnits(); 
    await addTestUnits();
    await addUsers();
    await addEmptyPagamentosCollections(); // Add this line
    console.log('Processo completo!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante o processo:', error);
    process.exit(1);
  }
}

// Iniciar o processo
executeAll();