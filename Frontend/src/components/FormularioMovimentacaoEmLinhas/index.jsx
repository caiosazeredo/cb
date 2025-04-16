import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Select,
  MenuItem,
  Typography,
  FormControl
} from '@mui/material';
import Swal from 'sweetalert2';
import Api from "../../helpers/Api";

const FormularioMovimentacaoEmLinhas = ({
  tempMovements,
  onTempMovementsChange,
  onSaveAll,
  paymentMethods
}) => {
  const [expenseCategories, setExpenseCategories] = useState([]);
  const api = Api();
  
  // Refs for form fields to enable keyboard navigation
  const descRefs = useRef([]);
  const valorRefs = useRef([]);

  // Fetch expense categories when component mounts
  useEffect(() => {
    const fetchExpenseCategories = async () => {
      try {
        // In a real implementation, this would be an API call to get categories from Firebase
        // This is a placeholder for demo purposes
        const response = await api.getExpenseCategories();
        if (response && response.success) {
          setExpenseCategories(response.data);
        } else {
          // Fallback to hardcoded categories if API call fails
          setExpenseCategories([
            { id: 'aluguel', name: 'Aluguel do ponto comercial' },
            { id: 'salarios', name: 'Salários e encargos trabalhistas' },
            { id: 'energia', name: 'Conta de energia elétrica' },
            { id: 'agua', name: 'Conta de água e esgoto' },
            { id: 'internet', name: 'Internet e telefone' },
            { id: 'erp', name: 'Sistemas de gestão (ERP)' },
            { id: 'taxasPos', name: 'Taxas de máquinas de cartão (POS)' },
            { id: 'contabilidade', name: 'Contabilidade / Escritório de contabilidade' },
            { id: 'seguros', name: 'Seguros' },
            { id: 'associacoes', name: 'Mensalidades de associações ou sindicatos' },
            { id: 'estoque', name: 'Reposição de estoque / compras com fornecedores' },
            { id: 'impostos', name: 'Impostos sobre vendas' },
            { id: 'frete', name: 'Frete / transporte' },
            { id: 'manutencao', name: 'Manutenção e limpeza' },
            { id: 'marketing', name: 'Marketing e publicidade' },
            { id: 'embalagens', name: 'Embalagens' },
            { id: 'despesasBancarias', name: 'Despesas bancárias' }
          ]);
        }
      } catch (error) {
        console.error("Error fetching expense categories:", error);
        // Fallback to hardcoded categories in case of error
        setExpenseCategories([
          { id: 'aluguel', name: 'Aluguel do ponto comercial' },
          { id: 'salarios', name: 'Salários e encargos trabalhistas' },
          { id: 'energia', name: 'Conta de energia elétrica' },
          { id: 'agua', name: 'Conta de água e esgoto' },
          { id: 'internet', name: 'Internet e telefone' },
          { id: 'erp', name: 'Sistemas de gestão (ERP)' },
          { id: 'taxasPos', name: 'Taxas de máquinas de cartão (POS)' },
          { id: 'contabilidade', name: 'Contabilidade / Escritório de contabilidade' },
          { id: 'seguros', name: 'Seguros' },
          { id: 'associacoes', name: 'Mensalidades de associações ou sindicatos' },
          { id: 'estoque', name: 'Reposição de estoque / compras com fornecedores' },
          { id: 'impostos', name: 'Impostos sobre vendas' },
          { id: 'frete', name: 'Frete / transporte' },
          { id: 'manutencao', name: 'Manutenção e limpeza' },
          { id: 'marketing', name: 'Marketing e publicidade' },
          { id: 'embalagens', name: 'Embalagens' },
          { id: 'despesasBancarias', name: 'Despesas bancárias' }
        ]);
      }
    };

    fetchExpenseCategories();
  }, []);

  // Check if there's at least one cash payment line
  const hasDinheiro = tempMovements.some((mov) => mov.forma === 'dinheiro');

  // Group payment methods by category for better organization
  const groupedPaymentMethods = {
    debito: paymentMethods.filter(method => method.id.includes('debito') || method.category === 'debito'),
    credito: paymentMethods.filter(method => method.id.includes('credito') || method.category === 'credito'),
    pix: paymentMethods.filter(method => method.id.includes('pix') || method.category === 'pix'),
    ticket: paymentMethods.filter(method => method.id.includes('ticket') || method.category === 'ticket'),
    dinheiro: paymentMethods.filter(method => method.id === 'dinheiro')
  };

  // Returns an array with the names of missing fields for this line
  const getMissingFields = (mov) => {
    const missing = [];
    if (!mov.tipo) missing.push('Tipo');
    if (mov.tipo === 'entrada' && !mov.forma) missing.push('Forma de Pagamento');
    if (mov.tipo === 'saida' && !mov.expenseCategory) missing.push('Categoria de Despesa');
    if (!mov.valor) missing.push('Valor');
    if (!mov.descricao) missing.push('Descrição');
    
    // If it's cash payment, check for coin fields
    if (mov.forma === 'dinheiro') {
      if (!mov.moedasEntrada) missing.push('Entrada de Moedas');
      if (!mov.moedasSaida) missing.push('Saída de Moedas');
    }
    return missing;
  };

  // Add a new line
  const addNewLine = () => {
    const updated = [
      ...tempMovements,
      {
        tipo: 'entrada',
        forma: '',
        expenseCategory: '',
        valor: '',
        descricao: '',
        paymentStatus: 'realizado',
        moedasEntrada: '',
        moedasSaida: ''
      }
    ];
    onTempMovementsChange(updated);
  };

  // Remove a line (if there's more than one)
  const removeLine = (index) => {
    if (tempMovements.length === 1) return; // don't remove if it's the only one
    const updated = tempMovements.filter((_, idx) => idx !== index);
    onTempMovementsChange(updated);
  };

  // Update a field value for a specific line
  const handleChange = (index, field, value) => {
    const updated = [...tempMovements];
    
    // If changing the movement type, reset payment form or expense category
    if (field === 'tipo') {
      updated[index] = {
        ...updated[index],
        [field]: value,
        forma: '',
        expenseCategory: ''
      };
    } else {
      updated[index][field] = value;
    }
    
    onTempMovementsChange(updated);
  };

  // Save all items
  const handleSaveAll = () => {
    for (const [idx, mov] of tempMovements.entries()) {
      const missing = getMissingFields(mov);
      if (missing.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: `Linha ${idx + 1} está faltando: ${missing.join(', ')}`
        });
        return;
      }
    }
    onSaveAll(tempMovements);
  };

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tipo</TableCell>
            <TableCell>Forma/Categoria</TableCell>

            {/* Show coin columns if there's at least one cash entry */}
            {hasDinheiro && (
              <>
                <TableCell>Entrada de moedas</TableCell>
                <TableCell>Saída de moedas</TableCell>
              </>
            )}

            <TableCell>Valor</TableCell>
            <TableCell>Descrição</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tempMovements.map((mov, index) => (
            <TableRow key={index}>
              {/* Movement Type (Income/Expense) */}
              <TableCell>
                <TextField
                  select
                  name="tipo"
                  value={mov.tipo}
                  onChange={(e) => handleChange(index, 'tipo', e.target.value)}
                  SelectProps={{ native: true }}
                  size="small"
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </TextField>
              </TableCell>

              {/* Payment Method (for income) or Expense Category (for expense) */}
              <TableCell>
                {mov.tipo === 'entrada' ? (
                  <FormControl fullWidth>
                    <Select
                      size="small"
                      name="forma"
                      value={mov.forma || ""}
                      onChange={(e) => handleChange(index, 'forma', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Selecione</MenuItem>
                      
                      {/* Group payment methods by category */}
                      {groupedPaymentMethods.dinheiro.length > 0 && (
                        <MenuItem value="dinheiro">Dinheiro</MenuItem>
                      )}

                      {groupedPaymentMethods.debito.length > 0 && (
                        [
                          <MenuItem key="debito-header" disabled>
                            <Typography variant="caption" fontWeight="bold">DÉBITO</Typography>
                          </MenuItem>,
                          ...groupedPaymentMethods.debito.map(method => (
                            <MenuItem key={method.id} value={method.id}>
                              {method.label || method.name}
                            </MenuItem>
                          ))
                        ]
                      )}

                      {groupedPaymentMethods.credito.length > 0 && (
                        [
                          <MenuItem key="credito-header" disabled>
                            <Typography variant="caption" fontWeight="bold">CRÉDITO</Typography>
                          </MenuItem>,
                          ...groupedPaymentMethods.credito.map(method => (
                            <MenuItem key={method.id} value={method.id}>
                              {method.label || method.name}
                            </MenuItem>
                          ))
                        ]
                      )}

                      {groupedPaymentMethods.ticket.length > 0 && (
                        [
                          <MenuItem key="ticket-header" disabled>
                            <Typography variant="caption" fontWeight="bold">TICKET</Typography>
                          </MenuItem>,
                          ...groupedPaymentMethods.ticket.map(method => (
                            <MenuItem key={method.id} value={method.id}>
                              {method.label || method.name}
                            </MenuItem>
                          ))
                        ]
                      )}

                      {groupedPaymentMethods.pix.length > 0 && (
                        [
                          <MenuItem key="pix-header" disabled>
                            <Typography variant="caption" fontWeight="bold">PIX</Typography>
                          </MenuItem>,
                          ...groupedPaymentMethods.pix.map(method => (
                            <MenuItem key={method.id} value={method.id}>
                              {method.label || method.name}
                            </MenuItem>
                          ))
                        ]
                      )}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl fullWidth>
                    <Select
                      size="small"
                      name="expenseCategory"
                      value={mov.expenseCategory || ""}
                      onChange={(e) => handleChange(index, 'expenseCategory', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>Selecione</MenuItem>
                      {expenseCategories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </TableCell>

              {/* Only render the coin cells if hasDinheiro is true */}
              {hasDinheiro && (
                <>
                  <TableCell>
                    {mov.forma === 'dinheiro' ? (
                      <TextField
                        type="number"
                        value={mov.moedasEntrada || ''}
                        onChange={(e) => handleChange(index, 'moedasEntrada', e.target.value)}
                        placeholder="Entrada de moedas"
                        size="small"
                      />
                    ) : (
                      // If not cash, show disabled field
                      <TextField
                        disabled
                        placeholder="-"
                        size="small"
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    {mov.forma === 'dinheiro' ? (
                      <TextField
                        type="number"
                        value={mov.moedasSaida || ''}
                        onChange={(e) => handleChange(index, 'moedasSaida', e.target.value)}
                        placeholder="Saída de moedas"
                        size="small"
                      />
                    ) : (
                      <TextField
                        disabled
                        placeholder="-"
                        size="small"
                      />
                    )}
                  </TableCell>
                </>
              )}

              {/* Value */}
              <TableCell>
                <TextField
                  inputRef={(el) => {
                    valorRefs.current[index] = el;
                  }}
                  name="valor"
                  value={mov.valor}
                  onChange={(e) => handleChange(index, 'valor', e.target.value)}
                  size="small"
                  type="number"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // On Enter in Value field, focus the Description field in the same row
                      descRefs.current[index]?.focus();
                    }
                  }}
                />
              </TableCell>

              {/* Description (Enter -> jump to next row's Value) */}
              <TableCell>
                <TextField
                  inputRef={(el) => {
                    descRefs.current[index] = el;
                  }}
                  name="descricao"
                  value={mov.descricao}
                  onChange={(e) => handleChange(index, 'descricao', e.target.value)}
                  size="small"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Check if current row is valid
                      const missing = getMissingFields(mov);
                      if (missing.length > 0) {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Atenção',
                          text: `Preencha os campos obrigatórios antes de adicionar nova linha.\nFaltando: ${missing.join(', ')}` 
                        });
                        return;
                      }

                      // Only create new row if this is the last one
                      if (index === tempMovements.length - 1) {
                        addNewLine();
                        // After creating, wait for new row to render
                        // and focus the Value field of the new row
                        setTimeout(() => {
                          valorRefs.current[index + 1]?.focus();
                        }, 100);
                      } else {
                        // If not the last row, focus the Value field of the next row
                        valorRefs.current[index + 1]?.focus();
                      }
                    }
                  }}
                />
              </TableCell>

              {/* Remove row button */}
              <TableCell>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => removeLine(index)}
                  disabled={tempMovements.length === 1}
                >
                  Remover
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box mt={2} display="flex" gap={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={addNewLine}
        >
          Adicionar Linha
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveAll}
        >
          Salvar Todos
        </Button>
      </Box>
    </Box>
  );
};

export default FormularioMovimentacaoEmLinhas;    