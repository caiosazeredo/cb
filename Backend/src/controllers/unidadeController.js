import { criar, buscarTodas, buscarPorId as buscarUnidadePorId, atualizar, deletar } from '../models/firestore/unidade.js';
import { registrarLog } from '../models/firestore/log.js';
import { buscarPorId as buscarUsuarioPorId } from '../models/firestore/usuario.js'; // para checar permissões

export const criarUnidade = async (req, res) => {
  try {
    const { nome, endereco, telefone } = req.body;
    const uuidUser = req.user.uid; // Quem está fazendo a requisição (ajuste conforme seu middleware)

    if (!nome || !endereco || !telefone) {
      return res.status(400).json({
        error: 'Nome, endereço e telefone são obrigatórios'
      });
    }

    // Exemplo: Verificar se o usuário é superusuário, semelhante ao cadastro de usuários
    const usuarioCriador = await buscarUsuarioPorId(uuidUser);
    if (!usuarioCriador || !usuarioCriador.superusuario) {
      await registrarLog({
        uuidUser,
        funcionalidade: "Cadastro de Unidade",
        status: "error",
        mensagem: "Tentativa de cadastro de unidade sem permissão",
        detalhes: { nomeTentativa: nome, enderecoTentativa: endereco, telefoneTentativa: telefone }
      });

      return res.status(403).json({ error: "Apenas superusuários podem cadastrar unidades." });
    }

    // Cria a unidade
    const id = await criar({
      nome,
      endereco,
      telefone,
      ativo: typeof req.body.ativo === 'boolean' ? req.body.ativo : true,
      uuidCriador: uuidUser
    });

    // Log de sucesso
    await registrarLog({
      uuidUser,
      funcionalidade: "Cadastro de Unidade",
      status: "success",
      mensagem: "Unidade cadastrada com sucesso",
      detalhes: { unidadeId: id, nomeUnidade: nome }
    });

    return res.status(201).json({
      id,
      message: 'Unidade criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar unidade:', error);

    // Tenta registrar o log de erro
    try {
      const uuidUser = req.user?.uid;
      await registrarLog({
        uuidUser,
        funcionalidade: "Cadastro de Unidade",
        status: "error",
        mensagem: "Erro ao cadastrar unidade",
        detalhes: { error: error.message }
      });
    } catch (logError) {
      console.error("Erro ao registrar log de erro no cadastro de unidade:", logError);
    }

    return res.status(500).json({
      error: 'Erro interno ao criar unidade'
    });
  }
};

// Listar unidades (opcional adicionar log, se quiser)
export const listarUnidades = async (req, res) => {
  try {
    const unidades = await buscarTodas();
    // Exemplo de log de listagem
    await registrarLog({
      uuidUser: req.user?.uid,
      funcionalidade: "Listagem de Unidades",
      status: "success",
      mensagem: "Usuário listou todas as unidades",
      detalhes: {
        quantidadeUnidades: unidades.length
      }
    });
    res.json(unidades);
  } catch (error) {
    console.error('Erro ao listar unidades:', error);
    try {
      await registrarLog({
        uuidUser: req.user?.uid,
        funcionalidade: "Listagem de Unidades",
        status: "error",
        mensagem: "Erro ao listar unidades",
        detalhes: { error: error.message }
      });
    } catch (logError) {
      console.error("Erro ao registrar log de erro na listagem de unidades:", logError);
    }
    res.status(500).json({
      error: 'Erro interno ao listar unidades'
    });
  }
};

// Buscar unidade por ID (exemplo de log)
export const buscarUnidade = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'ID da unidade é obrigatório' });
    }
    const unidade = await buscarUnidadePorId(id);
    if (!unidade) {
      return res.status(404).json({ error: 'Unidade não encontrada' });
    }

    // Log de sucesso
    await registrarLog({
      uuidUser: req.user?.uid,
      funcionalidade: "Busca de Unidade",
      status: "success",
      mensagem: "Usuário buscou uma unidade",
      detalhes: { unidadeId: id }
    });

    res.json(unidade);
  } catch (error) {
    console.error('Erro ao buscar unidade:', error);

    // Log de erro
    try {
      await registrarLog({
        uuidUser: req.user?.uid,
        funcionalidade: "Busca de Unidade",
        status: "error",
        mensagem: "Erro ao buscar unidade",
        detalhes: { error: error.message }
      });
    } catch (logError) {
      console.error("Erro ao registrar log de erro na busca de unidade:", logError);
    }

    res.status(500).json({
      error: 'Erro interno ao buscar unidade'
    });
  }
};

export const atualizarUnidade = async (req, res) => {
  try {
    const { id } = req.params;              // ID da unidade (ex: "003")
    const dadosAtualizacao = req.body;       // Corpo da requisição com os campos a atualizar
    const uuidEditor = req.user.uid;         // ID de quem está fazendo a requisição (usuário logado)

    // Verifica se a unidade existe
    const unidadeExistente = await buscarUnidadePorId(id);
    if (!unidadeExistente) {
      return res.status(404).json({ error: "Unidade não encontrada." });
    }

    // Verifica se o usuário que está editando é superusuário
    const usuarioEditor = await buscarUsuarioPorId(uuidEditor);
    if (!usuarioEditor || !usuarioEditor.superusuario) {
      await registrarLog({
        uuidUser: uuidEditor,
        funcionalidade: "Atualização de Unidade",
        status: "error",
        mensagem: "Tentativa de atualização sem permissão",
        detalhes: { unidadeAlvo: id }
      });
      return res.status(403).json({ error: "Apenas superusuários podem atualizar unidades." });
    }

    // Atualiza a unidade
    const unidadeAtualizada = await atualizar(id, dadosAtualizacao);
    if (!unidadeAtualizada) {
      return res.status(404).json({ error: "Unidade não encontrada." });
    }

    // Registra log de sucesso
    await registrarLog({
      uuidUser: uuidEditor,
      funcionalidade: "Atualização de Unidade",
      status: "success",
      mensagem: "Unidade atualizada com sucesso",
      detalhes: { unidadeAlvo: id }
    });

    // Retorna a unidade atualizada
    return res.json({
      message: "Unidade atualizada com sucesso!",
      unidade: unidadeAtualizada
    });
  } catch (error) {
    console.error("Erro ao atualizar unidade:", error);

    // Tenta registrar log de erro
    try {
      await registrarLog({
        uuidUser: req.user?.uid,
        funcionalidade: "Atualização de Unidade",
        status: "error",
        mensagem: "Erro ao atualizar unidade",
        detalhes: { error: error.message }
      });
    } catch (logError) {
      console.error("Erro ao registrar log de erro na atualização de unidade:", logError);
    }

    return res.status(500).json({
      error: "Erro interno ao atualizar unidade."
    });
  }
}

export const deletarUnidade = async (req, res) => {
  try {
    const { id } = req.params;      // ID da unidade
    const uuidEditor = req.user.uid; // Usuário logado

    // Verifica se o usuário logado é superusuário
    const usuarioEditor = await buscarUsuarioPorId(uuidEditor);
    if (!usuarioEditor || !usuarioEditor.superusuario) {
      await registrarLog({
        uuidUser: uuidEditor,
        funcionalidade: "Exclusão de Unidade",
        status: "error",
        mensagem: "Tentativa de exclusão sem permissão",
        detalhes: { unidadeAlvo: id }
      });
      return res.status(403).json({ error: "Apenas superusuários podem deletar unidades." });
    }

    // Chama o model para fazer o soft delete
    const resultado = await deletar(id);
    if (!resultado) {
      return res.status(404).json({ error: "Unidade não encontrada." });
    }

    // Registra log de sucesso
    await registrarLog({
      uuidUser: uuidEditor,
      funcionalidade: "Exclusão de Unidade",
      status: "success",
      mensagem: "Unidade deletada com sucesso",
      detalhes: { unidadeAlvo: id }
    });

    return res.json({ message: "Unidade deletada com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar unidade:", error);

    // Tenta registrar log de erro
    try {
      await registrarLog({
        uuidUser: req.user?.uid,
        funcionalidade: "Exclusão de Unidade",
        status: "error",
        mensagem: "Erro ao deletar unidade",
        detalhes: { error: error.message }
      });
    } catch (logError) {
      console.error("Erro ao registrar log de erro na exclusão de unidade:", logError);
    }

    return res.status(500).json({
      error: "Erro interno ao deletar unidade."
    });
  }
};