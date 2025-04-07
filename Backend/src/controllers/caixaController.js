import { criar, buscarPorUnidade, buscarPorId, deletar, atualizar } from '../models/firestore/caixa.js';

export const criarCaixa = async (req, res) => {
  try {
    const { unidadeId } = req.params;
    
    console.log(`Requisição para criar caixa na unidade ${unidadeId}`);
    
    // Validação do ID da unidade
    if (!unidadeId) {
      return res.status(400).json({ 
        error: 'ID da unidade é obrigatório' 
      });
    }
    
    const resultado = await criar(unidadeId, {});

    console.log(`Caixa criado com sucesso: ${JSON.stringify(resultado)}`);
    
    res.status(201).json({ 
      ...resultado,
      message: 'Caixa criado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao criar caixa:', error);
    res.status(500).json({ 
      error: 'Erro interno ao criar caixa',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const listarCaixas = async (req, res) => {
  try {
    const { unidadeId } = req.params;
    
    console.log(`Requisição para listar caixas da unidade ${unidadeId}`);
    
    // Validação do ID da unidade
    if (!unidadeId) {
      return res.status(400).json({ 
        error: 'ID da unidade é obrigatório' 
      });
    }
    
    const caixas = await buscarPorUnidade(unidadeId);
    
    console.log(`Retornando ${caixas.length} caixas para a unidade ${unidadeId}`);
    
    res.json(caixas);
  } catch (error) {
    console.error('Erro ao listar caixas:', error);
    res.status(500).json({ 
      error: 'Erro interno ao listar caixas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Novo método para buscar caixa por ID
export const buscarCaixa = async (req, res) => {
  try {
    const { unidadeId, caixaId } = req.params;
    
    console.log(`Requisição para buscar caixa ${caixaId} da unidade ${unidadeId}`);
    
    // Validação dos IDs
    if (!unidadeId || !caixaId) {
      return res.status(400).json({ 
        error: 'IDs de unidade e caixa são obrigatórios' 
      });
    }
    
    const caixa = await buscarPorId(unidadeId, caixaId);
    
    if (!caixa) {
      return res.status(404).json({
        error: 'Caixa não encontrado'
      });
    }
    
    res.json(caixa);
  } catch (error) {
    console.error('Erro ao buscar caixa:', error);
    res.status(500).json({ 
      error: 'Erro interno ao buscar caixa',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const deletarCaixa = async (req, res) => {
  try {
    const { unidadeId, caixaId } = req.params;
    
    console.log(`Requisição para deletar caixa ${caixaId} da unidade ${unidadeId}`);
    
    // Validação dos IDs
    if (!unidadeId || !caixaId) {
      return res.status(400).json({ 
        error: 'IDs de unidade e caixa são obrigatórios' 
      });
    }
    
    const resultado = await deletar(unidadeId, caixaId);
    
    if (!resultado) {
      return res.status(404).json({
        error: 'Caixa não encontrado'
      });
    }
    
    console.log(`Caixa ${caixaId} deletado com sucesso`);
    
    res.json({ 
      message: 'Caixa deletado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar caixa:', error);
    res.status(500).json({ 
      error: 'Erro interno ao deletar caixa',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const atualizarCaixa = async (req, res) => {
  try {
    const { unidadeId, caixaId } = req.params;
    const dadosAtualizacao = req.body;
    
    console.log(`Requisição para atualizar caixa ${caixaId} da unidade ${unidadeId}`);
    
    // Validações
    if (!unidadeId || !caixaId) {
      return res.status(400).json({
        error: 'IDs de unidade e caixa são obrigatórios'
      });
    }

    if (!dadosAtualizacao.formasPagamento) {
      return res.status(400).json({
        error: 'Formas de pagamento são obrigatórias'
      });
    }

    const caixaAtualizado = await atualizar(unidadeId, caixaId, dadosAtualizacao);
    
    console.log(`Caixa ${caixaId} atualizado com sucesso`);
    
    res.json({
      message: 'Caixa atualizado com sucesso',
      caixa: caixaAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar caixa:', error);
    if (error.message === 'Caixa não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({
      error: 'Erro interno ao atualizar caixa',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};