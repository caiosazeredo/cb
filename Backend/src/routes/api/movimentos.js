import express from 'express';
import { criarMovimento, listarMovimentos, deletarMovimento, criarMovimentosEmLoteBatch } from '../../controllers/movimentoController.js';
import { authenticateToken } from "../../middlewares/authenticate-jwt.js";

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas/{caixaId}/movimentos:
 *   post:
 *     summary: Criar um novo movimento
 *     tags: [Movimentos]
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
 *               - tipo
 *               - forma
 *               - valor
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [entrada, saida]
 *               forma:
 *                 type: string
 *                 enum: [dinheiro, credito, debito, pix, ticket]
 *               valor:
 *                 type: number
 *               descricao:
 *                 type: string
 *               nomeCliente:
 *                 type: string
 *               numeroDocumento:
 *                 type: string
 *     responses:
 *       201:
 *         description: Movimento criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.post('/', authenticateToken, criarMovimento);

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas/{caixaId}/movimentos:
 *   get:
 *     summary: Listar movimentos de um caixa
 *     tags: [Movimentos]
 *     security:
 *       - BearerAuth: []
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
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *         description: Data para filtrar movimentos (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de movimentos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.get('/', authenticateToken, listarMovimentos);

/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas/{caixaId}/movimentos/{movimentoId}:
 *   delete:
 *     summary: Deletar um movimento
 *     tags: [Movimentos]
 *     security:
 *       - BearerAuth: []
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
 *       - in: path
 *         name: movimentoId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movimento deletado com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Movimento não encontrado
 *       500:
 *         description: Erro interno
 */
router.delete('/:movimentoId', authenticateToken, deletarMovimento);


/**
 * @swagger
 * /api/unidades/{unidadeId}/caixas/{caixaId}/movimentos/lote:
 *   post:
 *     summary: Criar múltiplos movimentos (registro em lote)
 *     description: Este endpoint permite criar diversas movimentações de uma só vez, passando um array de objetos com as informações de cada movimento.
 *     tags: [Movimentos]
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
 *               - movimentos
 *             properties:
 *               movimentos:
 *                 type: array
 *                 description: Lista de objetos representando cada movimentação.
 *                 items:
 *                   type: object
 *                   required:
 *                     - tipo
 *                     - forma
 *                     - valor
 *                   properties:
 *                     tipo:
 *                       type: string
 *                       enum: [entrada, saida]
 *                       description: Tipo de movimentação
 *                     forma:
 *                       type: string
 *                       enum: [dinheiro, credito, debito, pix, ticket]
 *                       description: Forma de pagamento
 *                     valor:
 *                       type: number
 *                       description: Valor da movimentação
 *                     descricao:
 *                       type: string
 *                       description: Descrição adicional do movimento
 *                     nomeCliente:
 *                       type: string
 *                       description: Nome do cliente (caso seja necessário)
 *                     numeroDocumento:
 *                       type: string
 *                       description: Número do documento ou comprovante
 *                     paymentStatus:
 *                       type: string
 *                       enum: [realizado, pendente]
 *                       description: Status do pagamento (obrigatório somente se tipo = entrada)
 *     responses:
 *       201:
 *         description: Todas as movimentações foram criadas com sucesso
 *       207:
 *         description: Alguns ou todos os movimentos falharam; o corpo retornará detalhes
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.post('/lote', authenticateToken, criarMovimentosEmLoteBatch);

export default router;