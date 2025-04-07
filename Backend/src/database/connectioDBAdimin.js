import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";

dotenv.config(); // Carrega variáveis do .env

// Montando o objeto de credenciais a partir das variáveis de ambiente
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Corrige as quebras de linha
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL
};

// Inicializar o Firebase Admin apenas se ainda não houver uma instância
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin inicializado com credenciais do .env");
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase Admin (produção):", error);
    process.exit(1);
  }
} else {
  console.log("ℹ️ Firebase Admin já inicializado");
}

export const authAdmin = admin.auth();
export const db = getFirestore();
