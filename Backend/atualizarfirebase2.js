// Database Initialization Script
// Run this script to populate the Firebase database with payment methods and expense categories

import { db } from './src/database/connectioDBAdimin.js';
import admin from 'firebase-admin';

const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Create collections if they don't exist
    const paymentMethodsRef = db.collection('paymentMethods');
    const expenseCategoriesRef = db.collection('despesasCategorias');
    
    // Start a batch operation for atomic writes
    const batch = db.batch();
    
    // Payment methods from the image
    const paymentMethods = [
      // Debito column
      { id: 'getnet_debito', name: 'Getnet Débito', type: 'entrada', category: 'debito' },
      { id: 'onebank_debito', name: 'Onebank Débito', type: 'entrada', category: 'debito' },
      { id: 'cielo_debito', name: 'Cielo Débito', type: 'entrada', category: 'debito' },
      { id: 'rede_debito', name: 'Rede Débito', type: 'entrada', category: 'debito' },
      { id: 'outros_debito', name: 'Outros Débito', type: 'entrada', category: 'debito' },
      
      // Credito column
      { id: 'getnet_credito', name: 'Getnet Crédito', type: 'entrada', category: 'credito' },
      { id: 'onebank_credito', name: 'Onebank Crédito', type: 'entrada', category: 'credito' },
      { id: 'cielo_credito', name: 'Cielo Crédito', type: 'entrada', category: 'credito' },
      { id: 'rede_credito', name: 'Rede Crédito', type: 'entrada', category: 'credito' },
      { id: 'outros_credito', name: 'Outros Crédito', type: 'entrada', category: 'credito' },
      
      // Ticket column
      { id: 'sodexo_alimentacao', name: 'Sodexo Alimentação', type: 'entrada', category: 'ticket' },
      { id: 'sodexo_refeicao', name: 'Sodexo Refeição', type: 'entrada', category: 'ticket' },
      { id: 'alelo_alimentacao', name: 'Alelo Alimentação', type: 'entrada', category: 'ticket' },
      { id: 'alelo_refeicao', name: 'Alelo Refeição', type: 'entrada', category: 'ticket' },
      { id: 'vr_alimentacao', name: 'VR Alimentação', type: 'entrada', category: 'ticket' },
      { id: 'vr_refeicao', name: 'VR Refeição', type: 'entrada', category: 'ticket' },
      { id: 'ben_alimentacao', name: 'Ben Alimentação', type: 'entrada', category: 'ticket' },
      { id: 'ben_refeicao', name: 'Ben Refeição', type: 'entrada', category: 'ticket' },
      { id: 'green_card', name: 'Green Card', type: 'entrada', category: 'ticket' },
      { id: 'personal_card', name: 'Personal Card', type: 'entrada', category: 'ticket' },
      { id: 'outros_ticket', name: 'Outros Ticket', type: 'entrada', category: 'ticket' },
      
      // Cash
      { id: 'dinheiro', name: 'Dinheiro', type: 'entrada', category: 'dinheiro' },
      
      // Pix
      { id: 'pix_maquina', name: 'PIX Máquina', type: 'entrada', category: 'pix' },
      { id: 'pix_qrcode', name: 'PIX QR Code', type: 'entrada', category: 'pix' }
    ];
    
    // Expense categories as requested
    const expenseCategories = [
      { id: 'aluguel', name: 'Aluguel do ponto comercial', type: 'saida' },
      { id: 'salarios', name: 'Salários e encargos trabalhistas', type: 'saida' },
      { id: 'energia', name: 'Conta de energia elétrica', type: 'saida' },
      { id: 'agua', name: 'Conta de água e esgoto', type: 'saida' },
      { id: 'internet', name: 'Internet e telefone', type: 'saida' },
      { id: 'erp', name: 'Sistemas de gestão (ERP)', type: 'saida' },
      { id: 'taxasPos', name: 'Taxas de máquinas de cartão (POS)', type: 'saida' },
      { id: 'contabilidade', name: 'Contabilidade / Escritório de contabilidade', type: 'saida' },
      { id: 'seguros', name: 'Seguros', type: 'saida' },
      { id: 'associacoes', name: 'Mensalidades de associações ou sindicatos', type: 'saida' },
      { id: 'estoque', name: 'Reposição de estoque / compras com fornecedores', type: 'saida' },
      { id: 'impostos', name: 'Impostos sobre vendas', type: 'saida' },
      { id: 'frete', name: 'Frete / transporte', type: 'saida' },
      { id: 'manutencao', name: 'Manutenção e limpeza', type: 'saida' },
      { id: 'marketing', name: 'Marketing e publicidade', type: 'saida' },
      { id: 'embalagens', name: 'Embalagens', type: 'saida' },
      { id: 'despesasBancarias', name: 'Despesas bancárias', type: 'saida' }
    ];
    
    // Add payment methods to batch
    paymentMethods.forEach(method => {
      const methodRef = paymentMethodsRef.doc(method.id);
      batch.set(methodRef, {
        ...method,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
    
    // Add expense categories to batch
    expenseCategories.forEach(category => {
      const categoryRef = expenseCategoriesRef.doc(category.id);
      batch.set(categoryRef, {
        ...category,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log(`✅ Successfully initialized database with:
    - ${paymentMethods.length} payment methods
    - ${expenseCategories.length} expense categories`);
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return false;
  }
};

// Run the initialization
initializeDatabase()
  .then(result => {
    if (result) {
      console.log('Database initialization completed successfully!');
    } else {
      console.error('Database initialization failed!');
    }
  })
  .catch(error => {
    console.error('Unexpected error during database initialization:', error);
  });

export default initializeDatabase;