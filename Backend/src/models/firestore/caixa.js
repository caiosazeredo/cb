// src/models/firestore/caixa.js (atualizado)
import { db } from '../../database/connectioDBAdimin.js';

export const criar = async (unidadeId, dadosCaixa) => {
  try {
    console.log(`Iniciando criação de caixa para unidade ${unidadeId}`);
    
    // Busca caixas existentes para determinar o próximo ID
    const caixasRef = db.collection('unidades').doc(unidadeId).collection('caixas');
    const snapshot = await caixasRef.get();
    
    if (snapshot.size > 0) {
      console.log(`Encontrados ${snapshot.size} caixas existentes`);
    } else {
      console.log('Nenhum caixa existente encontrado');
    }
    
    const caixas = snapshot.docs.map(doc => ({
      ...doc.data()
    }));

    // Encontra o maior número de caixa
    const maiorNumero = caixas.reduce((max, caixa) => {
      const numeroAtual = parseInt(caixa.numero || '0');
      return numeroAtual > max ? numeroAtual : max;
    }, 0);
    
    console.log(`Maior número de caixa encontrado: ${maiorNumero}`);

    // Gera o próximo número
    const proximoNumero = maiorNumero + 1;
    const caixaId = proximoNumero.toString().padStart(3, '0');
    
    console.log(`Gerando novo caixa com ID: ${caixaId} e número: ${proximoNumero}`);

    // Cria documento com ID personalizado
    const novoCaixaRef = db.collection('unidades').doc(unidadeId).collection('caixas').doc(caixaId);
    
    const novoCaixa = {
      id: caixaId,
      numero: proximoNumero,
      status: 'fechado',
      dataCriacao: new Date(),
      ultimaAbertura: null,
      ultimoFechamento: null,
      formasPagamento: {
        dinheiro: true,
        credito: true,
        debito: true,
        pix: true,
        ticket: true
      },
      ativo: true
    };
    
    await novoCaixaRef.set(novoCaixa);
    console.log(`Caixa ${caixaId} criado com sucesso`);

    return { id: caixaId, numero: proximoNumero };
  } catch (error) {
    console.error('Erro detalhado ao criar caixa:', error);
    throw error;
  }
};

export const buscarPorUnidade = async (unidadeId) => {
  try {
    console.log(`Buscando caixas para unidade ${unidadeId}`);
    
    // Validar unidadeId
    if (!unidadeId) {
      throw new Error('ID da unidade é obrigatório');
    }
    
    // Verificar se a unidade existe
    const unidadeRef = db.collection('unidades').doc(unidadeId);
    const unidadeDoc = await unidadeRef.get();
    
    if (!unidadeDoc.exists) {
      console.log(`Unidade ${unidadeId} não encontrada`);
      return [];
    }
    
    console.log(`Unidade ${unidadeId} encontrada, buscando caixas...`);
    
    // Buscar caixas ativos
    const caixasRef = db.collection('unidades').doc(unidadeId).collection('caixas');
    const snapshot = await caixasRef.where("ativo", "==", true).get();
    
    console.log(`Encontrados ${snapshot.size} caixas ativos`);
    
    // Mapear resultados
    const caixas = snapshot.docs.map(doc => {
      const data = doc.data();
      // Converter timestamps para objetos Date do JavaScript
      const dataCriacao = data.dataCriacao?.toDate ? data.dataCriacao.toDate() : data.dataCriacao;
      const ultimaAbertura = data.ultimaAbertura?.toDate ? data.ultimaAbertura.toDate() : data.ultimaAbertura;
      const ultimoFechamento = data.ultimoFechamento?.toDate ? data.ultimoFechamento.toDate() : data.ultimoFechamento;
      
      return {
        id: doc.id,
        ...data,
        dataCriacao,
        ultimaAbertura,
        ultimoFechamento
      };
    });
    
    // Ordenar por número
    caixas.sort((a, b) => a.numero - b.numero);
    
    return caixas;
  } catch (error) {
    console.error('Erro detalhado ao buscar caixas:', error);
    throw error;
  }
};

// Método para buscar caixa específico por ID
export const buscarPorId = async (unidadeId, caixaId) => {
  try {
    console.log(`Buscando caixa ${caixaId} da unidade ${unidadeId}`);
    
    // Validações
    if (!unidadeId || !caixaId) {
      throw new Error('IDs de unidade e caixa são obrigatórios');
    }
    
    // Buscar o documento do caixa
    const caixaRef = db.collection('unidades').doc(unidadeId).collection('caixas').doc(caixaId);
    const doc = await caixaRef.get();
    
    // Verificar se o documento existe
    if (!doc.exists) {
      console.log(`Caixa ${caixaId} não encontrado`);
      return null;
    }
    
    // Verificar se o caixa está ativo
    const caixa = doc.data();
    if (caixa.ativo === false) {
      console.log(`Caixa ${caixaId} está inativo`);
      return null;
    }
    
    // Converter timestamps para objetos Date do JavaScript
    const dataCriacao = caixa.dataCriacao?.toDate ? caixa.dataCriacao.toDate() : caixa.dataCriacao;
    const ultimaAbertura = caixa.ultimaAbertura?.toDate ? caixa.ultimaAbertura.toDate() : caixa.ultimaAbertura;
    const ultimoFechamento = caixa.ultimoFechamento?.toDate ? caixa.ultimoFechamento.toDate() : caixa.ultimoFechamento;
    
    return {
      id: doc.id,
      ...caixa,
      dataCriacao,
      ultimaAbertura,
      ultimoFechamento
    };
  } catch (error) {
    console.error(`Erro ao buscar caixa ${caixaId} da unidade ${unidadeId}:`, error);
    throw error;
  }
};

export const atualizar = async (unidadeId, caixaId, dadosAtualizacao) => {
  try {
    console.log(`Atualizando caixa ${caixaId} da unidade ${unidadeId}`);
    
    // Validações
    if (!unidadeId || !caixaId) {
      throw new Error('IDs de unidade e caixa são obrigatórios');
    }
    
    const caixaRef = db.collection('unidades').doc(unidadeId).collection('caixas').doc(caixaId);
    
    const caixaDoc = await caixaRef.get();
    if (!caixaDoc.exists) {
      console.log(`Caixa ${caixaId} não encontrado`);
      throw new Error('Caixa não encontrado');
    }

    // Filtrar apenas os campos permitidos para atualização
    const dadosPermitidos = {
      formasPagamento: dadosAtualizacao.formasPagamento,
      updatedAt: new Date()
    };

    console.log(`Atualizando com dados:`, dadosPermitidos);
    await caixaRef.update(dadosPermitidos);

    // Buscar caixa atualizado
    const caixaAtualizado = await caixaRef.get();
    return { id: caixaAtualizado.id, ...caixaAtualizado.data() };
  } catch (error) {
    console.error('Erro detalhado ao atualizar caixa:', error);
    throw error;
  }
};

export const deletar = async (unidadeId, caixaId) => {
  try {
    console.log(`Deletando (soft delete) caixa ${caixaId} da unidade ${unidadeId}`);
    
    // Validações
    if (!unidadeId || !caixaId) {
      throw new Error('IDs de unidade e caixa são obrigatórios');
    }
    
    const caixaRef = db.collection('unidades').doc(unidadeId).collection('caixas').doc(caixaId);
    
    // Verificar se existe
    const caixaDoc = await caixaRef.get();
    if (!caixaDoc.exists) {
      console.log(`Caixa ${caixaId} não encontrado`);
      return false;
    }
    
    // Realizar soft delete
    await caixaRef.update({ 
      ativo: false,
      deletedAt: new Date()
    });
    
    console.log(`Caixa ${caixaId} marcado como inativo (soft delete)`);
    return true;
  } catch (error) {
    console.error('Erro detalhado ao deletar caixa:', error);
    throw error;
  }
};