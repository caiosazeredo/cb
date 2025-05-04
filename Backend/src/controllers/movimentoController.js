import { criar, buscarPorCaixa, deletar, criarMovimentosEmBatch } from '../models/firestore/movimento.js';
import { parse, isValid } from 'date-fns';
import { registrarLog } from '../models/firestore/log.js';

/**
 * Criar um único movimento
 */
export const criarMovimento = async (req, res) => {
  const { unidadeId, caixaId } = req.params;
  const dadosMovimento = req.body;
  const uuidUser = req.user?.uid || 'sistema';  // Ou outra forma de capturar quem está fazendo a requisição

  try {
    console.log(`Requisição para criar movimento: unidade=${unidadeId}, caixa=${caixaId}`);
    console.log('Dados do movimento:', dadosMovimento);

    // Validações básicas
    if (!dadosMovimento.tipo || !dadosMovimento.forma || dadosMovimento.valor === undefined) {
      // Registrar LOG de erro
      await registrarLog({
        uuidUser,
        funcionalidade: "Criar Movimento",
        status: "error",
        mensagem: "Tentativa de criar movimento com dados incompletos",
        detalhes: { dadosMovimento }
      });

      return res.status(400).json({
        error: 'Tipo, forma de pagamento e valor são obrigatórios'
      });
    }

    // Validação do tipo
    if (!['entrada', 'saida'].includes(dadosMovimento.tipo)) {
      await registrarLog({
        uuidUser,
        funcionalidade: "Criar Movimento",
        status: "error",
        mensagem: "Tipo de movimento inválido",
        detalhes: { tipoRecebido: dadosMovimento.tipo }
      });

      return res.status(400).json({
        error: 'Tipo de movimento deve ser "entrada" ou "saida"'
      });
    }

    // Validação da forma de pagamento
    if (!['dinheiro', 'credito', 'debito', 'pix', 'ticket'].includes(dadosMovimento.forma)) {
      await registrarLog({
        uuidUser,
        funcionalidade: "Criar Movimento",
        status: "error",
        mensagem: "Forma de pagamento inválida",
        detalhes: { formaRecebida: dadosMovimento.forma }
      });

      return res.status(400).json({
        error: 'Forma de pagamento inválida'
      });
    }

    // Validação do status do pagamento (obrigatório para entradas)
    if (dadosMovimento.tipo === 'entrada' && !['realizado', 'pendente'].includes(dadosMovimento.paymentStatus)) {
      await registrarLog({
        uuidUser,
        funcionalidade: "Criar Movimento",
        status: "error",
        mensagem: "Status do pagamento inválido para entrada",
        detalhes: { statusRecebido: dadosMovimento.paymentStatus }
      });

      return res.status(400).json({
        error: 'Status do pagamento é obrigatório para entradas e deve ser "realizado" ou "pendente"'
      });
    }

    // Validação do valor
    const valor = parseFloat(dadosMovimento.valor);
    if (isNaN(valor) || valor <= 0) {
      await registrarLog({
        uuidUser,
        funcionalidade: "Criar Movimento",
        status: "error",
        mensagem: "Valor inválido (<= 0 ou não numérico)",
        detalhes: { valorRecebido: dadosMovimento.valor }
      });

      return res.status(400).json({
        error: 'Valor deve ser um número positivo'
      });
    }

    // ================================
    // Criação do movimento de fato
    // ================================
    const resultado = await criar(unidadeId, caixaId, {
      ...dadosMovimento,
      valor: valor
    });

    console.log(`Movimento criado com sucesso: ${JSON.stringify(resultado)}`);

    // Registrar LOG de sucesso
    await registrarLog({
      uuidUser,
      funcionalidade: "Criar Movimento",
      status: "success",
      mensagem: "Movimento criado com sucesso",
      detalhes: {
        unidadeId,
        caixaId,
        movimentoId: resultado.id
      }
    });

    return res.status(201).json({
      ...resultado,
      message: 'Movimento registrado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar movimento:', error);

    // Registrar LOG de erro no try/catch
    try {
      await registrarLog({
        uuidUser,
        funcionalidade: "Criar Movimento",
        status: "error",
        mensagem: "Erro interno ao criar movimento",
        detalhes: { error: error.message }
      });
    } catch (logError) {
      console.error("Erro ao registrar log de erro (criarMovimento):", logError);
    }

    return res.status(500).json({
      error: 'Erro interno ao registrar movimento'
    });
  }
};

/**
 * Listar movimentos de um caixa, com filtro de data opcional
 */
export const listarMovimentos = async (req, res) => {
  const { unidadeId, caixaId } = req.params;
  const { data } = req.query;
  const uuidUser = req.user?.uid || 'sistema';

  try {
    console.log(`Requisição para listar movimentos: unidade=${unidadeId}, caixa=${caixaId}, data=${data || 'todas'}`);

    let dateParsed = null;
    if (data) {
      dateParsed = parse(data, 'yyyy-MM-dd', new Date());

      if (!isValid(dateParsed)) {
        // Tentar interpretar de outra forma
        const tempDate = new Date(data);
        if (!isValid(tempDate)) {
          await registrarLog({
            uuidUser,
            funcionalidade: "Listar Movimentos",
            status: "error",
            mensagem: "Data inválida no query param",
            detalhes: { dataRecebida: data }
          });

          return res.status(400).json({
            error: 'Formato de data inválido. Use YYYY-MM-DD'
          });
        }
        dateParsed = tempDate;
      }
    }

    // Buscar movimentos
    const movimentos = await buscarPorCaixa(unidadeId, caixaId, dateParsed);

    console.log(`Retornando ${movimentos.length} movimentos`);

    // Registrar LOG de sucesso
    await registrarLog({
      uuidUser,
      funcionalidade: "Listar Movimentos",
      status: "success",
      mensagem: "Listagem de movimentos realizada",
      detalhes: {
        unidadeId,
        caixaId,
        quantidadeMovimentos: movimentos.length,
        dataFiltro: data || 'todas'
      }
    });

    return res.json(movimentos);

  } catch (error) {
    console.error('Erro ao listar movimentos:', error);

    // Registrar LOG de erro
    try {
      await registrarLog({
        uuidUser,
        funcionalidade: "Listar Movimentos",
        status: "error",
        mensagem: "Erro interno ao listar movimentos",
        detalhes: { error: error.message }
      });
    } catch (logError) {
      console.error("Erro ao registrar log (listarMovimentos):", logError);
    }

    return res.status(500).json({
      error: 'Erro interno ao listar movimentos'
    });
  }
};

/**
 * Deletar (soft-delete) um movimento
 */
export const deletarMovimento = async (req, res) => {
  const { unidadeId, caixaId, movimentoId } = req.params;
  const uuidUser = req.user?.uid || 'sistema';

  try {
    console.log(`Requisição para deletar movimento: unidade=${unidadeId}, caixa=${caixaId}, movimento=${movimentoId}`);

    if (!unidadeId || !caixaId || !movimentoId) {
      await registrarLog({
        uuidUser,
        funcionalidade: "Deletar Movimento",
        status: "error",
        mensagem: "IDs de unidade, caixa ou movimento ausentes",
        detalhes: { unidadeId, caixaId, movimentoId }
      });

      return res.status(400).json({
        error: 'IDs de unidade, caixa e movimento são obrigatórios'
      });
    }

    // Deletar o movimento
    const resultado = await deletar(unidadeId, caixaId, movimentoId);

    if (!resultado) {
      // Não encontrado
      await registrarLog({
        uuidUser,
        funcionalidade: "Deletar Movimento",
        status: "error",
        mensagem: "Movimento não encontrado para deletar",
        detalhes: { movimentoId }
      });

      return res.status(404).json({
        error: 'Movimento não encontrado'
      });
    }

    console.log(`Movimento ${movimentoId} deletado com sucesso`);

    // Registrar LOG de sucesso
    await registrarLog({
      uuidUser,
      funcionalidade: "Deletar Movimento",
      status: "success",
      mensagem: "Movimento deletado com sucesso",
      detalhes: { unidadeId, caixaId, movimentoId }
    });

    return res.json({
      message: 'Movimento deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar movimento:', error);

    // Registrar LOG de erro
    try {
      await registrarLog({
        uuidUser,
        funcionalidade: "Deletar Movimento",
        status: "error",
        mensagem: "Erro interno ao deletar movimento",
        detalhes: { error: error.message }
      });
    } catch (logError) {
      console.error("Erro ao registrar log (deletarMovimento):", logError);
    }

    return res.status(500).json({
      error: 'Erro interno ao deletar movimento'
    });
  }
};

/**
 * Criar múltiplos movimentos usando batch
 */
export const criarMovimentosEmLoteBatch = async (req, res) => {
  const { unidadeId, caixaId } = req.params;
  const { movimentos } = req.body;
  const uuidUser = req.user?.uid || 'sistema';

  try {
    if (!movimentos || !Array.isArray(movimentos) || movimentos.length === 0) {
      await registrarLog({
        uuidUser,
        funcionalidade: "Criar Movimentos em Lote (Batch)",
        status: "error",
        mensagem: "Array de movimentos inválido ou vazio",
        detalhes: { movimentos }
      });

      return res.status(400).json({
        error: 'É necessário enviar um array de movimentações em "movimentos"'
      });
    }

    // Chamando a função que faz o batch de forma atômica
    const resultado = await criarMovimentosEmBatch(unidadeId, caixaId, movimentos);

    // Registrar LOG de sucesso
    await registrarLog({
      uuidUser,
      funcionalidade: "Criar Movimentos em Lote (Batch)",
      status: "success",
      mensagem: "Movimentos criados em batch com sucesso",
      detalhes: {
        unidadeId,
        caixaId,
        quantidade: resultado.quantidade
      }
    });

    return res.status(201).json({
      message: resultado.message,
      quantidade: resultado.quantidade
    });

  } catch (error) {
    console.error('Erro ao criar lote em batch:', error);

    // Registrar LOG de erro
    try {
      await registrarLog({
        uuidUser,
        funcionalidade: "Criar Movimentos em Lote (Batch)",
        status: "error",
        mensagem: "Erro interno ao registrar movimentações em lote",
        detalhes: { error: error.message }
      });
    } catch (logError) {
      console.error("Erro ao registrar log (criarMovimentosEmLoteBatch):", logError);
    }

    return res.status(500).json({
      error: 'Erro interno ao registrar movimentações em lote'
    });
  }
};