import express from 'express';
import unidadesRoutes from './routes/api/unidades.js';
import caixasRoutes from './routes/api/caixas.js';
import movimentosRoutes from './routes/api/movimentos.js';
import usuariosRoutes from './routes/api/usuarios.js';
import logsRoutes from './routes/api/logs.js';
import despesasCategoriasRoutes from './routes/api/despesasCategorias.js';
import paymentMethodsRoutes from './routes/api/paymentMethods.js';
import { authenticateToken } from "./middlewares/authenticate-jwt.js";

const router = express.Router();

router.use('/unidades', authenticateToken, unidadesRoutes);
router.use('/unidades/:unidadeId/caixas', authenticateToken, caixasRoutes);
router.use('/unidades/:unidadeId/caixas/:caixaId/movimentos', authenticateToken, movimentosRoutes);
router.use('/usuarios', authenticateToken, usuariosRoutes);
router.use('/logs', authenticateToken, logsRoutes);
router.use('/despesasCategorias', authenticateToken, despesasCategoriasRoutes);
router.use('/paymentMethods', authenticateToken, paymentMethodsRoutes);

export default router;