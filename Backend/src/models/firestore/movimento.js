import { db } from '../../database/connectioDBAdimin.js';

// Função para criar movimento
const criar = async (unidadeId, caixaId, dadosMovimento) => {
  try {
    console.log(`Iniciando criação de movimento para unidade ${unidadeId}, caixa ${caixaId}`);
    
    // Verificando se unidade e caixa existem
    const unidadeRef = db.collection('unidades').doc(unidadeId);
    const unidadeDoc = await unidadeRef.get();
    
    if (!unidadeDoc.exists) {
      console.log(`Unidade ${unidadeId} não encontrada`);
      throw new Error(`Unidade ${unidadeId} não encontrada`);
    }
    
    // Verificando primeiro se estamos usando o ID correto
    const caixasRef = unidadeRef.collection('caixas');
    
    // Tentar buscar o caixa diretamente pelo ID
    const caixaRef = caixasRef.doc(caixaId);
    const caixaDoc = await caixaRef.get();
    
    let caixaRealId = caixaId;
    
    if (!caixaDoc.exists) {
      console.log(`Caixa ${caixaId} não encontrado, verificando se é um número de caixa...`);
      
      // Tentar buscar o caixa pelo número em vez do ID
      // Isso ajuda se o frontend está usando número em vez de ID
      const caixaSnapshot = await caixasRef.where("numero", "==", parseInt(caixaId)).limit(1).get();
      
      if (caixaSnapshot.empty) {
        console.log(`Caixa com número ${caixaId} também não encontrado`);
        throw new Error(`Caixa não encontrado na unidade ${unidadeId}`);
      }
      
      // Use o primeiro documento encontrado
      const caixaDocByNumber = caixaSnapshot.docs[0];
      
      // Atualizar o caixaId para usar o ID correto do documento
      caixaRealId = caixaDocByNumber.id;
      console.log(`Usando o ID de caixa correto: ${caixaRealId}`);
    }
    
    console.log(`Caixa válido (${caixaRealId}), buscando movimentos existentes`);
    
    // Busca movimentos existentes para determinar o próximo ID
    const movimentosRef = caixaRef.collection('movimentos');
    const snapshot = await movimentosRef.get();
    
    console.log(`Encontrados ${snapshot.size} movimentos existentes`);
    
    // Encontrar o maior ID existente (convertendo para número)
    let maiorId = 0;
    
    snapshot.forEach(doc => {
      const idAtual = parseInt(doc.id || '0', 10);
      if (idAtual > maiorId) {
        maiorId = idAtual;
      }
    });
    
    console.log(`Maior ID encontrado: ${maiorId}`);

    // Validar estrutura dos dados do movimento
    if (!dadosMovimento.tipo || !dadosMovimento.forma || !dadosMovimento.valor) {
      throw new Error('Dados obrigatórios incompletos');
    }
    
    // Validar o status do pagamento para entradas
    if (dadosMovimento.tipo === 'entrada' && !['realizado', 'pendente'].includes(dadosMovimento.paymentStatus)) {
      console.log(`Status de pagamento inválido: ${dadosMovimento.paymentStatus}`);
      dadosMovimento.paymentStatus = 'realizado'; // Valor padrão
    }
    
    // Para saídas, o status é sempre "realizado"
    if (dadosMovimento.tipo === 'saida') {
      dadosMovimento.paymentStatus = 'realizado';
    }

    // Gera o próximo ID com 6 dígitos (ex.: "000001")
    const proximoId = (maiorId + 1).toString().padStart(6, '0');
    console.log(`Próximo ID de movimento: ${proximoId}`);
    
    // Cria documento com dados completos
    const novoMovimentoRef = movimentosRef.doc(proximoId);
    
    const dadosCompletos = {
      id: proximoId,
      ...dadosMovimento,
      timestamp: new Date(),
      ativo: true
    };
    
    console.log(`Criando movimento com dados:`, dadosCompletos);
    await novoMovimentoRef.set(dadosCompletos);
    
    console.log(`Movimento ${proximoId} criado com sucesso`);

    return { id: proximoId };
  } catch (error) {
    console.error('Erro detalhado ao criar movimento:', error);
    throw error;
  }
};

// Função para buscar movimentos por caixa com tratamento da data
const buscarPorCaixa = async (unidadeId, caixaId, data = null) => {
  try {
    console.log(`Buscando movimentos da unidade ${unidadeId}, caixa ${caixaId}${data ? `, data ${data}` : ''}`);
    
    // Verificar parâmetros obrigatórios
    if (!unidadeId || !caixaId) {
      throw new Error('IDs de unidade e caixa são obrigatórios');
    }
    
    // Verificar se unidade existe
    const unidadeRef = db.collection('unidades').doc(unidadeId);
    const unidadeDoc = await unidadeRef.get();
    
    if (!unidadeDoc.exists) {
      console.log(`Unidade ${unidadeId} não encontrada`);
      return [];
    }
    
    // Verificando primeiro se estamos usando o ID correto
    const caixasRef = unidadeRef.collection('caixas');
    
    // Tentar buscar o caixa diretamente pelo ID
    const caixaRef = caixasRef.doc(caixaId);
    const caixaDoc = await caixaRef.get();
    
    let caixaRealId = caixaId;
    
    if (!caixaDoc.exists) {
      console.log(`Caixa ${caixaId} não encontrado, verificando se é um número de caixa...`);
      
      // Tentar buscar o caixa pelo número em vez do ID
      const caixaSnapshot = await caixasRef.where("numero", "==", parseInt(caixaId)).limit(1).get();
      
      if (caixaSnapshot.empty) {
        console.log(`Caixa com número ${caixaId} também não encontrado`);
        return [];
      }
      
      // Use o primeiro documento encontrado
      const caixaDocByNumber = caixaSnapshot.docs[0];
      
      // Atualizar o caixaId para usar o ID correto do documento
      caixaRealId = caixaDocByNumber.id;
      console.log(`Usando o ID de caixa correto: ${caixaRealId}`);
    }
    
    // Construir a consulta básica
    const movimentosRef = caixaRef.collection('movimentos');
    let query = movimentosRef.where("ativo", "==", true);

    // Adicionar filtro de data se fornecido
    if (data) {
      // Converte o parâmetro para Date e verifica se é válido
      let dateParsed;
      
      if (data instanceof Date) {
        dateParsed = data;
      } else {
        dateParsed = new Date(data);
      }
      
      if (isNaN(dateParsed.getTime())) {
        throw new Error("Data inválida");
      }

      // Define início e fim do dia para o filtro
      const startOfDay = new Date(dateParsed);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateParsed);
      endOfDay.setHours(23, 59, 59, 999);

      console.log(`Filtrando por data: início=${startOfDay.toISOString()}, fim=${endOfDay.toISOString()}`);

      // Aplicar filtro de data
      query = query.where("timestamp", ">=", startOfDay)
                  .where("timestamp", "<=", endOfDay);
    }

    // Executar a consulta
    console.log('Executando consulta...');
    const snapshot = await query.get();
    console.log(`Encontrados ${snapshot.size} movimentos`);
    
    // Converter dados e adicionar ID do documento
    const movimentos = [];
    
    snapshot.forEach(doc => {
      const dados = doc.data();
      
      // Converter Timestamp para Date se necessário
      let timestamp = dados.timestamp;
      if (timestamp && timestamp.toDate) {
        timestamp = timestamp.toDate();
      }
      
      movimentos.push({
        id: doc.id,
        ...dados,
        timestamp
      });
    });

    // Ordenar os movimentos do mais recente para o mais antigo
    movimentos.sort((a, b) => {
      // Verificar se ambos têm timestamp definido
      if (a.timestamp && b.timestamp) {
        return b.timestamp - a.timestamp;
      }
      return 0;
    });
    
    console.log(`Retornando ${movimentos.length} movimentos`);
    return movimentos;
  } catch (error) {
    console.error("Erro detalhado no buscarPorCaixa:", error);
    throw error;
  }
};

// Função para "deletar" (desativar) um movimento
const deletar = async (unidadeId, caixaId, movimentoId) => {
  try {
    console.log(`Deletando movimento ${movimentoId} do caixa ${caixaId} da unidade ${unidadeId}`);
    
    // Verificar parâmetros obrigatórios
    if (!unidadeId || !caixaId || !movimentoId) {
      throw new Error('IDs de unidade, caixa e movimento são obrigatórios');
    }
    
    // Verificando primeiro se estamos usando o ID correto
    const caixasRef = db.collection('unidades').doc(unidadeId).collection('caixas');
    
    // Tentar buscar o caixa diretamente pelo ID
    const caixaRef = caixasRef.doc(caixaId);
    const caixaDoc = await caixaRef.get();
    
    let caixaRealId = caixaId;
    
    if (!caixaDoc.exists) {
      console.log(`Caixa ${caixaId} não encontrado, verificando se é um número de caixa...`);
      
      // Tentar buscar o caixa pelo número em vez do ID
      const caixaSnapshot = await caixasRef.where("numero", "==", parseInt(caixaId)).limit(1).get();
      
      if (caixaSnapshot.empty) {
        console.log(`Caixa com número ${caixaId} também não encontrado`);
        throw new Error(`Caixa não encontrado na unidade ${unidadeId}`);
      }
      
      // Use o primeiro documento encontrado
      const caixaDocByNumber = caixaSnapshot.docs[0];
      
      // Atualizar o caixaId para usar o ID correto do documento
      caixaRealId = caixaDocByNumber.id;
      console.log(`Usando o ID de caixa correto: ${caixaRealId}`);
    }
    
    // Verificar se o movimento existe
    const movimentoRef = caixaRef.collection('movimentos').doc(movimentoId);
    const movimentoDoc = await movimentoRef.get();
    
    if (!movimentoDoc.exists) {
      console.log(`Movimento ${movimentoId} não encontrado`);
      return false;
    }
    
    // Realizar soft delete
    await movimentoRef.update({ 
      ativo: false,
      deletedAt: new Date()
    });
    
    console.log(`Movimento ${movimentoId} marcado como inativo (soft delete)`);
    return true;
  } catch (error) {
    console.error('Erro detalhado ao deletar movimento:', error);
    throw error;
  }
};

// Função para criar movimentos em lote com writeBatch()
const criarMovimentosEmBatch = async (unidadeId, caixaId, listaMovimentos) => {
  try {
    console.log(`Iniciando criação de movimentações em lote: unidade=${unidadeId}, caixa=${caixaId}`);

    // ------------------------------
    // 1) Verificar se unidade existe
    // ------------------------------
    const unidadeRef = db.collection('unidades').doc(unidadeId);
    const unidadeDoc = await unidadeRef.get();
    if (!unidadeDoc.exists) {
      throw new Error(`Unidade ${unidadeId} não encontrada`);
    }

    // ------------------------------
    // 2) Verificar se caixa existe (ou é número)
    // ------------------------------
    const caixasRef = unidadeRef.collection('caixas');
    let caixaRealId = caixaId;

    const caixaRefDireto = caixasRef.doc(caixaId);
    const caixaDoc = await caixaRefDireto.get();

    if (!caixaDoc.exists) {
      // Se não existe com este ID, tentar achar pelo número
      const caixaSnapshot = await caixasRef
        .where('numero', '==', parseInt(caixaId))
        .limit(1)
        .get();

      if (caixaSnapshot.empty) {
        throw new Error(`Caixa ${caixaId} não encontrado na unidade ${unidadeId}`);
      }

      const caixaDocByNumber = caixaSnapshot.docs[0];
      caixaRealId = caixaDocByNumber.id; // Ajusta para o ID verdadeiro
    }

    // ------------------------------
    // 3) Buscar o maior ID uma só vez
    // ------------------------------
    const caixaRef = caixasRef.doc(caixaRealId);
    const movimentosRef = caixaRef.collection('movimentos');
    const snapshot = await movimentosRef.get();

    let maiorId = 0;
    snapshot.forEach((doc) => {
      const idNum = parseInt(doc.id, 10) || 0;
      if (idNum > maiorId) {
        maiorId = idNum;
      }
    });
    console.log(`Maior ID atual encontrado: ${maiorId}`);

    // ------------------------------
    // 4) Montar um batch e incluir todos os itens
    // ------------------------------
    const batch = db.batch();
    let count = 0;

    for (let i = 0; i < listaMovimentos.length; i++) {
      const mov = listaMovimentos[i];

      // Validações mínimas (ajuste conforme sua necessidade)
      if (!mov.tipo || !mov.forma || mov.valor === undefined) {
        throw new Error(`Movimentação (índice ${i}): tipo, forma e valor são obrigatórios`);
      }

      // Ajustar status do pagamento caso seja saída
      if (mov.tipo === 'saida') {
        mov.paymentStatus = 'realizado';
      } else if (!['realizado', 'pendente'].includes(mov.paymentStatus || '')) {
        mov.paymentStatus = 'realizado';
      }

      // Gera ID sequencial (ex: 000001, 000002, ...)
      maiorId += 1;
      const novoId = String(maiorId).padStart(6, '0');

      // Monta os dados completos
      const dadosCompletos = {
        id: novoId,
        ...mov,
        timestamp: new Date(),
        ativo: true,
      };

      // Referência do novo documento
      const novoMovRef = movimentosRef.doc(novoId);
      // Adiciona ao batch
      batch.set(novoMovRef, dadosCompletos);
      count++;
    }

    // ------------------------------
    // 5) Commit do batch
    // ------------------------------
    if (count > 0) {
      await batch.commit();
      console.log(`Batch de ${count} movimentações criado com sucesso!`);
    } else {
      console.log('Nenhum item válido para criar em lote.');
    }

    return {
      success: true,
      message: `Batch com ${count} movimentações criado com sucesso`,
      quantidade: count
    };

  } catch (error) {
    console.error('Erro ao criar movimentos em batch:', error);
    throw error; // Deixe o controller tratar
  }
};

export { criar, buscarPorCaixa, deletar, criarMovimentosEmBatch };