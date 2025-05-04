// src/utils/exportUtils.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

/**
 * Exporta um relatório como arquivo PDF
 * @param {Object} data - Dados do relatório
 * @param {string} reportType - Tipo de relatório
 * @param {string} fileName - Nome do arquivo
 */
export const exportPDF = (data, reportType, fileName) => {
  // Criar documento PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Título do relatório
  const title = getReportTitle(reportType);
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, 15, { align: 'center' });
  
  // Período
  if (data.period) {
    const periodText = `Período: ${format(new Date(data.period.startDate), 'dd/MM/yyyy', { locale: ptBR })} até ${format(new Date(data.period.endDate), 'dd/MM/yyyy', { locale: ptBR })}`;
    doc.setFontSize(12);
    doc.text(periodText, pageWidth / 2, 25, { align: 'center' });
  }
  
  // Unidade
  if (data.unitName) {
    doc.setFontSize(12);
    doc.text(`Unidade: ${data.unitName}`, pageWidth / 2, 35, { align: 'center' });
  }
  
  // Data de geração
  doc.setFontSize(10);
  doc.text(`Relatório gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}`, pageWidth / 2, 45, { align: 'center' });
  
  doc.line(10, 50, pageWidth - 10, 50);
  
  // Conteúdo baseado no tipo de relatório
  switch (reportType) {
    case 'financialSummary':
      exportFinancialSummaryToPDF(doc, data, 60);
      break;
    case 'salesByPaymentMethod':
      exportSalesByPaymentMethodToPDF(doc, data, 60);
      break;
    case 'salesByUnit':
      exportSalesByUnitToPDF(doc, data, 60);
      break;
    case 'pendingPayments':
      exportPendingPaymentsToPDF(doc, data, 60);
      break;
    case 'cashFlow':
      exportCashFlowToPDF(doc, data, 60);
      break;
    case 'systemLogs':
      exportSystemLogsToPDF(doc, data, 60);
      break;
    case 'loginHistory':
      exportLoginHistoryToPDF(doc, data, 60);
      break;
    // Adicione outros tipos de relatório conforme necessário
    default:
      doc.setFontSize(12);
      doc.text('Exportação para PDF não disponível para este relatório.', 10, 60);
  }
  
  // Salvar PDF
  doc.save(`${fileName}.pdf`);
};

/**
 * Exporta um relatório como arquivo CSV
 * @param {Object} data - Dados do relatório
 * @param {string} reportType - Tipo de relatório
 * @param {string} fileName - Nome do arquivo
 */
export const exportCSV = (data, reportType, fileName) => {
  let csvContent = '';
  
  // Adicionar título
  const title = getReportTitle(reportType);
  csvContent += `${title}\r\n`;
  
  // Adicionar período
  if (data.period) {
    csvContent += `Período: ${format(new Date(data.period.startDate), 'dd/MM/yyyy', { locale: ptBR })} até ${format(new Date(data.period.endDate), 'dd/MM/yyyy', { locale: ptBR })}\r\n`;
  }
  
  // Adicionar unidade
  if (data.unitName) {
    csvContent += `Unidade: ${data.unitName}\r\n`;
  }
  
  // Adicionar data de geração
  csvContent += `Relatório gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}\r\n\r\n`;
  
  // Dados específicos baseados no tipo de relatório
  switch (reportType) {
    case 'financialSummary':
      csvContent += exportFinancialSummaryToCSV(data);
      break;
    case 'salesByPaymentMethod':
      csvContent += exportSalesByPaymentMethodToCSV(data);
      break;
    case 'salesByUnit':
      csvContent += exportSalesByUnitToCSV(data);
      break;
    case 'pendingPayments':
      csvContent += exportPendingPaymentsToCSV(data);
      break;
    case 'cashFlow':
      csvContent += exportCashFlowToCSV(data);
      break;
    case 'systemLogs':
      csvContent += exportSystemLogsToCSV(data);
      break;
    case 'loginHistory':
      csvContent += exportLoginHistoryToCSV(data);
      break;
    // Adicione outros tipos de relatório conforme necessário
    default:
      csvContent += 'Exportação para CSV não disponível para este relatório.';
  }
  
  // Criar download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Obter título do relatório baseado no tipo
 * @param {string} reportType - Tipo de relatório
 * @returns {string} Título do relatório
 */
const getReportTitle = (reportType) => {
  switch (reportType) {
    case 'financialSummary':
      return 'Resumo Financeiro';
    case 'salesByPaymentMethod':
      return 'Vendas por Método de Pagamento';
    case 'salesByUnit':
      return 'Vendas por Unidade';
    case 'dailySales':
      return 'Vendas Diárias';
    case 'ticketAverage':
      return 'Ticket Médio';
    case 'pendingPayments':
      return 'Pagamentos Pendentes';
    case 'cashFlow':
      return 'Fluxo de Caixa';
    case 'salesByHour':
      return 'Vendas por Hora';
    case 'salesByDay':
      return 'Vendas por Dia da Semana';
    case 'systemLogs':
      return 'Logs do Sistema';
    case 'loginHistory':
      return 'Histórico de Login';
    default:
      return 'Relatório';
  }
};

/**
 * Formatar valor monetário
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// ------------------------------
// Funções específicas para cada tipo de relatório
// ------------------------------

// Resumo Financeiro
const exportFinancialSummaryToPDF = (doc, data, startY) => {
  const { totals } = data;
  
  // Totais
  doc.setFontSize(14);
  doc.text('Resumo Geral', 10, startY);
  startY += 10;
  
  // Tabela de resumo
  const summaryRows = [
    ['Total de Receitas', formatCurrency(totals.receitas)],
    ['Total de Despesas', formatCurrency(totals.despesas)],
    ['Lucro Líquido', formatCurrency(totals.lucro)],
    ['Valores Pendentes', formatCurrency(totals.valoresPendentes)]
  ];
  
  doc.autoTable({
    startY,
    head: [['Item', 'Valor']],
    body: summaryRows,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [254, 195, 46] },
    margin: { top: 10 }
  });
  
  startY = doc.lastAutoTable.finalY + 15;
  
  // Tabela por método de pagamento
  doc.setFontSize(14);
  doc.text('Por Método de Pagamento', 10, startY);
  startY += 10;
  
  const methodRows = Object.entries(totals.porFormaPagamento).map(([key, value]) => {
    const method = key === "dinheiro" ? "Dinheiro" :
                  key === "credito" ? "Crédito" :
                  key === "debito" ? "Débito" :
                  key === "pix" ? "PIX" :
                  key === "ticket" ? "Ticket" : key;
    return [method, formatCurrency(value)];
  });
  
  doc.autoTable({
    startY,
    head: [['Método de Pagamento', 'Valor']],
    body: methodRows,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [254, 195, 46] },
    margin: { top: 10 }
  });
  
  startY = doc.lastAutoTable.finalY + 15;
  
  // Movimentações recentes
  if (data.movimentos && data.movimentos.length > 0) {
    doc.setFontSize(14);
    doc.text('Movimentações Recentes', 10, startY);
    startY += 10;
    
    const movRows = data.movimentos.slice(0, 15).map(movimento => {
      const date = format(new Date(movimento.timestamp), 'dd/MM/yyyy');
      const tipo = movimento.tipo === "entrada" ? "Entrada" : "Saída";
      const forma = movimento.forma === "dinheiro" ? "Dinheiro" :
                  movimento.forma === "credito" ? "Crédito" :
                  movimento.forma === "debito" ? "Débito" :
                  movimento.forma === "pix" ? "PIX" :
                  movimento.forma === "ticket" ? "Ticket" : movimento.forma;
      
      return [
        date,
        tipo,
        forma,
        movimento.descricao || "-",
        formatCurrency(movimento.valor)
      ];
    });
    
    doc.autoTable({
      startY,
      head: [['Data', 'Tipo', 'Forma', 'Descrição', 'Valor']],
      body: movRows,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [254, 195, 46] },
      margin: { top: 10 }
    });
  }
};

const exportFinancialSummaryToCSV = (data) => {
  const { totals } = data;
  let csvContent = 'RESUMO GERAL\r\n';
  
  csvContent += 'Item,Valor\r\n';
  csvContent += `Total de Receitas,${formatCurrency(totals.receitas)}\r\n`;
  csvContent += `Total de Despesas,${formatCurrency(totals.despesas)}\r\n`;
  csvContent += `Lucro Líquido,${formatCurrency(totals.lucro)}\r\n`;
  csvContent += `Valores Pendentes,${formatCurrency(totals.valoresPendentes)}\r\n\r\n`;
  
  csvContent += 'POR MÉTODO DE PAGAMENTO\r\n';
  csvContent += 'Método de Pagamento,Valor\r\n';
  
  Object.entries(totals.porFormaPagamento).forEach(([key, value]) => {
    const method = key === "dinheiro" ? "Dinheiro" :
                 key === "credito" ? "Crédito" :
                 key === "debito" ? "Débito" :
                 key === "pix" ? "PIX" :
                 key === "ticket" ? "Ticket" : key;
    csvContent += `${method},${formatCurrency(value)}\r\n`;
  });
  
  csvContent += '\r\nMOVIMENTAÇÕES RECENTES\r\n';
  csvContent += 'Data,Tipo,Forma,Descrição,Valor\r\n';
  
  if (data.movimentos && data.movimentos.length > 0) {
    data.movimentos.slice(0, 30).forEach(movimento => {
      const date = format(new Date(movimento.timestamp), 'dd/MM/yyyy');
      const tipo = movimento.tipo === "entrada" ? "Entrada" : "Saída";
      const forma = movimento.forma === "dinheiro" ? "Dinheiro" :
                  movimento.forma === "credito" ? "Crédito" :
                  movimento.forma === "debito" ? "Débito" :
                  movimento.forma === "pix" ? "PIX" :
                  movimento.forma === "ticket" ? "Ticket" : movimento.forma;
      
      // Escapar aspas em campos de texto
      const descricao = movimento.descricao ? `"${movimento.descricao.replace(/"/g, '""')}"` : "-";
      
      csvContent += `${date},${tipo},${forma},${descricao},${formatCurrency(movimento.valor)}\r\n`;
    });
  }
  
  return csvContent;
};

// Vendas por Método de Pagamento
const exportSalesByPaymentMethodToPDF = (doc, data, startY) => {
  // Total geral
  doc.setFontSize(14);
  doc.text(`Total de Vendas: ${formatCurrency(data.totalGeral)}`, 10, startY);
  startY += 15;
  
  // Tabela de métodos
  const methodRows = data.data.map(item => {
    return [
      item.metodo === "dinheiro" ? "Dinheiro" :
      item.metodo === "credito" ? "Crédito" :
      item.metodo === "debito" ? "Débito" :
      item.metodo === "pix" ? "PIX" :
      item.metodo === "ticket" ? "Ticket" : item.metodo,
      formatCurrency(item.valor),
      `${item.percentual.toFixed(2)}%`
    ];
  });
  
  doc.autoTable({
    startY,
    head: [['Método de Pagamento', 'Valor', 'Percentual']],
    body: methodRows,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [254, 195, 46] },
    margin: { top: 10 }
  });
};

const exportSalesByPaymentMethodToCSV = (data) => {
  let csvContent = `Total de Vendas: ${formatCurrency(data.totalGeral)}\r\n\r\n`;
  csvContent += 'Método de Pagamento,Valor,Percentual\r\n';
  
  data.data.forEach(item => {
    const method = item.metodo === "dinheiro" ? "Dinheiro" :
                 item.metodo === "credito" ? "Crédito" :
                 item.metodo === "debito" ? "Débito" :
                 item.metodo === "pix" ? "PIX" :
                 item.metodo === "ticket" ? "Ticket" : item.metodo;
    
    csvContent += `${method},${formatCurrency(item.valor)},${item.percentual.toFixed(2)}%\r\n`;
  });
  
  return csvContent;
};

// Vendas por Unidade
const exportSalesByUnitToPDF = (doc, data, startY) => {
  // Total geral
  doc.setFontSize(14);
  doc.text(`Total de Vendas: ${formatCurrency(data.totalGeral)}`, 10, startY);
  startY += 15;
  
  // Tabela de unidades
  const unitRows = data.data.map(unit => {
    const ticketMedio = unit.quantidadeVendas > 0 
      ? unit.totalVendas / unit.quantidadeVendas 
      : 0;
    
    return [
      unit.nomeUnidade,
      formatCurrency(unit.totalVendas),
      unit.quantidadeVendas.toString(),
      `${unit.percentual.toFixed(2)}%`,
      formatCurrency(ticketMedio)
    ];
  });
  
  doc.autoTable({
    startY,
    head: [['Unidade', 'Total de Vendas', 'Quantidade', 'Percentual', 'Ticket Médio']],
    body: unitRows,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [254, 195, 46] },
    margin: { top: 10 }
  });
};

const exportSalesByUnitToCSV = (data) => {
  let csvContent = `Total de Vendas: ${formatCurrency(data.totalGeral)}\r\n\r\n`;
  csvContent += 'Unidade,Total de Vendas,Quantidade,Percentual,Ticket Médio\r\n';
  
  data.data.forEach(unit => {
    const ticketMedio = unit.quantidadeVendas > 0 
      ? unit.totalVendas / unit.quantidadeVendas 
      : 0;
    
    csvContent += `"${unit.nomeUnidade}",${formatCurrency(unit.totalVendas)},${unit.quantidadeVendas},${unit.percentual.toFixed(2)}%,${formatCurrency(ticketMedio)}\r\n`;
  });
  
  return csvContent;
};

// Pagamentos Pendentes
const exportPendingPaymentsToPDF = (doc, data, startY) => {
  // Totais
  const hoje = new Date();
  const totalPendente = data.pendingPayments.reduce((total, payment) => total + payment.valor, 0);
  
  doc.setFontSize(14);
  doc.text(`Total Pendente: ${formatCurrency(totalPendente)}`, 10, startY);
  doc.text(`Total de Pagamentos: ${data.pendingPayments.length}`, 10, startY + 10);
  startY += 25;
  
  // Tabela de pagamentos pendentes
  const pendingRows = data.pendingPayments.map(payment => {
    const date = format(new Date(payment.timestamp), 'dd/MM/yyyy');
    const diasPendentes = Math.floor((hoje - new Date(payment.timestamp)) / (1000 * 60 * 60 * 24));
    
    return [
      date,
      payment.cliente || "-",
      payment.forma === "credito" ? "Crédito" :
      payment.forma === "pix" ? "PIX" :
      payment.forma === "ticket" ? "Ticket" : payment.forma,
      payment.funcionario || "-",
      formatCurrency(payment.valor),
      `${diasPendentes} dias`
    ];
  });
  
  doc.autoTable({
    startY,
    head: [['Data', 'Cliente', 'Forma', 'Funcionário', 'Valor', 'Idade']],
    body: pendingRows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [254, 195, 46] },
    margin: { top: 10 }
  });
};

const exportPendingPaymentsToCSV = (data) => {
  const hoje = new Date();
  const totalPendente = data.pendingPayments.reduce((total, payment) => total + payment.valor, 0);
  
  let csvContent = `Total Pendente: ${formatCurrency(totalPendente)}\r\n`;
  csvContent += `Total de Pagamentos: ${data.pendingPayments.length}\r\n\r\n`;
  csvContent += 'Data,Cliente,Forma,Funcionário,Valor,Idade\r\n';
  
  data.pendingPayments.forEach(payment => {
    const date = format(new Date(payment.timestamp), 'dd/MM/yyyy');
    const diasPendentes = Math.floor((hoje - new Date(payment.timestamp)) / (1000 * 60 * 60 * 24));
    
    const cliente = payment.cliente ? `"${payment.cliente.replace(/"/g, '""')}"` : "-";
    const funcionario = payment.funcionario ? `"${payment.funcionario.replace(/"/g, '""')}"` : "-";
    
    const forma = payment.forma === "credito" ? "Crédito" :
                payment.forma === "pix" ? "PIX" :
                payment.forma === "ticket" ? "Ticket" : payment.forma;
    
    csvContent += `${date},${cliente},${forma},${funcionario},${formatCurrency(payment.valor)},${diasPendentes} dias\r\n`;
  });
  
  return csvContent;
};

// Fluxo de Caixa
const exportCashFlowToPDF = (doc, data, startY) => {
  // Totais
  const totalEntradas = data.movimentos
    .filter(m => m.tipo === "entrada" && m.paymentStatus === "realizado")
    .reduce((total, m) => total + Number(m.valor), 0);
  
  const totalSaidas = data.movimentos
    .filter(m => m.tipo === "saida")
    .reduce((total, m) => total + Number(m.valor), 0);
  
  const saldoLiquido = totalEntradas - totalSaidas;
  
  doc.setFontSize(14);
  doc.text(`Total de Entradas: ${formatCurrency(totalEntradas)}`, 10, startY);
  doc.text(`Total de Saídas: ${formatCurrency(totalSaidas)}`, 10, startY + 10);
  doc.text(`Saldo Líquido: ${formatCurrency(saldoLiquido)}`, 10, startY + 20);
  startY += 35;
  
  // Tabela de movimentações
  const movRows = data.movimentos.map(movimento => {
    const date = format(new Date(movimento.timestamp), 'dd/MM/yyyy HH:mm');
    
    return [
      date,
      movimento.tipo === "entrada" ? "Entrada" : "Saída",
      movimento.forma === "dinheiro" ? "Dinheiro" :
      movimento.forma === "credito" ? "Crédito" :
      movimento.forma === "debito" ? "Débito" :
      movimento.forma === "pix" ? "PIX" :
      movimento.forma === "ticket" ? "Ticket" : movimento.forma,
      movimento.descricao || "-",
      formatCurrency(movimento.valor)
    ];
  });
  
  doc.autoTable({
    startY,
    head: [['Data/Hora', 'Tipo', 'Forma', 'Descrição', 'Valor']],
    body: movRows,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [254, 195, 46] },
    margin: { top: 10 }
  });
};

const exportCashFlowToCSV = (data) => {
  const totalEntradas = data.movimentos
    .filter(m => m.tipo === "entrada" && m.paymentStatus === "realizado")
    .reduce((total, m) => total + Number(m.valor), 0);

  const totalSaidas = data.movimentos
    .filter(m => m.tipo === "saida")
    .reduce((total, m) => total + Number(m.valor), 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  let csvContent = `Total de Entradas: ${formatCurrency(totalEntradas)}\r\n`;
  csvContent += `Total de Saídas: ${formatCurrency(totalSaidas)}\r\n`;
  csvContent += `Saldo Líquido: ${formatCurrency(saldoLiquido)}\r\n\r\n`;
  csvContent += 'Data/Hora,Tipo,Forma,Descrição,Valor\r\n';
  
  data.movimentos.forEach(movimento => {
    const date = format(new Date(movimento.timestamp), 'dd/MM/yyyy HH:mm');
    const tipo = movimento.tipo === "entrada" ? "Entrada" : "Saída";
    const forma = movimento.forma === "dinheiro" ? "Dinheiro" :
                movimento.forma === "credito" ? "Crédito" :
                movimento.forma === "debito" ? "Débito" :
                movimento.forma === "pix" ? "PIX" :
                movimento.forma === "ticket" ? "Ticket" : movimento.forma;
    
    // Escapar aspas em campos de texto
    const descricao = movimento.descricao ? `"${movimento.descricao.replace(/"/g, '""')}"` : "-";
    
    csvContent += `${date},${tipo},${forma},${descricao},${formatCurrency(movimento.valor)}\r\n`;
  });
  
  return csvContent;
};

// Logs do Sistema
const exportSystemLogsToPDF = (doc, data, startY) => {
  doc.setFontSize(14);
  doc.text(`Total de Logs: ${data.logs ? data.logs.length : 0}`, 10, startY);
  startY += 15;
  
  // Tabela de logs
  const logs = Array.isArray(data) ? data : data.logs || [];
  const logRows = logs.map(log => {
    const date = format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss');
    
    return [
      date,
      log.uuidUser,
      log.funcionalidade,
      log.status === "success" ? "Sucesso" : "Erro",
      log.mensagem || "-"
    ];
  });
  
  doc.autoTable({
    startY,
    head: [['Data/Hora', 'Usuário', 'Funcionalidade', 'Status', 'Mensagem']],
    body: logRows,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [254, 195, 46] },
    margin: { top: 10 }
  });
};

const exportSystemLogsToCSV = (data) => {
  const logs = Array.isArray(data) ? data : data.logs || [];
  let csvContent = `Total de Logs: ${logs.length}\r\n\r\n`;
  csvContent += 'Data/Hora,Usuário,Funcionalidade,Status,Mensagem,Detalhes\r\n';
  
  logs.forEach(log => {
    const date = format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss');
    const status = log.status === "success" ? "Sucesso" : "Erro";
    
    // Escapar aspas em campos de texto
    const mensagem = log.mensagem ? `"${log.mensagem.replace(/"/g, '""')}"` : "-";
    const detalhes = log.detalhes ? `"${JSON.stringify(log.detalhes).replace(/"/g, '""')}"` : "-";
    
    csvContent += `${date},"${log.uuidUser}","${log.funcionalidade}",${status},${mensagem},${detalhes}\r\n`;
  });
  
  return csvContent;
};

// Histórico de Login
const exportLoginHistoryToPDF = (doc, data, startY) => {
  const history = data.history || [];
  const userCount = new Set(history.map(entry => entry.userId)).size;
  const successCount = history.filter(entry => entry.success).length;
  const failureCount = history.length - successCount;
  
  doc.setFontSize(14);
  doc.text(`Total de Logins: ${history.length}`, 10, startY);
  doc.text(`Usuários Únicos: ${userCount}`, 10, startY + 10);
  doc.text(`Logins com Sucesso: ${successCount}`, 10, startY + 20);
  doc.text(`Falhas de Login: ${failureCount}`, 10, startY + 30);
  startY += 45;
  
  // Tabela de logins
  const loginRows = history.map(entry => {
    const date = format(new Date(entry.timestamp), 'dd/MM/yyyy HH:mm:ss');
    
    return [
      date,
      entry.userName || entry.userId,
      entry.userEmail || "-",
      entry.success ? "Sucesso" : "Falha",
      entry.device || "-",
      entry.ipAddress || "-"
    ];
  });
  
  doc.autoTable({
    startY,
    head: [['Data/Hora', 'Usuário', 'Email', 'Status', 'Dispositivo', 'Endereço IP']],
    body: loginRows,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [254, 195, 46] },
    margin: { top: 10 }
  });
};

const exportLoginHistoryToCSV = (data) => {
  const history = data.history || [];
  const userCount = new Set(history.map(entry => entry.userId)).size;
  const successCount = history.filter(entry => entry.success).length;
  const failureCount = history.length - successCount;
  
  let csvContent = `Total de Logins: ${history.length}\r\n`;
  csvContent += `Usuários Únicos: ${userCount}\r\n`;
  csvContent += `Logins com Sucesso: ${successCount}\r\n`;
  csvContent += `Falhas de Login: ${failureCount}\r\n\r\n`;
  csvContent += 'Data/Hora,Usuário,Email,Status,Dispositivo,Endereço IP\r\n';
  
  history.forEach(entry => {
    const date = format(new Date(entry.timestamp), 'dd/MM/yyyy HH:mm:ss');
    const status = entry.success ? "Sucesso" : "Falha";
    
    // Escapar aspas em campos de texto
    const userName = entry.userName ? `"${entry.userName.replace(/"/g, '""')}"` : `"${entry.userId}"`;
    const userEmail = entry.userEmail ? `"${entry.userEmail.replace(/"/g, '""')}"` : "-";
    const device = entry.device ? `"${entry.device.replace(/"/g, '""')}"` : "-";
    const ipAddress = entry.ipAddress || "-";
    
    csvContent += `${date},${userName},${userEmail},${status},${device},${ipAddress}\r\n`;
  });
  
  return csvContent;
};