// src/routes/api/despesasCategorias.js
import express from 'express';
import { 
  listarCategorias, 
  criarCategoria, 
  atualizarCategoria, 
  excluirCategoria 
} from '../../controllers/despesaCategoriaController.js';
import { authenticateToken } from "../../middlewares/authenticate-jwt.js";

const router = express.Router();

/**
 * @swagger
 * /api/despesasCategorias:
 *   get:
 *     summary: Listar todas as categorias de despesa
 *     tags: [Categorias de Despesa]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias de despesa
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.get('/', authenticateToken, listarCategorias);

/**
 * @swagger
 * /api/despesasCategorias:
 *   post:
 *     summary: Criar uma nova categoria de despesa
 *     tags: [Categorias de Despesa]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da categoria
 *               type:
 *                 type: string
 *                 enum: [saida]
 *                 default: saida
 *                 description: Tipo da categoria (sempre será 'saida')
 *     responses:
 *       201:
 *         description: Categoria de despesa criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno
 */
router.post('/', authenticateToken, criarCategoria);

/**
 * @swagger
 * /api/despesasCategorias/{id}:
 *   put:
 *     summary: Atualizar uma categoria de despesa
 *     tags: [Categorias de Despesa]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da categoria
 *               type:
 *                 type: string
 *                 enum: [saida]
 *                 default: saida
 *                 description: Tipo da categoria (sempre será 'saida')
 *     responses:
 *       200:
 *         description: Categoria de despesa atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno
 */
router.put('/:id', authenticateToken, atualizarCategoria);

/**
 * @swagger
 * /api/despesasCategorias/{id}:
 *   delete:
 *     summary: Excluir uma categoria de despesa
 *     tags: [Categorias de Despesa]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria de despesa excluída com sucesso
 *       400:
 *         description: Não é possível excluir uma categoria em uso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro interno
 */
router.delete('/:id', authenticateToken, excluirCategoria);

export default router;