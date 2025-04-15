// src/controllers/paymentMethodController.js
import { db } from '../database/connectioDBAdimin.js';
import { registrarLog } from '../models/firestore/log.js';

export const listarMetodosPagamento = async (req, res) => {
  try {
    const snapshot = await db.collection('paymentMethods').get();
    const metodos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Register log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Listar Métodos de Pagamento",
      status: "success",
      mensagem: "Métodos de pagamento listados com sucesso"
    });
    
    res.json(metodos);
  } catch (error) {
    console.error('Erro ao listar métodos de pagamento:', error);
    
    // Register error log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Listar Métodos de Pagamento",
      status: "error",
      mensagem: "Erro ao listar métodos de pagamento",
      detalhes: { error: error.message }
    });
    
    res.status(500).json({
      error: 'Erro interno ao listar métodos de pagamento'
    });
  }
};

export const criarMetodoPagamento = async (req, res) => {
  try {
    const { name, type = 'entrada', category } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({
        error: 'Nome e categoria do método de pagamento são obrigatórios'
      });
    }
    
    // Generate id from name and category (slugify)
    const id = `${category}_${name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')}`;
    
    const metodoRef = db.collection('paymentMethods').doc(id);
    
    await metodoRef.set({
      name,
      type,
      category,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Register log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Criar Método de Pagamento",
      status: "success",
      mensagem: "Método de pagamento criado com sucesso",
      detalhes: { método: name, categoria: category, id }
    });
    
    res.status(201).json({
      id,
      name,
      type,
      category,
      message: 'Método de pagamento criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar método de pagamento:', error);
    
    // Register error log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Criar Método de Pagamento",
      status: "error",
      mensagem: "Erro ao criar método de pagamento",
      detalhes: { error: error.message }
    });
    
    res.status(500).json({
      error: 'Erro interno ao criar método de pagamento'
    });
  }
};

export const atualizarMetodoPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, category } = req.body;
    
    // Validation
    if (!name || !category) {
      return res.status(400).json({
        error: 'Nome e categoria do método de pagamento são obrigatórios'
      });
    }
    
    // Check if method exists
    const metodoRef = db.collection('paymentMethods').doc(id);
    const doc = await metodoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Método de pagamento não encontrado'
      });
    }
    
    // Update method
    await metodoRef.update({
      name,
      type: type || 'entrada',
      category,
      updatedAt: new Date()
    });
    
    // Register log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Atualizar Método de Pagamento",
      status: "success",
      mensagem: "Método de pagamento atualizado com sucesso",
      detalhes: { id, novoNome: name }
    });
    
    res.json({
      id,
      name,
      type: type || 'entrada',
      category,
      message: 'Método de pagamento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar método de pagamento:', error);
    
    // Register error log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Atualizar Método de Pagamento",
      status: "error",
      mensagem: "Erro ao atualizar método de pagamento",
      detalhes: { error: error.message }
    });
    
    res.status(500).json({
      error: 'Erro interno ao atualizar método de pagamento'
    });
  }
};

export const excluirMetodoPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if method exists
    const metodoRef = db.collection('paymentMethods').doc(id);
    const doc = await metodoRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Método de pagamento não encontrado'
      });
    }
    
    // Check if method is being used in movements
    const movimentosRef = db.collectionGroup('movimentos').where('forma', '==', id);
    const movimentos = await movimentosRef.get();
    
    if (!movimentos.empty) {
      return res.status(400).json({
        error: 'Não é possível excluir um método de pagamento em uso'
      });
    }
    
    // Delete method
    await metodoRef.delete();
    
    // Register log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Excluir Método de Pagamento",
      status: "success",
      mensagem: "Método de pagamento excluído com sucesso",
      detalhes: { id }
    });
    
    res.json({
      message: 'Método de pagamento excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir método de pagamento:', error);
    
    // Register error log
    await registrarLog({
      uuidUser: req.user?.uid || 'sistema',
      funcionalidade: "Excluir Método de Pagamento",
      status: "error",
      mensagem: "Erro ao excluir método de pagamento",
      detalhes: { error: error.message }
    });
    
    res.status(500).json({
      error: 'Erro interno ao excluir método de pagamento'
    });
  }
};