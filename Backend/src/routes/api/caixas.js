// src/routes/api/caixas.js (atualizado)
import express from 'express';
import { criarCaixa, listarCaixas, deletarCaixa, atualizarCaixa, buscarCaixa } from '../../controllers/caixaController.js';
import { authenticateToken } from "../../middlewares/authenticate-jwt.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas:
 *   post:
 *     summary: Criar um novo caixa
 *     tags: [Caixas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da unidade
 *     responses:
 *       201:
 *         description: Caixa criado com sucesso
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.post('/', authenticateToken, criarCaixa);

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas:
 *   get:
 *     summary: Listar todos os caixas de uma unidade
 *     tags: [Caixas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: unidadeId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da unidade
 *     responses:
 *       200:
 *         description: Lista de caixas
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.get('/', authenticateToken, listarCaixas);

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas/{caixaId}:
 *   get:
 *     summary: Buscar caixa por ID
 *     tags: [Caixas]
 *     security:
 *       - BearerAuth: []
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
 *     responses:
 *       200:
 *         description: Detalhes do caixa
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Caixa não encontrado
 *       500:
 *         description: Erro interno
 */
router.get('/:caixaId', authenticateToken, buscarCaixa);

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas/{caixaId}:
 *   delete:
 *     summary: Deletar um caixa
 *     tags: [Caixas]
 *     security:
 *       - BearerAuth: []
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
 *     responses:
 *       200:
 *         description: Caixa deletado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Caixa não encontrado
 *       500:
 *         description: Erro interno
 */
router.delete('/:caixaId', authenticateToken, deletarCaixa);

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas/{caixaId}:
 *   put:
 *     summary: Atualizar formas de pagamento de um caixa
 *     tags: [Caixas]
 *     security:
 *       - BearerAuth: []
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
 *               - formasPagamento
 *             properties:
 *               formasPagamento:
 *                 type: object
 *                 properties:
 *                   dinheiro:
 *                     type: boolean
 *                   credito:
 *                     type: boolean
 *                   debito:
 *                     type: boolean
 *                   pix:
 *                     type: boolean
 *                   ticket:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Caixa atualizado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Caixa não encontrado
 *       500:
 *         description: Erro interno
 */
router.put('/:caixaId', authenticateToken, atualizarCaixa);

export default router;