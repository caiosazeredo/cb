// src/routes/api/unidades.js (atualizado)
import express from 'express';
import { criarUnidade, listarUnidades, buscarUnidade, atualizarUnidade, deletarUnidade } from '../../controllers/unidadeController.js';

const router = express.Router();

/**
 * @swagger
 * /api/unidades:
 *   post:
 *     summary: Criar uma nova unidade
 *     tags: [Unidades]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - endereco
 *               - telefone
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome da unidade
 *               endereco:
 *                 type: string
 *                 description: Endereço da unidade
 *               telefone:
 *                 type: string
 *                 description: Telefone da unidade
 *     responses:
 *       201:
 *         description: Unidade criada com sucesso
 */
router.post('/', criarUnidade);

/**
 * @swagger
 * /api/unidades:
 *   get:
 *     summary: Listar todas as unidades
 *     tags: [Unidades]
 *     responses:
 *       200:
 *         description: Lista de unidades
 */
router.get('/', listarUnidades);

/**
 * @swagger
 * /api/unidades/{id}:
 *   get:
 *     summary: Buscar unidade por ID
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da unidade
 *     responses:
 *       200:
 *         description: Dados da unidade
 *       404:
 *         description: Unidade não encontrada
 */
router.get('/:id', buscarUnidade);

/**
 * @swagger
 * /api/unidades/{id}:
 *   put:
 *     summary: Atualizar unidade
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da unidade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome da unidade
 *               endereco:
 *                 type: string
 *                 description: Endereço da unidade
 *               telefone:
 *                 type: string
 *                 description: Telefone da unidade
 *               ativo:
 *                 type: boolean
 *                 description: Status ativo/inativo da unidade
 *     responses:
 *       200:
 *         description: Unidade atualizada com sucesso
 *       403:
 *         description: Permissão negada para atualizar esta unidade.
 *       404:
 *         description: Unidade não encontrada.
 *       500:
 *         description: Erro interno ao atualizar unidade.
 */
router.put('/:id', atualizarUnidade);

/**
 * @swagger
 * /api/unidades/{id}:
 *   delete:
 *     summary: Excluir (soft delete) uma unidade
 *     tags: [Unidades]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da unidade
 *     responses:
 *       200:
 *         description: Unidade excluída com sucesso
 *       403:
 *         description: Apenas superusuários podem deletar unidades.
 *       404:
 *         description: Unidade não encontrada
 *       500:
 *         description: Erro interno ao deletar unidade
 */
router.delete('/:id', deletarUnidade);

export default router;