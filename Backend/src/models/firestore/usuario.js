import { db, authAdmin } from '../../database/connectioDBAdimin.js';


function gerarSenhaProvisoria(tamanho = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
  let senha = '';
  for (let i = 0; i < tamanho; i++) {
    senha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return senha;
}

// Cadastrar usuário
export const cadastrar = async (dadosUsuario) => {
  const {
    uuidCriador,
    name,
    email,
    cpf,
    phone,
    role,
    isSuperUser,
    selectedUnits
  } = dadosUsuario;

  try {
    const senhaProvisoria = gerarSenhaProvisoria(6); // Ex: 10 caracteres

    // 1. Criar usuário no Firebase Auth
    const userRecord = await authAdmin.createUser({
      email,
      password: senhaProvisoria,     
      displayName: name 
    });

    // 2. Salvar dados adicionais no Firestore
    const usuarioFirestore = {
      uuidCriador,
      name,
      email,
      cpf: cpf || '',
      phone: phone || '',
      role: role || '',
      superusuario: !!isSuperUser,
      selectedUnits: selectedUnits || [],
      createdAt: new Date().toISOString(),
      ativo: true
    };

    await db.collection('Users').doc(userRecord.uid).set(usuarioFirestore);

    // 3. Retornar dados para quem chamou
    return {
      id: userRecord.uid,
      ...usuarioFirestore,
      senhaProvisoria
    };
  } catch (error) {
    console.error("Erro em cadastrar usuário:", error);
    throw error;
  }
};

// Buscar usuário por ID
export const buscarPorId = async (id) => {
  try {
    const userDoc = await db.collection('Users').doc(id).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const userData = userDoc.data();
    
    // Se usuário estiver inativo, tratar como não encontrado
    // Acho que sempre tem que pegar as informaçõpes do usuário 
    // até mesmo se não estiver ativo e em outro lugar tratar a questão de ativo e não ativo
    //if (userData.ativo === false) {
    //  return null;
    //}
    
    return {
      id: userDoc.id,
      ...userData
    };
  } catch (error) {
    console.error("Erro em buscarPorId:", error);
    throw error;
  }
};

// Atualizar usuário
export const atualizar = async (id, dadosAtualizacao) => {
  try {
    // Campos não permitidos para atualização
    const camposRestritos = ['id', 'createdAt', 'email', 'uuidCriador'];
    
    // Filtrar apenas campos permitidos
    const dadosFiltrados = Object.entries(dadosAtualizacao)
      .filter(([key]) => !camposRestritos.includes(key))
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
    // Adicionar timestamp de atualização
    dadosFiltrados.updatedAt = new Date().toISOString();
    
    // Atualizar no Firestore
    await db.collection('Users').doc(id).update(dadosFiltrados);
    
    // Buscar documento atualizado
    const userDoc = await db.collection('Users').doc(id).get();
    return {
      id: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    console.error("Erro em atualizar:", error);
    throw error;
  }
};

// Listar usuários
export const listar = async (incluirInativos = false) => {
  try {
    let query = db.collection('Users');
    
    // Filtrar usuários ativos, se não for para incluir inativos
    /* if (!incluirInativos) {
      query = query.where('ativo', '==', true);
    } */
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Erro em listar:", error);
    throw error;
  }
};

// Deletar usuário (soft delete)
export const deletar = async (id) => {
  try {
    // Verificar se o usuário existe
    const userDoc = await db.collection('Users').doc(id).get();
    if (!userDoc.exists) {
      return false;
    }

    await authAdmin.updateUser(id, { disabled: true });
    
    // Realizar soft delete
    await db.collection('Users').doc(id).update({
      ativo: false,
      deletedAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Erro em deletar:", error);
    throw error;
  }
};

// Verificar se é superusuário
export const verificarSuperUsuario = async (uid) => {
  try {
    const userDoc = await db.collection('Users').doc(uid).get();
    
    if (!userDoc.exists) {
      return false;
    }
    
    const userData = userDoc.data();
    return userData.superusuario === true;
  } catch (error) {
    console.error("Erro em verificarSuperUsuario:", error);
    return false;
  }
};

// Buscar acessos do usuário
export const buscarAcessos = async (id) => {
  try {
    // Buscar usuário
    const userDoc = await db.collection('Users').doc(id).get();
    
    if (!userDoc.exists) {
      return [];
    }
    
    const userData = userDoc.data();
    
    // Se for superusuário, tem acesso a todas as unidades
    if (userData.superusuario) {
      const unidadesSnapshot = await db.collection('unidades')
        .where('ativo', '==', true)
        .get();
      
      return unidadesSnapshot.docs.map(doc => ({
        unidadeId: doc.id,
        nome: doc.data().nome,
        fullAccess: true
      }));
    }
    
    // Se não for superusuário, buscar unidades específicas
    const unidadesIds = userData.selectedUnits || [];
    
    if (unidadesIds.length === 0) {
      return [];
    }
    
    // Buscar detalhes das unidades
    const acessos = [];
    
    for (const unidadeId of unidadesIds) {
      const unidadeDoc = await db.collection('unidades').doc(unidadeId).get();
      
      if (unidadeDoc.exists && unidadeDoc.data().ativo) {
        acessos.push({
          unidadeId: unidadeDoc.id,
          nome: unidadeDoc.data().nome,
          fullAccess: false
        });
      }
    }
    
    return acessos;
  } catch (error) {
    console.error("Erro em buscarAcessos:", error);
    throw error;
  }
};