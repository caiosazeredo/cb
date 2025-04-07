import express from 'express';
import { criarLog, listarLogsUsuario } from '../../controllers/logController.js';
import { authenticateToken } from "../../middlewares/authenticate-jwt.js";

const router = express.Router();

/**
 * @swagger
 * /api/logs:
 *   post:
 *     summary: Criar um novo log de ação
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuidUser
 *               - funcionalidade
 *               - status
 *               - mensagem
 *             properties:
 *               uuidUser:
 *                 type: string
 *               funcionalidade:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [success, error]
 *               mensagem:
 *                 type: string
 *               detalhes:
 *                 type: object
 *     responses:
 *       201:
 *         description: Log registrado com sucesso
 */
router.post('/', authenticateToken, criarLog);

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Listar logs do usuário logado
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Lista de logs do usuário autenticado
 */
router.get('/', authenticateToken, listarLogsUsuario);

export default router;
