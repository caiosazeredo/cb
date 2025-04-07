// src/models/firestore/unidade.js (atualizado)
import { db } from '../../database/connectioDBAdimin.js';

export const criar = async (dadosUnidade) => {
  try {
    const snapshot = await db.collection('unidades').get();
    const unidades = snapshot.docs.map(doc => doc.data());

    // Achar o maior ID numérico já existente
    const maiorId = unidades.reduce((max, unidade) => {
      const idAtual = parseInt(unidade.id || '0', 10);
      return idAtual > max ? idAtual : max;
    }, 0);

    // Gera o próximo ID (exemplo: "006", "007" etc.)
    const proximoId = (maiorId + 1).toString().padStart(3, '0');

    // Cria (ou sobrescreve) o documento com ID personalizado
    const novaUnidadeRef = db.collection('unidades').doc(proximoId);

    await novaUnidadeRef.set({
      id: proximoId,
      ...dadosUnidade,
      dataCriacao: new Date(),
      ativo: true
    });

    return proximoId;
  } catch (error) {
    console.error('Erro ao criar unidade:', error);
    throw error;
  }
};

export const buscarTodas = async () => {
  try {
    const snapshot = await db.collection('unidades').get();
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error('Erro ao buscar unidades:', error);
    throw error;
  }
};

// Novo método para buscar unidade por ID
export const buscarPorId = async (id) => {
  try {
    // Validar se o ID foi fornecido
    if (!id) {
      throw new Error('ID da unidade é obrigatório');
    }

    // Buscar a unidade no Firestore
    const unidadeRef = db.collection('unidades').doc(id);
    const doc = await unidadeRef.get();

    // Verificar se o documento existe
    if (!doc.exists) {
      return null; // Unidade não encontrada
    }

    // Verificar se a unidade está ativa
    const unidade = doc.data();

    // Retornar os dados da unidade
    return {
      id: doc.id,
      ...unidade
    };
  } catch (error) {
    console.error(`Erro ao buscar unidade com ID ${id}:`, error);
    throw error;
  }
};

export const atualizar = async (id, dadosAtualizacao) => {
  try {
    // Campos que NÃO podem ser atualizados diretamente
    const camposRestritos = ['id', 'dataCriacao', 'uuidCriador'];

    // Filtrar apenas os campos permitidos
    const dadosFiltrados = Object.entries(dadosAtualizacao)
      .filter(([key]) => !camposRestritos.includes(key))
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

    // Adiciona a data de atualização
    dadosFiltrados.updatedAt = new Date().toISOString();

    // Verifica se a unidade existe
    const docRef = db.collection('unidades').doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return null; // Unidade não encontrada
    }

    // Atualiza o documento no Firestore
    await docRef.update(dadosFiltrados);

    // Retorna a unidade atualizada
    const updatedDoc = await docRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error("Erro ao atualizar unidade:", error);
    throw error;
  }
};

export const deletar = async (id) => {
  try {
    const docRef = db.collection('unidades').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // Não existe a unidade
      return false;
    }

    // Marca como inativa (soft delete)
    await docRef.update({
      ativo: false,
      deletedAt: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error("Erro ao deletar unidade:", error);
    throw error;
  }
};