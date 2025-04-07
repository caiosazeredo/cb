# Casa do Biscoito - Backend

Backend do sistema de gerenciamento da Casa do Biscoito, desenvolvido com Node.js, Express e Firebase.

## 🚀 Configuração do Ambiente

### Pré-requisitos
- Node.js v22.13.0 ou superior
- NPM (Node Package Manager)
- Conta no Firebase com um projeto criado

### Instalação
1. Clone o repositório:
cd casaDoBiscoitoBackend
```

2. Instale as dependências:

npm install
```

3. Configure as credenciais do Firebase:
- Acesse o [Console do Firebase](https://console.firebase.google.com)
- Crie um novo projeto (ou use um existente)
- Vá em Configurações do Projeto > Geral
- Copie as credenciais do Firebase
- Cole no arquivo `src/config/firebase.js`

### Executando o Projeto

npm run start
```
O servidor estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── config/
│   ├── firebase.js     # Configuração do Firebase
│   └── swagger.js      # Configuração do Swagger
├── controllers/
│   ├── unidadeController.js
│   ├── caixaController.js
│   └── pagamentoController.js
├── models/firestore/
│   ├── unidade.js
│   ├── caixa.js
│   └── pagamento.js
├── routes/api/
│   ├── unidades.js
│   ├── caixas.js
│   └── pagamentos.js
├── app.js
└── server.js
```

## 📝 Documentação da API

A documentação completa da API está disponível via Swagger UI em:
```
http://localhost:3000/api-docs
```

### Endpoints Principais

#### Unidades
- `POST /api/unidades` - Criar uma nova unidade
- `GET /api/unidades` - Listar todas as unidades

#### Caixas
- `POST /api/unidades/{unidadeId}/caixas` - Criar um novo caixa
- `GET /api/unidades/{unidadeId}/caixas` - Listar caixas de uma unidade
- `PUT /api/unidades/{unidadeId}/caixas/{caixaId}` - Atualizar caixa
- `DELETE /api/unidades/{unidadeId}/caixas/{caixaId}` - Deletar caixa

🗄️ Estrutura do Banco de Dados (Firestore)
Copyunidades/
├── 001/
│   ├── id
│   ├── nome
│   ├── endereco
│   ├── telefone
│   ├── dataCriacao
│   ├── ativo
│   └── caixas/
│       ├── 001/
│       │   ├── id
│       │   ├── numero
│       │   ├── status
│       │   ├── dataCriacao
│       │   ├── formasPagamento
│       │   ├── ativo
│       │   ├── ultimaAbertura
│       │   └── ultimoFechamento
│       └── 002/
│           └── ...
└── 002/
    └── ...
Características da Estrutura

Unidades são documentos de primeiro nível na coleção 'unidades'
Cada unidade tem uma subcoleção 'caixas'
IDs são padronizados e sequenciais (001, 002, etc.)
Todas as datas são armazenadas como timestamps
Documentos possuem flag 'ativo' para soft delete

Formas de Pagamento
Estrutura padrão do objeto formasPagamento:
jsonCopy{
  "dinheiro": true,
  "credito": true,
  "debito": true,
  "pix": true,
  "ticket": true
}

## 🔍 Padrões e Convenções

### IDs
- Todos os IDs são sequenciais e padronizados (001, 002, etc)
- IDs são strings com padding de zeros à esquerda
- O próximo ID é calculado automaticamente ao criar registros

### Soft Delete
- Registros nunca são deletados fisicamente
- Deleção é feita através do campo `ativo: false`
- Listagens filtram automaticamente por `ativo: true`

### Formas de Pagamento
Padrão para novos caixas:
```json
{
  "formasPagamento": {
    "dinheiro": true,
    "credito": true,
    "debito": true,
    "pix": true,
    "ticket": true
  }
}
```

## 🔄 Workflows Comuns

### Criando uma Nova Unidade
1. Faça uma requisição POST para `/api/unidades`
2. O sistema gera um ID sequencial
3. A unidade é criada com status ativo

### Gerenciando Caixas
1. Crie um caixa com POST em `/api/unidades/{unidadeId}/caixas`
2. O caixa é criado com número sequencial e formas de pagamento padrão
3. Atualize as formas de pagamento conforme necessário

## ⚠️ Pontos de Atenção
1. Sempre use try/catch ao interagir com o Firestore
2. Valide os IDs antes de fazer operações
3. Mantenha a documentação Swagger atualizada
4. Siga o padrão de soft delete

## 🐞 Debugging
1. Os logs de erro incluem detalhes completos
2. Use o Console do Firebase para verificar dados
3. Swagger UI ajuda a testar endpoints

## 📚 Recursos Adicionais
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Documentação do Express](https://expressjs.com/)
- [Documentação do Swagger](https://swagger.io/docs/)