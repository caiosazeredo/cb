// src/services/ReportService.js
import { db } from "../services/Firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  getDoc,
  doc,
  Timestamp 
} from "firebase/firestore";
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
  format
} from 'date-fns';

/**
 * Classe de serviço para geração de relatórios
 */
export class ReportService {
  /**
   * Obtém período baseado no tipo
   * @param {string} periodType - Tipo de período (day, week, month, year, custom)
   * @param {Date} referenceDate - Data de referência
   * @param {Date} startDate - Data inicial (para período personalizado)
   * @param {Date} endDate - Data final (para período personalizado)
   * @returns {Object} Período com datas de início e fim
   */
  static getPeriodDates(periodType, referenceDate = new Date(), startDate = null, endDate = null) {
    let start, end;
    
    switch (periodType) {
      case 'day':
        start = startOfDay(referenceDate);
        end = endOfDay(referenceDate);
        break;
      case 'week':
        start = startOfWeek(referenceDate, { weekStartsOn: 0 }); // Domingo como início da semana
        end = endOfWeek(referenceDate, { weekStartsOn: 0 });
        break;
      case 'month':
        start = startOfMonth(referenceDate);
        end = endOfMonth(referenceDate);
        break;
      case 'year':
        start = startOfYear(referenceDate);
        end = endOfYear(referenceDate);
        break;
      case 'custom':
        if (!startDate || !endDate) {
          throw new Error('Datas de início e fim são obrigatórias para período personalizado');
        }
        start = startOfDay(startDate);
        end = endOfDay(endDate);
        break;
      default:
        throw new Error(`Tipo de período desconhecido: ${periodType}`);
    }
    
    return {
      startDate: start,
      endDate: end,
      startTimestamp: Timestamp.fromDate(start),
      endTimestamp: Timestamp.fromDate(end)
    };
  }

  /**
   * Gera o resumo financeiro
   * @param {Object} params - Parâmetros do relatório
   * @returns {Promise<Object>} Dados do resumo financeiro
   */
  static async generateFinancialSummary(params) {
    try {
      const { unitId, periodType, referenceDate, startDate, endDate } = params;
      const period = this.getPeriodDates(periodType, referenceDate, startDate, endDate);
      
      // Buscar todas as unidades se unitId for "all"
      const unidades = unitId === "all" ? await this.fetchUnits(true) : [{ id: unitId }];
      
      // Totais iniciais
      const totals = {
        receitas: 0,
        despesas: 0,
        lucro: 0,
        valoresPendentes: 0,
        porFormaPagamento: {
          dinheiro: 0,
          credito: 0,
          debito: 0,
          pix: 0,
          ticket: 0
        }
      };
      
      const movimentos = [];
      
      // Para cada unidade, buscar todas as movimentações
      for (const unidade of unidades) {
        const movs = await this.fetchMovimentos(unidade.id, period.startTimestamp, period.endTimestamp);
        movimentos.push(...movs);
        
        // Processar movimentos para obter totais
        movs.forEach(movimento => {
          const valor = Number(movimento.valor) || 0;
          
          // Classifica receitas (entradas) e despesas (saídas)
          if (movimento.tipo === 'entrada') {
            if (movimento.paymentStatus === 'pendente') {
              totals.valoresPendentes += valor;
            } else {
              totals.receitas += valor;
              
              // Adiciona ao total por forma de pagamento
              if (totals.porFormaPagamento.hasOwnProperty(movimento.forma)) {
                totals.porFormaPagamento[movimento.forma] += valor;
              }
            }
          } else if (movimento.tipo === 'saida') {
            totals.despesas += valor;
          }
        });
      }
      
      // Calcular lucro (receitas - despesas)
      totals.lucro = totals.receitas - totals.despesas;
      
      return {
        period: {
          startDate: period.startDate,
          endDate: period.endDate,
          formattedStart: format(period.startDate, 'dd/MM/yyyy'),
          formattedEnd: format(period.endDate, 'dd/MM/yyyy')
        },
        totals,
        movimentos,
        unitId
      };
    } catch (error) {
      console.error("Erro ao gerar resumo financeiro:", error);
      throw error;
    }
  }

  /**
   * Busca movimentos de todas as caixas de uma unidade em um período específico
   * @param {string} unitId - ID da unidade
   * @param {Timestamp} startTimestamp - Timestamp inicial
   * @param {Timestamp} endTimestamp - Timestamp final
   * @returns {Promise<Array>} Lista de movimentos
   */
  static async fetchMovimentos(unitId, startTimestamp, endTimestamp) {
    try {
      const movimentos = [];
      
      // Buscar caixas da unidade
      const caixasRef = collection(db, `unidades/${unitId}/caixas`);
      const caixasSnapshot = await getDocs(caixasRef);
      
      // Sem caixas, retorna array vazio
      if (caixasSnapshot.empty) {
        return movimentos;
      }
      
      // Para cada caixa, buscar movimentos no período
      for (const caixaDoc of caixasSnapshot.docs) {
        const caixaId = caixaDoc.id;
        
        const movimentosRef = collection(db, `unidades/${unitId}/caixas/${caixaId}/movimentos`);
        let q;
        
        // Se temos um período definido
        if (startTimestamp && endTimestamp) {
          q = query(
            movimentosRef,
            where("timestamp", ">=", startTimestamp),
            where("timestamp", "<=", endTimestamp)
          );
        } else {
          // Busca todos os movimentos
          q = movimentosRef;
        }
        
        const movimentosSnapshot = await getDocs(q);
        
        // Adicionar movimentos à lista
        movimentosSnapshot.forEach(doc => {
          const movimento = doc.data();
          movimentos.push({
            id: doc.id,
            ...movimento,
            caixaId,
            // Normalizar timestamp para Date
            timestamp: movimento.timestamp?.toDate() || new Date()
          });
        });
      }
      
      // Ordenar por timestamp (mais recente primeiro)
      return movimentos.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Erro ao buscar movimentos:", error);
      return []; // Retornar array vazio em caso de erro
    }
  }

  /**
   * Busca unidades do sistema
   * @param {boolean} onlyActive - Se true, retorna apenas unidades ativas
   * @returns {Promise<Array>} Lista de unidades
   */
  static async fetchUnits(onlyActive = true) {
    try {
      const unidadesRef = collection(db, 'unidades');
      const unidadesSnapshot = await getDocs(unidadesRef);
      
      // Filtrar unidades conforme o critério de ativo
      return unidadesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(unit => !onlyActive || unit.ativo);
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
      return []; // Retornar array vazio em caso de erro
    }
  }

  /**
   * Gera relatório de vendas por método de pagamento
   * @param {Object} params - Parâmetros do relatório
   * @returns {Promise<Object>} Dados do relatório
   */
  static async generateSalesByPaymentMethod(params) {
    try {
      const { unitId, periodType, referenceDate, startDate, endDate } = params;
      const period = this.getPeriodDates(periodType, referenceDate, startDate, endDate);
      
      // Buscar todas as unidades se unitId for "all"
      const unidades = unitId === "all" ? await this.fetchUnits(true) : [{ id: unitId }];
      
      // Totais iniciais por método de pagamento
      const totalPorMetodo = {
        dinheiro: 0,
        credito: 0,
        debito: 0,
        pix: 0,
        ticket: 0
      };
      
      let totalGeral = 0;
      
      // Para cada unidade, buscar todas as movimentações
      for (const unidade of unidades) {
        const movs = await this.fetchMovimentos(unidade.id, period.startTimestamp, period.endTimestamp);
        
        // Filtrar apenas movimentos de entrada (vendas) e realizados
        const vendas = movs.filter(movimento => 
          movimento.tipo === 'entrada' && movimento.paymentStatus === 'realizado'
        );
        
        // Adicionar ao total por método
        vendas.forEach(venda => {
          const valor = Number(venda.valor) || 0;
          if (totalPorMetodo.hasOwnProperty(venda.forma)) {
            totalPorMetodo[venda.forma] += valor;
            totalGeral += valor;
          }
        });
      }
      
      // Converter para o formato esperado pelo frontend
      const resultado = Object.entries(totalPorMetodo).map(([metodo, valor]) => {
        const percentual = totalGeral > 0 ? (valor / totalGeral) * 100 : 0;
        
        return {
          metodo,
          valor,
          percentual
        };
      });
      
      // Ordenar do maior para o menor valor
      resultado.sort((a, b) => b.valor - a.valor);
      
      return {
        period: {
          startDate: period.startDate,
          endDate: period.endDate,
          formattedStart: format(period.startDate, 'dd/MM/yyyy'),
          formattedEnd: format(period.endDate, 'dd/MM/yyyy')
        },
        data: resultado,
        totalGeral,
        unitId
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de vendas por método de pagamento:", error);
      throw error;
    }
  }

  /**
   * Gera relatório de vendas por unidade
   * @param {Object} params - Parâmetros do relatório
   * @returns {Promise<Object>} Dados do relatório
   */
  static async generateSalesByUnit(params) {
    try {
      const { periodType, referenceDate, startDate, endDate } = params;
      const period = this.getPeriodDates(periodType, referenceDate, startDate, endDate);
      
      // Buscar todas as unidades
      const unidades = await this.fetchUnits(true);
      
      // Para cada unidade, buscar movimentos
      const dadosPorUnidade = [];
      let totalGeral = 0;
      
      for (const unidade of unidades) {
        // Buscar movimentos da unidade no período
        const movimentos = await this.fetchMovimentos(
          unidade.id, 
          period.startTimestamp, 
          period.endTimestamp
        );
        
        // Filtrar vendas e calcular total
        const vendas = movimentos.filter(movimento => 
          movimento.tipo === 'entrada' && movimento.paymentStatus === 'realizado'
        );
        
        let totalUnidade = 0;
        vendas.forEach(venda => {
          totalUnidade += Number(venda.valor) || 0;
        });
        
        totalGeral += totalUnidade;
        
        dadosPorUnidade.push({
          unidadeId: unidade.id,
          nomeUnidade: unidade.nome,
          totalVendas: totalUnidade,
          quantidadeVendas: vendas.length
        });
      }
      
      // Calcular percentuais e ordenar por valor
      dadosPorUnidade.forEach(item => {
        item.percentual = totalGeral > 0 ? (item.totalVendas / totalGeral) * 100 : 0;
      });
      
      dadosPorUnidade.sort((a, b) => b.totalVendas - a.totalVendas);
      
      return {
        period: {
          startDate: period.startDate,
          endDate: period.endDate,
          formattedStart: format(period.startDate, 'dd/MM/yyyy'),
          formattedEnd: format(period.endDate, 'dd/MM/yyyy')
        },
        data: dadosPorUnidade,
        totalGeral
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de vendas por unidade:", error);
      throw error;
    }
  }

  /**
   * Gera relatório de vendas diárias
   * @param {Object} params - Parâmetros do relatório
   * @returns {Promise<Object>} Dados do relatório
   */
  static async generateDailySales(params) {
    try {
      const { unitId, periodType, referenceDate, startDate, endDate } = params;
      const period = this.getPeriodDates(periodType, referenceDate, startDate, endDate);
      
      // Buscar todas as unidades se unitId for "all"
      const unidades = unitId === "all" ? await this.fetchUnits(true) : [{ id: unitId }];
      
      // Mapa para agregar vendas por dia
      const vendasPorDia = new Map();
      
      // Para cada unidade, buscar movimentos
      for (const unidade of unidades) {
        const movimentos = await this.fetchMovimentos(
          unidade.id, 
          period.startTimestamp, 
          period.endTimestamp
        );
        
        // Filtrar vendas
        const vendas = movimentos.filter(movimento => 
          movimento.tipo === 'entrada' && movimento.paymentStatus === 'realizado'
        );
        
        // Agrupar por dia
        vendas.forEach(venda => {
          const dataStr = format(venda.timestamp, 'yyyy-MM-dd');
          const valor = Number(venda.valor) || 0;
          
          if (vendasPorDia.has(dataStr)) {
            const dados = vendasPorDia.get(dataStr);
            dados.value += valor;
            dados.quantity += 1;
          } else {
            vendasPorDia.set(dataStr, {
              date: format(venda.timestamp, 'dd/MM/yyyy'),
              value: valor,
              quantity: 1
            });
          }
        });
      }
      
      // Converter o mapa para um array e ordenar por data
      const salesData = Array.from(vendasPorDia.values()).sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      
      // Calcular totais
      const totalSales = salesData.reduce((sum, day) => sum + day.value, 0);
      const totalQuantity = salesData.reduce((sum, day) => sum + day.quantity, 0);
      
      // Encontrar o melhor dia
      const bestDay = salesData.length > 0 
        ? salesData.reduce((best, current) => current.value > best.value ? current : best, salesData[0])
        : { date: '-', value: 0 };
      
      return {
        period: {
          startDate: period.startDate,
          endDate: period.endDate,
          formattedStart: format(period.startDate, 'dd/MM/yyyy'),
          formattedEnd: format(period.endDate, 'dd/MM/yyyy')
        },
        salesData,
        totalSales,
        totalQuantity,
        bestDay,
        unitId
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de vendas diárias:", error);
      throw error;
    }
  }

  /**
   * Gera relatório de ticket médio
   * @param {Object} params - Parâmetros do relatório
   * @returns {Promise<Object>} Dados do relatório
   */
  static async generateTicketAverage(params) {
    try {
      const { unitId, periodType, referenceDate, startDate, endDate } = params;
      const period = this.getPeriodDates(periodType, referenceDate, startDate, endDate);
      
      // Se quisermos dados por unidade
      const porUnidade = unitId === "all";
      
      // Buscar unidades conforme parâmetro
      const unidades = porUnidade 
        ? await this.fetchUnits(true) 
        : [{ id: unitId }];
      
      // Array para dados de ticket médio por período
      const ticketData = [];
      
      // Array para dados de ticket médio por unidade
      const unitData = [];
      
      // Para cada unidade
      for (const unidade of unidades) {
        const movimentos = await this.fetchMovimentos(
          unidade.id, 
          period.startTimestamp, 
          period.endTimestamp
        );
        
        // Filtrar vendas
        const vendas = movimentos.filter(movimento => 
          movimento.tipo === 'entrada' && movimento.paymentStatus === 'realizado'
        );
        
        // Se não há vendas, pular
        if (vendas.length === 0) continue;
        
        // Calcular ticket médio da unidade
        const totalVendas = vendas.reduce((sum, venda) => sum + (Number(venda.valor) || 0), 0);
        const ticketMedioUnidade = totalVendas / vendas.length;
        
        // Se queremos dados por unidade, adicionar ao array de unidades
        if (porUnidade) {
          unitData.push({
            unit: unidade.nome,
            ticketValue: ticketMedioUnidade,
            sales: totalVendas,
            quantity: vendas.length
          });
        }
        
        // Agrupar por período (mês/semana conforme o tipo de período)
        if (periodType === 'year' || periodType === 'custom' && period.endDate - period.startDate > 60 * 24 * 60 * 60 * 1000) {
          // Agrupar por mês
          const vendasPorMes = new Map();
          
          vendas.forEach(venda => {
            const mesStr = format(venda.timestamp, 'yyyy-MM');
            const valor = Number(venda.valor) || 0;
            
            if (vendasPorMes.has(mesStr)) {
              const dados = vendasPorMes.get(mesStr);
              dados.totalSales += valor;
              dados.quantity += 1;
            } else {
              vendasPorMes.set(mesStr, {
                period: format(venda.timestamp, 'MMM/yyyy'),
                totalSales: valor,
                quantity: 1
              });
            }
          });
          
          // Calcular ticket médio por mês
          vendasPorMes.forEach((dados, mesStr) => {
            const previousMonth = this.getPreviousMonth(mesStr);
            const previousData = vendasPorMes.get(previousMonth);
            
            ticketData.push({
              period: dados.period,
              ticketValue: dados.totalSales / dados.quantity,
              totalSales: dados.totalSales,
              quantity: dados.quantity,
              previousTicket: previousData ? previousData.totalSales / previousData.quantity : null
            });
          });
        } else {
          // Agrupar por semana ou dia, dependendo do período
          const vendasPorPeriodo = new Map();
          
          vendas.forEach(venda => {
            // Para períodos curtos, usamos dia
            const periodoStr = format(venda.timestamp, 'yyyy-MM-dd');
            const valor = Number(venda.valor) || 0;
            
            if (vendasPorPeriodo.has(periodoStr)) {
              const dados = vendasPorPeriodo.get(periodoStr);
              dados.totalSales += valor;
              dados.quantity += 1;
            } else {
              vendasPorPeriodo.set(periodoStr, {
                period: format(venda.timestamp, 'dd/MM/yyyy'),
                totalSales: valor,
                quantity: 1
              });
            }
          });
          
          // Calcular ticket médio por período
          const periodos = Array.from(vendasPorPeriodo.keys()).sort();
          
          periodos.forEach((periodoStr, index) => {
            const dados = vendasPorPeriodo.get(periodoStr);
            const previousData = index > 0 ? vendasPorPeriodo.get(periodos[index - 1]) : null;
            
            ticketData.push({
              period: dados.period,
              ticketValue: dados.totalSales / dados.quantity,
              totalSales: dados.totalSales,
              quantity: dados.quantity,
              previousTicket: previousData ? previousData.totalSales / previousData.quantity : null
            });
          });
        }
      }
      
      // Ordenar por período
      ticketData.sort((a, b) => {
        // Converter para datas para comparação correta
        const dateA = parseISO(a.period.split('/').reverse().join('-'));
        const dateB = parseISO(b.period.split('/').reverse().join('-'));
        return dateA - dateB;
      });
      
      // Calcular estatísticas gerais
      const avgTicket = ticketData.length > 0 
        ? ticketData.reduce((sum, item) => sum + item.ticketValue, 0) / ticketData.length 
        : 0;
      
      const maxTicket = ticketData.length > 0 
        ? Math.max(...ticketData.map(item => item.ticketValue)) 
        : 0;
        
      const minTicket = ticketData.length > 0 
        ? Math.min(...ticketData.map(item => item.ticketValue)) 
        : 0;
        
      const ticketTrend = ticketData.length >= 2 
        ? ((ticketData[ticketData.length - 1].ticketValue - ticketData[0].ticketValue) / ticketData[0].ticketValue) * 100 
        : 0;
      
      return {
        period: {
          startDate: period.startDate,
          endDate: period.endDate,
          formattedStart: format(period.startDate, 'dd/MM/yyyy'),
          formattedEnd: format(period.endDate, 'dd/MM/yyyy')
        },
        ticketData,
        unitData,
        avgTicket,
        maxTicket,
        minTicket,
        ticketTrend,
        unitId
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de ticket médio:", error);
      throw error;
    }
  }

  /**
   * Gera o mês anterior em formato string
   * @param {string} mesStr - Mês atual em formato 'yyyy-MM'
   * @returns {string} Mês anterior em formato 'yyyy-MM'
   */
  static getPreviousMonth(mesStr) {
    const [ano, mes] = mesStr.split('-').map(Number);
    
    if (mes === 1) {
      return `${ano - 1}-12`;
    } else {
      const mesPrevio = mes - 1;
      return `${ano}-${mesPrevio.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Gera relatório de pagamentos pendentes
   * @param {Object} params - Parâmetros do relatório
   * @returns {Promise<Object>} Dados do relatório
   */
  static async generatePendingPayments(params) {
    try {
      const { unitId, periodType, referenceDate, startDate, endDate } = params;
      const period = this.getPeriodDates(periodType, referenceDate, startDate, endDate);
      
      // Buscar todas as unidades se unitId for "all"
      const unidades = unitId === "all" ? await this.fetchUnits(true) : [{ id: unitId }];
      
      // Array para pagamentos pendentes
      const pendingPayments = [];
      
      // Para cada unidade
      for (const unidade of unidades) {
        const movimentos = await this.fetchMovimentos(
          unidade.id, 
          period.startTimestamp, 
          period.endTimestamp
        );
        
        // Filtrar apenas pagamentos pendentes
        const pendentes = movimentos.filter(movimento => 
          movimento.tipo === 'entrada' && movimento.paymentStatus === 'pendente'
        );
        
        // Adicionar a informação da unidade
        pendentes.forEach(movimento => {
          pendingPayments.push({
            ...movimento,
            unidade: unidade.nome
          });
        });
      }
      
      // Ordenar por data (mais antigos primeiro)
      pendingPayments.sort((a, b) => a.timestamp - b.timestamp);
      
      return {
        period: {
          startDate: period.startDate,
          endDate: period.endDate,
          formattedStart: format(period.startDate, 'dd/MM/yyyy'),
          formattedEnd: format(period.endDate, 'dd/MM/yyyy')
        },
        pendingPayments,
        unitId
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de pagamentos pendentes:", error);
      throw error;
    }
  }
}