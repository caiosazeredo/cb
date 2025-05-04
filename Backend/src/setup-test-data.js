// src/setup-test-data.js
// Script para criar dados de teste necessários para a API

import { db } from './database/connectioDBAdimin.js';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import path from 'path';

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para dormir por X milissegundos
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const setupTestData = async () => {
  console.log('🔧 Iniciando criação de dados de teste...');

  try {
    // 1. Verifica/Cria unidade com ID 001
    console.log('\n📌 Verificando unidade 001...');
    const unidadeRef = db.collection('unidades').doc('001');
    const unidadeDoc = await unidadeRef.get();

    if (!unidadeDoc.exists) {
      console.log('➕ Criando unidade 001...');
      await unidadeRef.set({
        id: '001',
        nome: 'Unidade Teste',
        endereco: 'Endereço de Teste, 123',
        telefone: '(21) 99999-9999',
        dataCriacao: new Date(),
        ativo: true
      });
      console.log('✅ Unidade 001 criada com sucesso!');
    } else {
      console.log('✅ Unidade 001 já existe!');
    }

    // 2. Verifica/Cria caixa 001 na unidade 001
    console.log('\n📌 Verificando caixa 001 na unidade 001...');
    const caixaRef = db.collection('unidades').doc('001').collection('caixas').doc('001');
    const caixaDoc = await caixaRef.get();

    if (!caixaDoc.exists) {
      console.log('➕ Criando caixa 001...');
      await caixaRef.set({
        id: '001',
        numero: 1,
        status: 'fechado',
        dataCriacao: new Date(),
        ultimaAbertura: null,
        ultimoFechamento: null,
        formasPagamento: {
          dinheiro: true,
          credito: true,
          debito: true,
          pix: true,
          ticket: true
        },
        ativo: true
      });
      console.log('✅ Caixa 001 criado com sucesso!');
    } else {
      console.log('✅ Caixa 001 já existe!');
    }

    // 3. Verifica/Cria usuário de teste
    const testUserId = 'jwx5473wunaycoDgilsghRohOkz2';
    console.log(`\n📌 Verificando usuário com ID ${testUserId}...`);
    
    // Verificar primeiro se existe no Auth
    try {
      await admin.auth().getUser(testUserId);
      console.log('✅ Usuário já existe no Firebase Auth!');
    } catch (error) {
      // Se for erro de usuário não encontrado, criamos
      if (error.code === 'auth/user-not-found') {
        console.log('➕ Criando usuário no Firebase Auth...');
        try {
          await admin.auth().createUser({
            uid: testUserId,
            email: 'teste@example.com',
            password: 'senha@123',
            displayName: 'Usuário de Teste'
          });
          console.log('✅ Usuário criado no Firebase Auth!');
        } catch (authError) {
          // Se não conseguir criar no Auth, vamos apenas continuar
          console.log('⚠️ Não foi possível criar usuário no Auth:', authError.message);
          console.log('⚠️ Continuando com a criação apenas no Firestore...');
        }
      } else {
        console.log('⚠️ Erro ao verificar usuário no Auth:', error.message);
      }
    }
    
    // Verificar/Criar no Firestore
    const userRef = db.collection('Users').doc(testUserId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('➕ Criando usuário no Firestore...');
      await userRef.set({
        name: 'Usuário de Teste',
        email: 'teste@example.com',
        cpf: '123.456.789-00',
        phone: '(21) 99999-9999',
        role: 'Usuário de Teste',
        superusuario: false,
        selectedUnits: ['001'],
        createdAt: new Date().toISOString(),
        ativo: true
      });
      console.log('✅ Usuário criado no Firestore!');
    } else {
      console.log('✅ Usuário já existe no Firestore!');
      
      // Garantir que o usuário está ativo
      if (userDoc.data().ativo === false) {
        console.log('🔄 Reativando usuário...');
        await userRef.update({ ativo: true });
      }
    }

    // 4. Verificar/Criar superusuário para testes
    const superUserId = 'superuser123';
    console.log(`\n📌 Verificando superusuário com ID ${superUserId}...`);
    
    const superUserRef = db.collection('Users').doc(superUserId);
    const superUserDoc = await superUserRef.get();
    
    if (!superUserDoc.exists) {
      console.log('➕ Criando superusuário...');
      await superUserRef.set({
        name: 'Super Usuário',
        email: 'super@example.com',
        cpf: '987.654.321-00',
        phone: '(21) 88888-8888',
        role: 'Administrador',
        superusuario: true,
        selectedUnits: [],
        createdAt: new Date().toISOString(),
        ativo: true
      });
      console.log('✅ Superusuário criado!');
    } else {
      console.log('✅ Superusuário já existe!');
      
      // Garantir que é superusuário
      if (!superUserDoc.data().superusuario) {
        console.log('🔄 Atualizando para superusuário...');
        await superUserRef.update({ superusuario: true });
      }
    }

    console.log('\n🎉 Dados de teste criados com sucesso!');
    
    // Dicas para o teste
    console.log('\n📋 INFORMAÇÕES PARA TESTE:');
    console.log('1. ID da unidade de teste: 001');
    console.log('2. ID do caixa de teste: 001');
    console.log(`3. ID do usuário de teste: ${testUserId}`);
    console.log(`4. ID do superusuário de teste: ${superUserId}`);
    console.log('\nUse estas informações no seu script de teste da API.');
    
    return true;
  } catch (error) {
    console.error('❌ Erro durante a criação de dados de teste:', error);
    return false;
  }
};

// Executar a configuração
setupTestData()
  .then(() => {
    console.log('Script finalizado!');
    // Necessário para encerrar o script
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });