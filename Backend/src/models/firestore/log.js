import { db } from '../../database/connectioDBAdimin.js';


export const registrarLog = async ({ uuidUser, funcionalidade, status, mensagem, detalhes }) => {
  try {
    if (!uuidUser || !funcionalidade || !status || !mensagem) {
      throw new Error("Campos obrigatórios: uuidUser, funcionalidade, status e mensagem.");
    }

    const novoLog = {
      uuidUser, // 🔥 ID do usuário que está gerando o log
      funcionalidade,
      status,
      mensagem,
      detalhes: detalhes || null,
      timestamp: new Date().toISOString()
    };

    const docRef = await db.collection('logs').add(novoLog);

    return { success: true, id: docRef.id, ...novoLog };
  } catch (error) {
    console.error("Erro ao registrar log:", error);
    return { success: false, error: error.message };
  }
};


export const buscarLogsPorUsuario = async (uuidUser) => {
  try {
    if (!uuidUser) {
      throw new Error("UUID do usuário é obrigatório para buscar logs.");
    }

    const snapshot = await db.collection('logs')
      .where('uuidUser', '==', uuidUser)
      .orderBy('timestamp', 'desc')
      .get();

    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { success: true, logs };
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    return { success: false, error: error.message };
  }
};
