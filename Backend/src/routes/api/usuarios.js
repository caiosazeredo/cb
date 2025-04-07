import express from 'express';
import { 
  cadastrarUsuario, 
  listarUsuarios, 
  deletarUsuario, 
  buscarUsuarioPorId, 
  atualizarUsuario,
  buscarAcessosUsuario
} from '../../controllers/usuarioController.js';
import { authenticateToken } from "../../middlewares/authenticate-jwt.js";

const router = express.Router();

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Buscar usuário por ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário
 */
router.get('/:id', authenticateToken, buscarUsuarioPorId);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Cadastrar um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuidCriador
 *               - name
 *               - email
 *               - cpf
 *               - phone
 *               - role
 *               - isSuperUser
 *               - selectedUnits
 *     responses:
 *       201:
 *         description: Usuário cadastrado com sucesso
 */
router.post('/', authenticateToken, cadastrarUsuario);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/', authenticateToken, listarUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 */
router.put('/:id', authenticateToken, atualizarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}/acessos:
 *   get:
 *     summary: Buscar acessos do usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de acessos do usuário
 */
router.get('/:id/acessos', authenticateToken, buscarAcessosUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Excluir um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário excluído com sucesso
 */
router.delete('/:id', authenticateToken, deletarUsuario);

export default router;