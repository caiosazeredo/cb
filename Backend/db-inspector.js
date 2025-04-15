// db-inspector.js
import admin from 'firebase-admin';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';

// Configuração para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis do .env
dotenv.config();

// Inicializar Firebase Admin com as credenciais do .env
try {
  const firebaseConfig = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com"
  };

  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig)
  });
  
  console.log("✅ Firebase Admin inicializado com credenciais do .env");
} catch (error) {
  console.error("❌ Erro ao inicializar Firebase Admin:", error);
  process.exit(1);
}

const db = admin.firestore();

// Função para determinar o tipo de um valor
function getValueType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (value instanceof admin.firestore.Timestamp) return 'timestamp';
  if (value instanceof admin.firestore.GeoPoint) return 'geopoint';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return typeof value;
}

// Função simplificada para analisar a estrutura de um documento
async function analyzeDocument(docRef, path) {
  try {
    const doc = await docRef.get();
    if (!doc.exists) return null;

    const data = doc.data();
    const schema = {
      fields: {},
      subcollections: []
    };

    // Analisar campos
    Object.keys(data).forEach(key => {
      const value = data[key];
      let safeValue;

      // Converter valores especiais para formatos serializáveis
      if (value instanceof admin.firestore.Timestamp) {
        safeValue = { _type: 'timestamp', value: value.toDate().toISOString() };
      } else if (value instanceof admin.firestore.GeoPoint) {
        safeValue = { _type: 'geopoint', latitude: value.latitude, longitude: value.longitude };
      } else if (typeof value === 'object' && value !== null) {
        safeValue = '[Object]';
      } else if (Array.isArray(value)) {
        safeValue = '[Array]';
      } else {
        safeValue = value;
      }

      schema.fields[key] = {
        type: getValueType(value),
        example: safeValue
      };
    });

    // Listar subcoleções
    const collections = await docRef.listCollections();
    for (const collRef of collections) {
      schema.subcollections.push(collRef.id);
    }

    return schema;
  } catch (error) {
    console.error(`Erro ao analisar documento ${path}:`, error);
    return { error: error.message };
  }
}

// Função principal para analisar o banco de dados
async function analyzeDatabase() {
  console.log('Iniciando análise do banco de dados...');
  const dbStructure = {
    collections: {}
  };

  try {
    // Listar todas as coleções principais
    const collections = await db.listCollections();
    console.log(`Encontradas ${collections.length} coleções principais`);

    for (const collRef of collections) {
      const collName = collRef.id;
      console.log(`Analisando coleção: ${collName}`);
      
      dbStructure.collections[collName] = {
        documents: {}
      };

      // Analisar uma amostra de documentos
      const snapshot = await collRef.limit(5).get();
      console.log(`- Amostra de ${snapshot.size} documentos`);
      
      for (const doc of snapshot.docs) {
        console.log(`-- Analisando documento: ${doc.id}`);
        dbStructure.collections[collName].documents[doc.id] = 
          await analyzeDocument(doc.ref, `${collName}/${doc.id}`);
      }
    }

    // Salvar resultados em arquivo
    const result = {
      structure: dbStructure,
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync('db-structure.json', JSON.stringify(result, null, 2));
    console.log('Análise concluída! Resultados salvos em db-structure.json');
  } catch (error) {
    console.error('Erro durante análise:', error);
    throw error;
  }
}

// Executar a análise
analyzeDatabase()
  .then(() => {
    console.log('Processo concluído com sucesso');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro durante a análise:', error);
    process.exit(1);
  });