const PagamentoModel = require('../../models/firestore/pagamento');

const PagamentoController = {
  registrarPagamento: async (req, res) => {
    try {
      const { unidadeId, caixaId } = req.params;
      const dadosPagamento = req.body;
      const id = await PagamentoModel.registrar(unidadeId, caixaId, dadosPagamento);
      res.status(201).json({ id, message: 'Pagamento registrado com sucesso' });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      res.status(500).json({ error: 'Erro ao registrar pagamento' });
    }
  },

  listarPagamentos: async (req, res) => {
    try {
      const { unidadeId, caixaId } = req.params;
      const { dataInicio, dataFim, tipo } = req.query;
      const pagamentos = await PagamentoModel.buscarTodos(unidadeId, caixaId, {
        dataInicio,
        dataFim,
        tipo
      });
      res.json(pagamentos);
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      res.status(500).json({ error: 'Erro ao listar pagamentos' });
    }
  },

  buscarPagamento: async (req, res) => {
    try {
      const { unidadeId, caixaId, pagamentoId } = req.params;
      const pagamento = await PagamentoModel.buscarPorId(unidadeId, caixaId, pagamentoId);
      if (!pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
      }
      res.json(pagamento);
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      res.status(500).json({ error: 'Erro ao buscar pagamento' });
    }
  },

  listarValoresAReceber: async (req, res) => {
    try {
      const { unidadeId } = req.params;
      const { status, dataInicio, dataFim } = req.query;
      const valores = await PagamentoModel.buscarValoresAReceber(unidadeId, {
        status,
        dataInicio,
        dataFim
      });
      res.json(valores);
    } catch (error) {
      console.error('Erro ao listar valores a receber:', error);
      res.status(500).json({ error: 'Erro ao listar valores a receber' });
    }
  },

  registrarRecebimento: async (req, res) => {
    try {
      const { unidadeId, pagamentoId } = req.params;
      const dadosRecebimento = req.body;
      await PagamentoModel.registrarRecebimento(unidadeId, pagamentoId, dadosRecebimento);
      res.json({ message: 'Recebimento registrado com sucesso' });
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      res.status(500).json({ error: 'Erro ao registrar recebimento' });
    }
  },

  gerarRelatorio: async (req, res) => {
    try {
      const { unidadeId } = req.params;
      const { dataInicio, dataFim, tipoRelatorio } = req.query;
      const relatorio = await PagamentoModel.gerarRelatorio(unidadeId, {
        dataInicio,
        dataFim,
        tipoRelatorio
      });
      res.json(relatorio);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  },

  registrarTicket: async (req, res) => {
    try {
      const { unidadeId, caixaId } = req.params;
      const dadosTicket = req.body;
      const id = await PagamentoModel.registrarTicket(unidadeId, caixaId, dadosTicket);
      res.status(201).json({ id, message: 'Ticket registrado com sucesso' });
    } catch (error) {
      console.error('Erro ao registrar ticket:', error);
      res.status(500).json({ error: 'Erro ao registrar ticket' });
    }
  }
};

module.exports = PagamentoController;