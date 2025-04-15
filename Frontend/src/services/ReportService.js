// src/services/ReportService.js
// Serviço central para geração de relatórios

import { db } from "../services/Firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  startAt, 
  endAt,
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
   * Converte um range de datas para timestamps do Firestore
   * @param {Date} startDate - Data inicial
   * @param {Date} endDate - Data final
   * @returns {Object} Objeto com timestamps de início e fim
   */
  static getTimestampRange(startDate, endDate) {
    // Garantir que temos início e fim do dia para capturar todos os registros
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    
    return {
      startTimestamp: Timestamp.fromDate(start),
      endTimestamp: Timestamp.fromDate(end)
    };
  }

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
      ...this.getTimestampRange(start, end)
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
      
      // Buscar movimentos do período
      const movimentos = await this.fetchMovimentos(unitId, period.startTimestamp, period.endTimestamp);
      
      // Calcular totais
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
      
      // Processar movimentos para obter totais
      movimentos.forEach(movimento => {
        const valor = Number(movimento.valor) || 0;
        
        // Classifica receitas (entradas) e despesas (saídas)
        if (movimento.tipo === 'entrada') {
          if (movimento.paymentStatus === 'pendente') {
            totals.valoresPendentes += valor;
          } else {
            totals.receitas += valor;
            totals.porFormaPagamento[movimento.forma] += valor;
          }
        } else if (movimento.tipo === 'saida') {
          totals.despesas += valor;
        }
      });
      
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
   * Busca movimentos de uma unidade em um período específico
   * @param {string} unitId - ID da unidade
   * @param {Timestamp} startTimestamp - Timestamp inicial
   * @param {Timestamp} endTimestamp - Timestamp final
   * @returns {Promise<Array>} Lista de movimentos
   */
  static async fetchMovimentos(unitId, startTimestamp, endTimestamp) {
    try {
      const movimentos = [];
      
      // Primeiro, buscar todos os caixas da unidade
      const caixasRef = collection(db, `unidades/${unitId}/caixas`);
      const caixasSnapshot = await getDocs(caixasRef);
      
      // Para cada caixa, buscar movimentos no período
      for (const caixaDoc of caixasSnapshot.docs) {
        const caixaId = caixaDoc.id;
        
        // Query para movimentos no período
        const movimentosRef = collection(db, `unidades/${unitId}/caixas/${caixaId}/movimentos`);
        const q = query(
          movimentosRef,
          where("timestamp", ">=", startTimestamp),
          where("timestamp", "<=", endTimestamp),
          where("ativo", "==", true)
        );
        
        const movimentosSnapshot = await getDocs(q);
        
        // Adicionar movimentos à lista
        movimentosSnapshot.docs.forEach(doc => {
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
      throw error;
    }
  }

  /**
   * Busca logs do sistema
   * @param {Object} params - Parâmetros para busca de logs
   * @returns {Promise<Array>} Lista de logs
   */
  static async fetchSystemLogs(params) {
    try {
      const { userId, action, periodType, referenceDate, startDate, endDate } = params;
      const period = this.getPeriodDates(periodType, referenceDate, startDate, endDate);
      
      const logsRef = collection(db, 'logs');
      
      // Construir query base
      let q = query(
        logsRef,
        where("timestamp", ">=", period.startTimestamp),
        where("timestamp", "<=", period.endTimestamp)
      );
      
      // Adicionar filtro por usuário se fornecido
      if (userId) {
        q = query(q, where("uuidUser", "==", userId));
      }
      
      // Adicionar filtro por ação/funcionalidade se fornecido
      if (action) {
        q = query(q, where("funcionalidade", "==", action));
      }
      
      // Executar query
      const logsSnapshot = await getDocs(q);
      
      // Processar logs
      const logs = logsSnapshot.docs.map(doc => {
        const log = doc.data();
        return {
          id: doc.id,
          ...log,
          // Normalizar timestamp para Date
          timestamp: log.timestamp?.toDate() || new Date()
        };
      });
      
      // Ordenar por timestamp (mais recente primeiro)
      return logs.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
      throw error;
    }
  }

  /**
   * Busca usuários do sistema
   * @returns {Promise<Array>} Lista de usuários
   */
  static async fetchUsers() {
    try {
      const usersRef = collection(db, 'Users');
      const usersSnapshot = await getDocs(usersRef);
      
      return usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
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
      let q = unidadesRef;
      
      if (onlyActive) {
        q = query(unidadesRef, where("ativo", "==", true));
      }
      
      const unidadesSnapshot = await getDocs(q);
      
      return unidadesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Erro ao buscar unidades:", error);
      throw error;
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
      
      // Buscar movimentos do período
      const movimentos = await this.fetchMovimentos(unitId, period.startTimestamp, period.endTimestamp);
      
      // Filtrar apenas movimentos de entrada (vendas)
      const vendas = movimentos.filter(movimento => 
        movimento.tipo === 'entrada' && movimento.paymentStatus === 'realizado'
      );
      
      // Calcular total por método de pagamento
      const totalPorMetodo = {
        dinheiro: 0,
        credito: 0,
        debito: 0,
        pix: 0,
        ticket: 0
      };
      
      let totalGeral = 0;
      
      vendas.forEach(venda => {
        const valor = Number(venda.valor) || 0;
        if (totalPorMetodo.hasOwnProperty(venda.forma)) {
          totalPorMetodo[venda.forma] += valor;
          totalGeral += valor;
        }
      });
      
      // Calcular percentuais
      const resultado = Object.keys(totalPorMetodo).map(metodo => {
        const valor = totalPorMetodo[metodo];
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

}