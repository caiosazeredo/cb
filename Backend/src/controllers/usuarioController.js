import {
  cadastrar,
  listar,
  deletar,
  buscarPorId,
  atualizar,
  buscarAcessos
} from '../models/firestore/usuario.js';
import { registrarLog } from '../models/firestore/log.js';
import { authAdmin, db } from '../database/connectioDBAdimin.js';

export const cadastrarUsuario = async (req, res) => {
  try {
    const {
      uuidCriador,
      name,
      email,
      cpf,
      phone,
      role,
      isSuperUser,
      selectedUnits
    } = req.body;

    // Validação dos campos obrigatórios
    if (!name || !email || !uuidCriador) {
      return res.status(400).json({ error: "Nome, e-mail e UUID do criador são obrigatórios." });
    }

    // Verificar permissões
    const usuarioCriador = await buscarPorId(uuidCriador);
    if (!usuarioCriador || !usuarioCriador.superusuario) {
      await registrarLog({
        uuidUser: uuidCriador,
        funcionalidade: "Cadastro de Usuário",
        status: "error",
        mensagem: "Tentativa de cadastro sem permissão",
        detalhes: { emailTentativa: email, nomeTentativa: name }
      });

      return res.status(403).json({ error: "Apenas superusuários podem cadastrar novos usuários." });
    }

    // Criar usuário
    const novoUsuario = await cadastrar({
      uuidCriador,
      name,
      email,
      cpf: cpf || '',
      phone: phone || '',
      role: role || '',
      isSuperUser: !!isSuperUser,
      selectedUnits: selectedUnits || [],
      ativo: true
    });

    // Registrar log de sucesso
    await registrarLog({
      uuidUser: uuidCriador,
      funcionalidade: "Cadastro de Usuário",
      status: "success",
      mensagem: "Usuário cadastrado com sucesso",
      detalhes: {
        novoUsuarioId: novoUsuario.id,
        nomeNovoUsuario: name,
        emailNovoUsuario: email
      }
    });

    return res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      usuario: novoUsuario,
      senhaProvisoria: novoUsuario.senhaProvisoria
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);

    // Registrar log de erro
    try {
      await registrarLog({
        uuidUser: req.body.uuidCriador,
        funcionalidade: "Cadastro de Usuário",
        status: "error",
        mensagem: "Erro ao cadastrar usuário",
        detalhes: { error: error.message }
      });
    } catch (logError) {
      console.error("Erro ao registrar log:", logError);
    }

    return res.status(500).json({
      error: "Erro interno ao cadastrar usuário."
    });
  }
};

export const buscarUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await buscarPorId(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Remover informações sensíveis antes de retornar
    const { password, ...usuarioSemSenha } = usuario;

    return res.json(usuarioSemSenha);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({
      error: "Erro interno ao buscar usuário."
    });
  }
};

export const atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    const uuidEditor = req.user.uid;

    // Buscar usuário a ser atualizado
    const usuarioExistente = await buscarPorId(id);
    if (!usuarioExistente) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Verificar permissões (apenas o próprio usuário ou um superusuário pode atualizar)
    const usuarioEditor = await buscarPorId(uuidEditor);
    if (id !== uuidEditor && (!usuarioEditor || !usuarioEditor.superusuario)) {
      await registrarLog({
        uuidUser: uuidEditor,
        funcionalidade: "Atualização de Usuário",
        status: "error",
        mensagem: "Tentativa de atualização sem permissão",
        detalhes: { usuarioAlvo: id }
      });

      return res.status(403).json({ error: "Permissão negada para atualizar este usuário." });
    }

    // Verificar se o campo 'ativo' está sendo atualizado e se houve mudança
    // Valor antigo (do Firestore) vs. valor novo (do 'req.body')
    const ativoAntigo = usuarioExistente.ativo;
    const ativoNovo = typeof dadosAtualizacao.ativo === 'boolean' ? dadosAtualizacao.ativo : ativoAntigo; // se não veio 'ativo', mantém o antigo

    // Atualizar usuário
    const usuarioAtualizado = await atualizar(id, dadosAtualizacao);

    //Se houve mudança em 'ativo', atualizar no Firebase Auth (disabled)
    if (ativoAntigo !== ativoNovo) {
      await authAdmin.updateUser(id, { disabled: !ativoNovo });
      console.log( `Usuário ${id} teve 'disabled' atualizado para: ${!ativoNovo} (ativo=${ativoNovo})`);
    }

    // Registrar log
    await registrarLog({
      uuidUser: uuidEditor,
      funcionalidade: "Atualização de Usuário",
      status: "success",
      mensagem: "Usuário atualizado com sucesso",
      detalhes: { usuarioAlvo: id }
    });

    return res.json({
      message: "Usuário atualizado com sucesso!",
      usuario: usuarioAtualizado
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return res.status(500).json({
      error: "Erro interno ao atualizar usuário."
    });
  }
};

export const buscarAcessosUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const acessos = await buscarAcessos(id);

    return res.json(acessos);
  } catch (error) {
    console.error("Erro ao buscar acessos do usuário:", error);
    return res.status(500).json({
      error: "Erro interno ao buscar acessos do usuário."
    });
  }
};

export const listarUsuarios = async (req, res) => {
  try {


    // Quem está fazendo a requisição
    const uuidUser = req.user && req.user.uid ? req.user.uid : "Não foi possível achar o id do user.";

    console.log("TEM USUÁRIO: ", uuidUser)

    // Busca todos os usuários ativos no Firestore
    const usuarios = await listar();

    // Registrar em log que este usuário listou todos os usuários
    await registrarLog({
      uuidUser,
      funcionalidade: "Listagem de Usuários",
      status: "success",
      mensagem: "Usuário listou todos os usuários",
      detalhes: {
        quantidadeUsuarios: usuarios.length
      }
    });

    // Remover possíveis campos sensíveis (ex: 'password')
    const usuariosSemSenha = usuarios.map(usuario => {
      const { password, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    });

    return res.json(usuariosSemSenha);

  } catch (error) {

    console.error('Erro ao listar usuários:', error);

    // Registrar log de erro
    try {
      await registrarLog({
        uuidUser: req.user?.uid,
        funcionalidade: "Listagem de Usuários",
        status: "error",
        mensagem: "Erro ao listar usuários",
        detalhes: {
          error: error.message
        }
      });
    } catch (logError) {
      console.error("Erro ao registrar log da listagem de usuários:", logError);
    }

    return res.status(500).json({
      error: 'Erro interno ao listar usuários.'
    });


  }
};

export const deletarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const uuidEditor = req.user.uid;

    // Verificar permissões (apenas superusuário pode deletar)
    const usuarioEditor = await buscarPorId(uuidEditor);
    if (!usuarioEditor || !usuarioEditor.superusuario) {
      await registrarLog({
        uuidUser: uuidEditor,
        funcionalidade: "Exclusão de Usuário",
        status: "error",
        mensagem: "Tentativa de exclusão sem permissão",
        detalhes: { usuarioAlvo: id }
      });

      return res.status(403).json({ error: "Apenas superusuários podem deletar usuários." });
    }

    const resultado = await deletar(id);
    if (!resultado) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Registrar log
    await registrarLog({
      uuidUser: uuidEditor,
      funcionalidade: "Exclusão de Usuário",
      status: "success",
      mensagem: "Usuário deletado com sucesso",
      detalhes: { usuarioAlvo: id }
    });

    return res.json({ message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({
      error: 'Erro interno ao deletar usuário.'
    });
  }
};