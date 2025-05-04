const { db } = require('../../config/firebase');

const PagamentoModel = {
  registrar: async (unidadeId, caixaId, dadosPagamento) => {
    try {
      const pagamentoBase = {
        ...dadosPagamento,
        data: admin.firestore.FieldValue.serverTimestamp()
      };

      // Se for crédito ou pix, vai para valores a receber
      if (dadosPagamento.tipo === 'credito' || dadosPagamento.tipo === 'pix') {
        const docRef = await db.collection('casaDoBiscoito')
                              .doc('unidades')
                              .collection('lista')
                              .doc(unidadeId)
                              .collection('valoresAReceber')
                              .add(pagamentoBase);
        return docRef.id;
      } else {
        // Se for dinheiro ou ticket, vai para o caixa
        const docRef = await db.collection('casaDoBiscoito')
                              .doc('unidades')
                              .collection('lista')
                              .doc(unidadeId)
                              .collection('caixas')
                              .doc(caixaId)
                              .collection('pagamentos')
                              .add(pagamentoBase);
        return docRef.id;
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      throw error;
    }
  },

  buscarPorCaixa: async (unidadeId, caixaId) => {
    try {
      const snapshot = await db.collection('casaDoBiscoito')
                              .doc('unidades')
                              .collection('lista')
                              .doc(unidadeId)
                              .collection('caixas')
                              .doc(caixaId)
                              .collection('pagamentos')
                              .get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  }
};

module.exports = PagamentoModel;