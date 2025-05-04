import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import router from './routes.js';

const app = express();

// Habilita o CORS para todas as rotas
app.use(cors());

// Middleware para processar JSON
app.use(express.json());

// Rota de teste
app.get('/teste', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Rotas da API
app.use('/api', router);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;