// server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve os arquivos estáticos da pasta dist (gerada pelo build)
app.use(express.static(path.join(__dirname, 'dist')));

// Encaminha todas as requisições para index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Tenta iniciar o servidor na porta especificada, 
// e caso não consiga, tenta na próxima porta
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`===============================`);
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse: http://localhost:${port}`);
    console.log(`===============================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`A porta ${port} já está em uso, tentando porta ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Erro ao iniciar o servidor:', err);
    }
  });
};

// Inicia o servidor
startServer(PORT);