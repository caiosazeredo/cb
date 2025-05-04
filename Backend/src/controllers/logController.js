import { registrarLog, buscarLogsPorUsuario } from '../models/firestore/log.js';

export const criarLog = async (req, res) => {
  try {
    const { uuidUser, funcionalidade, status, mensagem, detalhes } = req.body;

    if (!uuidUser || !funcionalidade || !status || !mensagem) {
      return res.status(400).json({
        error: 'uuidUser, funcionalidade, status e mensagem são obrigatórios'
      });
    }

    const novoLog = await registrarLog({ uuidUser, funcionalidade, status, mensagem, detalhes });

    res.status(201).json({
      message: 'Log registrado com sucesso',
      log: novoLog
    });
  } catch (error) {
    console.error('Erro ao criar log:', error);
    res.status(500).json({
      error: 'Erro interno ao registrar log'
    });
  }
};

export const listarLogsUsuario = async (req, res) => {
  try {
    const uuidUser = req.user.uuid; // Obtém o UUID do usuário autenticado

    const logs = await buscarLogsPorUsuario(uuidUser);

    res.json(logs);
  } catch (error) {
    console.error('Erro ao listar logs:', error);
    res.status(500).json({
      error: 'Erro interno ao listar logs'
    });
  }
};
