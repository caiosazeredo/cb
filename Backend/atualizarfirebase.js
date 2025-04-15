// atualizarfirebase.js
// This script adds new expense categories to Firebase and updates payment methods

// Import the database connection - adjust the path based on your actual project structure
import { db } from './src/database/connectioDBAdimin.js';

/**
 * Adds new expense categories to the 'despesasCategorias' collection in Firebase
 */
const updateExpenseCategories = async () => {
  try {
    console.log('Starting expense categories update...');
    
    // Define expense categories
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
    
    // Get a reference to the despesasCategorias collection
    const categoriasRef = db.collection('despesasCategorias');
    
    // Create a batch operation
    const batch = db.batch();
    
    // Add each category to the batch
    for (const category of expenseCategories) {
      const docRef = categoriasRef.doc(category.id);
      batch.set(docRef, {
        name: category.name,
        type: category.type,
        updated: new Date()
      }, { merge: true }); // Using merge to avoid overwriting existing categories
    }
    
    // Commit the batch operation
    await batch.commit();
    
    console.log(`Successfully added ${expenseCategories.length} expense categories to Firebase`);
    return true;
  } catch (error) {
    console.error('Error updating expense categories:', error);
    return false;
  }
};

/**
 * Updates the paymentMethods collection with methods from the image
 */
const updatePaymentMethods = async () => {
  try {
    console.log('Starting payment methods update...');
    
    // Define payment methods from the image
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
    
    // Get a reference to the paymentMethods collection
    const methodsRef = db.collection('paymentMethods');
    
    // Create a batch operation
    const batch = db.batch();
    
    // Add each method to the batch
    for (const method of paymentMethods) {
      const docRef = methodsRef.doc(method.id);
      batch.set(docRef, {
        name: method.name,
        type: method.type,
        category: method.category,
        updated: new Date()
      }, { merge: true }); // Using merge to avoid overwriting existing methods
    }
    
    // Commit the batch operation
    await batch.commit();
    
    console.log(`Successfully added ${paymentMethods.length} payment methods to Firebase`);
    return true;
  } catch (error) {
    console.error('Error updating payment methods:', error);
    return false;
  }
};

// Execute both updates
const runUpdates = async () => {
  try {
    console.log("🚀 Starting Firebase updates...");
    
    // Run expense categories update
    const categoriesResult = await updateExpenseCategories();
    if (categoriesResult) {
      console.log("✅ Expense categories updated successfully");
    } else {
      console.log("❌ Failed to update expense categories");
    }
    
    // Run payment methods update
    const methodsResult = await updatePaymentMethods();
    if (methodsResult) {
      console.log("✅ Payment methods updated successfully");
    } else {
      console.log("❌ Failed to update payment methods");
    }
    
    console.log("🏁 Firebase updates completed");
  } catch (error) {
    console.error("❌ Error during updates:", error);
  }
};

// Run the updates
runUpdates().catch(console.error);