// src/routes/api/pagamentos.js
const express = require('express');
const router = express.Router();
const PagamentoController = require('../../src/controllers/pagamentoController');

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas/{caixaId}/pagamentos:
 *   post:
 *     summary: Registrar um novo pagamento
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: unidadeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da unidade
 *       - in: path
 *         name: caixaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do caixa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - valor
 *               - funcionario
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [dinheiro, credito, pix, ticket]
 *                 description: Tipo de pagamento
 *               valor:
 *                 type: number
 *                 format: float
 *                 description: Valor do pagamento
 *               funcionario:
 *                 type: string
 *                 description: Nome do funcionário
 *               ticket:
 *                 type: boolean
 *                 description: Se é um pagamento com ticket (fiado)
 *               cliente:
 *                 type: string
 *                 description: Nome do cliente (opcional)
 *               observacao:
 *                 type: string
 *                 description: Observações sobre o pagamento
 *     responses:
 *       201:
 *         description: Pagamento registrado com sucesso
 */
router.post('/', PagamentoController.registrarPagamento);

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas/{caixaId}/pagamentos:
 *   get:
 *     summary: Listar pagamentos de um caixa
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: unidadeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: caixaId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [dinheiro, credito, pix, ticket]
 *         description: Filtrar por tipo de pagamento
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 */
router.get('/', PagamentoController.listarPagamentos);

/**
 * @swagger
 * /api/unidades/{unidadeId}/valores-a-receber:
 *   get:
 *     summary: Listar valores a receber (crédito e pix)
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: unidadeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, recebido]
 *     responses:
 *       200:
 *         description: Lista de valores a receber
 */
router.get('/valores-a-receber', PagamentoController.listarValoresAReceber);

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas/{caixaId}/tickets:
 *   post:
 *     summary: Registrar um pagamento com ticket (fiado)
 *     tags: [Pagamentos]
 *     parameters:
 *       - in: path
 *         name: unidadeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: caixaId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valor
 *               - cliente
 *               - funcionario
 *             properties:
 *               valor:
 *                 type: number
 *                 format: float
 *               cliente:
 *                 type: string
 *               funcionario:
 *                 type: string
 *               observacao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket registrado com sucesso
 */
router.post('/tickets', PagamentoController.registrarTicket);

module.exports = router;