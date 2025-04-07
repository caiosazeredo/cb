// src/server.js
import app from './app.js';

const PORT = process.env.PORT || 3000;

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Promise rejeitada não tratada:', error);
  process.exit(1);
});

try {
  app.listen(PORT, () => {
    console.log('===============================');
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Swagger: http://localhost:${PORT}/api-docs`);
    console.log(`Teste: http://localhost:${PORT}/teste`);
    console.log('===============================');
  });
} catch (error) {
  console.error('Erro ao iniciar o servidor:', error);
  process.exit(1);
}