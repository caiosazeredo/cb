import React, { useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody 
} from '@mui/material';
import Swal from 'sweetalert2';

const FormularioMovimentacaoEmLinhas = ({
  tempMovements,
  onTempMovementsChange,
  onSaveAll,
  paymentMethods
}) => {
  // Refs para o campo Descrição (descRefs) e para o campo Valor (valorRefs)
  const descRefs = useRef([]);
  const valorRefs = useRef([]);

  // Verifica se existe ao menos uma linha em que .forma === 'dinheiro' (para exibir cols de moedas)
  const hasDinheiro = tempMovements.some((mov) => mov.forma === 'dinheiro');

  // Retorna um array com os nomes dos campos que estão faltando nessa linha
  const getMissingFields = (mov) => {
    const missing = [];
    if (!mov.tipo) missing.push('Tipo');
    if (!mov.forma) missing.push('Forma de Pagamento');
    if (!mov.valor) missing.push('Valor');
    if (!mov.descricao) missing.push('Descrição');
    
    // Se for 'dinheiro', podemos exigir moedasEntrada e moedasSaida
    if (mov.forma === 'dinheiro') {
      if (!mov.moedasEntrada) missing.push('Entrada de Moedas');
      if (!mov.moedasSaida) missing.push('Saída de Moedas');
    }
    return missing;
  };

  // Adiciona uma nova linha
  const addNewLine = () => {
    const updated = [
      ...tempMovements,
      {
        tipo: 'entrada',
        forma: '',
        valor: '',
        descricao: '',
        paymentStatus: 'realizado',
        moedasEntrada: '',
        moedasSaida: ''
      }
    ];
    onTempMovementsChange(updated);
  };

  // Remove uma linha (se tiver mais de uma)
  const removeLine = (index) => {
    if (tempMovements.length === 1) return; // não remove se for a única
    const updated = tempMovements.filter((_, idx) => idx !== index);
    onTempMovementsChange(updated);
  };

  // Atualiza o valor de um campo em uma linha específica
  const handleChange = (index, field, value) => {
    const updated = [...tempMovements];
    updated[index][field] = value;
    onTempMovementsChange(updated);
  };

  // Salva todos os itens
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
            <TableCell>Forma Pagamento</TableCell>

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
              {/* Tipo (Entrada/Saída) */}
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

              {/* Forma de Pagamento (listando pm.name como label e pm.id como value) */}
              <TableCell>
                <TextField
                  select
                  name="forma"
                  value={mov.forma}
                  onChange={(e) => handleChange(index, 'forma', e.target.value)}
                  SelectProps={{ native: true }}
                  size="small"
                >
                  <option value="">Selecione</option>
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </TextField>
              </TableCell>

              {/* Entrada/Saída de moedas - só mostra se for 'dinheiro' */}
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

              {/* Valor */}
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
                      // Ao pressionar Enter em Valor, focamos a Descrição da mesma linha
                      descRefs.current[index]?.focus();
                    }
                  }}
                />
              </TableCell>

              {/* Descrição (Enter -> pula pro Valor da próxima linha) */}
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
                      // Verifica se linha atual está válida
                      const missing = getMissingFields(mov);
                      if (missing.length > 0) {
                        Swal.fire({
                          icon: 'warning',
                          title: 'Atenção',
                          text: `Preencha os campos obrigatórios antes de adicionar nova linha.\nFaltando: ${missing.join(', ')}`
                        });
                        return;
                      }

                      // Se estiver na última linha, cria nova
                      if (index === tempMovements.length - 1) {
                        addNewLine();
                        // Aguarda a nova linha ser renderizada e foca o Valor dela
                        setTimeout(() => {
                          valorRefs.current[index + 1]?.focus();
                        }, 100);
                      } else {
                        // Se não for a última linha, foca o campo Valor da próxima linha
                        valorRefs.current[index + 1]?.focus();
                      }
                    }
                  }}
                />
              </TableCell>

              {/* Botão remover linha */}
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
