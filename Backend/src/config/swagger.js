// src/config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Casa do Biscoito API',
      version: '1.0.0',
      description: 'API de gerenciamento da Casa do Biscoito',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/api/*.js'], // arquivos contendo anotações
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;