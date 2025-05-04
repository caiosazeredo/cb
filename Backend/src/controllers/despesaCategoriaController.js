// src/controllers/despesaCategoriaController.js
import { db } from '../database/connectioDBAdimin.js';
import { registrarLog } from '../models/firestore/log.js';

export const listarCategorias = async (req, res) => {
  try {
    const snapshot = await db.collection('despesasCategorias').get();
    const categorias = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Register log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Listar Categorias de Despesa",
      status: "success",
      mensagem: "Categorias de despesa listadas com sucesso"
    });
    
    res.json(categorias);
  } catch (error) {
    console.error('Erro ao listar categorias de despesa:', error);
    
    // Register error log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Listar Categorias de Despesa",
      status: "error",
      mensagem: "Erro ao listar categorias de despesa",
      detalhes: { error: error.message }
    });
    
    res.status(500).json({
      error: 'Erro interno ao listar categorias de despesa'
    });
  }
};

export const criarCategoria = async (req, res) => {
  try {
    const { name, type = 'saida' } = req.body;
    
    if (!name) {
      return res.status(400).json({
        error: 'Nome da categoria é obrigatório'
      });
    }
    
    // Generate id from name (slugify)
    const id = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_');
    
    const categoriaRef = db.collection('despesasCategorias').doc(id);
    
    await categoriaRef.set({
      name,
      type,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Register log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Criar Categoria de Despesa",
      status: "success",
      mensagem: "Categoria de despesa criada com sucesso",
      detalhes: { categoria: name, id }
    });
    
    res.status(201).json({
      id,
      name,
      type,
      message: 'Categoria de despesa criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar categoria de despesa:', error);
    
    // Register error log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Criar Categoria de Despesa",
      status: "error",
      mensagem: "Erro ao criar categoria de despesa",
      detalhes: { error: error.message }
    });
    
    res.status(500).json({
      error: 'Erro interno ao criar categoria de despesa'
    });
  }
};

export const atualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({
        error: 'Nome da categoria é obrigatório'
      });
    }
    
    // Check if category exists
    const categoriaRef = db.collection('despesasCategorias').doc(id);
    const doc = await categoriaRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Categoria de despesa não encontrada'
      });
    }
    
    // Update category
    await categoriaRef.update({
      name,
      type: type || 'saida',
      updatedAt: new Date()
    });
    
    // Register log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Atualizar Categoria de Despesa",
      status: "success",
      mensagem: "Categoria de despesa atualizada com sucesso",
      detalhes: { id, novoNome: name }
    });
    
    res.json({
      id,
      name,
      type: type || 'saida',
      message: 'Categoria de despesa atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar categoria de despesa:', error);
    
    // Register error log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Atualizar Categoria de Despesa",
      status: "error",
      mensagem: "Erro ao atualizar categoria de despesa",
      detalhes: { error: error.message }
    });
    
    res.status(500).json({
      error: 'Erro interno ao atualizar categoria de despesa'
    });
  }
};

export const excluirCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const categoriaRef = db.collection('despesasCategorias').doc(id);
    const doc = await categoriaRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Categoria de despesa não encontrada'
      });
    }
    
    // Check if category is being used in movements
    const movimentosRef = db.collectionGroup('movimentos').where('expenseCategory', '==', id);
    const movimentos = await movimentosRef.get();
    
    if (!movimentos.empty) {
      return res.status(400).json({
        error: 'Não é possível excluir uma categoria em uso'
      });
    }
    
    // Delete category
    await categoriaRef.delete();
    
    // Register log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Excluir Categoria de Despesa",
      status: "success",
      mensagem: "Categoria de despesa excluída com sucesso",
      detalhes: { id }
    });
    
    res.json({
      message: 'Categoria de despesa excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir categoria de despesa:', error);
    
    // Register error log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Excluir Categoria de Despesa",
      status: "error",
      mensagem: "Erro ao excluir categoria de despesa",
      detalhes: { error: error.message }
    });
    
    res.status(500).json({
      error: 'Erro interno ao excluir categoria de despesa'
    });
  }
};