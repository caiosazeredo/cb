// src/routes/api/paymentMethods.js
import express from 'express';
import { 
  listarMetodosPagamento, 
  criarMetodoPagamento, 
  atualizarMetodoPagamento, 
  excluirMetodoPagamento 
} from '../../controllers/paymentMethodController.js';
import { authenticateToken } from "../../middlewares/authenticate-jwt.js";

const router = express.Router();

/**
 * @swagger
 * /api/paymentMethods:
 *   get:
 *     summary: Listar todos os métodos de pagamento
 *     tags: [Métodos de Pagamento]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de métodos de pagamento
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.get('/', authenticateToken, listarMetodosPagamento);

/**
 * @swagger
 * /api/paymentMethods:
 *   post:
 *     summary: Criar um novo método de pagamento
 *     tags: [Métodos de Pagamento]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do método de pagamento
 *               type:
 *                 type: string
 *                 enum: [entrada]
 *                 default: entrada
 *                 description: Tipo do método (sempre será 'entrada')
 *               category:
 *                 type: string
 *                 enum: [debito, credito, pix, ticket, dinheiro]
 *                 description: Categoria do método de pagamento
 *     responses:
 *       201:
 *         description: Método de pagamento criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.post('/', authenticateToken, criarMetodoPagamento);

/**
 * @swagger
 * /api/paymentMethods/{id}:
 *   put:
 *     summary: Atualizar um método de pagamento
 *     tags: [Métodos de Pagamento]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do método de pagamento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome do método de pagamento
 *               type:
 *                 type: string
 *                 enum: [entrada]
 *                 default: entrada
 *                 description: Tipo do método (sempre será 'entrada')
 *               category:
 *                 type: string
 *                 enum: [debito, credito, pix, ticket, dinheiro]
 *                 description: Categoria do método de pagamento
 *     responses:
 *       200:
 *         description: Método de pagamento atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Método não encontrado
 *       500:
 *         description: Erro interno
 */
router.put('/:id', authenticateToken, atualizarMetodoPagamento);

/**
 * @swagger
 * /api/paymentMethods/{id}:
 *   delete:
 *     summary: Excluir um método de pagamento
 *     tags: [Métodos de Pagamento]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do método de pagamento
 *     responses:
 *       200:
 *         description: Método de pagamento excluído com sucesso
 *       400:
 *         description: Não é possível excluir um método de pagamento em uso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Método não encontrado
 *       500:
 *         description: Erro interno
 */
router.delete('/:id', authenticateToken, excluirMetodoPagamento);

export default router;