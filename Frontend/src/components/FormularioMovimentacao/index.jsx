import { useState, useEffect } from "react";
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  FormHelperText,
  InputAdornment,
  Divider,
  Typography,
  IconButton
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import Api from "../../helpers/Api";

const FormularioMovimentacao = ({
  newMovement,
  setNewMovement,
  paymentMethods,
  onAddMovement,
  loading
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const api = Api();

  // Fetch expense categories from Firebase on component mount
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

  // Group payment methods by category for better organization
  const groupedPaymentMethods = {
    debito: paymentMethods.filter(method => method.id.includes('debito') || method.category === 'debito'),
    credito: paymentMethods.filter(method => method.id.includes('credito') || method.category === 'credito'),
    pix: paymentMethods.filter(method => method.id.includes('pix') || method.category === 'pix'),
    ticket: paymentMethods.filter(method => method.id.includes('ticket') || method.category === 'ticket'),
    dinheiro: paymentMethods.filter(method => method.id === 'dinheiro')
  };

  // Verifica se os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    // For entrada (income), payment method and amount are required
    if (newMovement.type === 'entrada') {
      return newMovement.paymentMethod && newMovement.amount;
    }
    // For saida (expense), expense category and amount are required
    else {
      return newMovement.expenseCategory && newMovement.amount;
    }
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      event.target.value = null;
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleAddMovementClick = () => {
    onAddMovement(selectedImage);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        bgcolor: "#f9fafb",
        borderRadius: 1,
        border: "1px solid #e0e0e0"
      }}
    >
      {/* Type of Movement: Income or Expense */}
      <FormControl>
        <FormLabel id="movement-type-label">Tipo de Movimentação</FormLabel>
        <RadioGroup
          row
          aria-labelledby="movement-type-label"
          value={newMovement.type}
          onChange={(e) =>
            setNewMovement({
              ...newMovement,
              type: e.target.value,
              // Clear the payment method or expense category when changing types
              paymentMethod: '',
              expenseCategory: ''
            })
          }
        >
          <FormControlLabel value="entrada" control={<Radio />} label="Entrada" />
          <FormControlLabel value="saida" control={<Radio />} label="Saída" />
        </RadioGroup>
      </FormControl>

      {/* Status of Payment (only for income) */}
      {newMovement.type === "entrada" && (
        <FormControl required error={!newMovement.paymentStatus}>
          <FormLabel id="payment-status-label">Status do Pagamento</FormLabel>
          <RadioGroup
            row
            aria-labelledby="payment-status-label"
            value={newMovement.paymentStatus || ""}
            onChange={(e) =>
              setNewMovement({ ...newMovement, paymentStatus: e.target.value })
            }
          >
            <FormControlLabel
              value="realizado"
              control={<Radio />}
              label="Valor Recebido"
            />
            <FormControlLabel
              value="pendente"
              control={<Radio />}
              label="Pendente de Recebimento"
            />
          </RadioGroup>
          {!newMovement.paymentStatus && (
            <FormHelperText>Status do pagamento é obrigatório</FormHelperText>
          )}
        </FormControl>
      )}

      <Divider />

      {/* Different inputs based on movement type (income or expense) */}
      {newMovement.type === "entrada" ? (
        /* Payment Method (for income) */
        <FormControl fullWidth required error={!newMovement.paymentMethod}>
          <FormLabel>Forma de Pagamento</FormLabel>
          <Select
            value={newMovement.paymentMethod || ""}
            onChange={(e) =>
              setNewMovement({ ...newMovement, paymentMethod: e.target.value })
            }
            displayEmpty
          >
            <MenuItem value="" disabled>
              Selecione uma forma de pagamento
            </MenuItem>

            {/* Group by payment method categories */}
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
          {!newMovement.paymentMethod && (
            <FormHelperText>Forma de pagamento é obrigatória</FormHelperText>
          )}
        </FormControl>
      ) : (
        /* Expense Category (for expenses) */
        <FormControl fullWidth required error={!newMovement.expenseCategory}>
          <FormLabel>Categoria de Despesa</FormLabel>
          <Select
            value={newMovement.expenseCategory || ""}
            onChange={(e) =>
              setNewMovement({ ...newMovement, expenseCategory: e.target.value })
            }
            displayEmpty
          >
            <MenuItem value="" disabled>
              Selecione uma categoria de despesa
            </MenuItem>
            {expenseCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
          {!newMovement.expenseCategory && (
            <FormHelperText>Categoria de despesa é obrigatória</FormHelperText>
          )}
        </FormControl>
      )}

      {/* Coin entry/exit fields only for cash payments */}
      {newMovement.type === "entrada" && newMovement.paymentMethod === "dinheiro" && (
        <>
          <FormControl fullWidth>
            <FormLabel>Entrada de moedas</FormLabel>
            <TextField
              type="number"
              value={newMovement.moedasEntrada || ""}
              onChange={(e) =>
                setNewMovement({ ...newMovement, moedasEntrada: e.target.value })
              }
              placeholder="Quantidade de moedas que entrou"
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                inputProps: {
                  step: "0.01",
                  min: "0.01"
                }
              }}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Saída de moedas</FormLabel>
            <TextField
              type="number"
              value={newMovement.moedasSaida || ""}
              onChange={(e) =>
                setNewMovement({ ...newMovement, moedasSaida: e.target.value })
              }
              placeholder="Quantidade de moedas que saiu"
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                inputProps: {
                  step: "0.01",
                  min: "0.01"
                }
              }}
            />
          </FormControl>
        </>
      )}

      {/* Value */}
      <FormControl fullWidth required error={!newMovement.amount}>
        <FormLabel>Valor</FormLabel>
        <TextField
          type="number"
          value={newMovement.amount || ""}
          onChange={(e) =>
            setNewMovement({ ...newMovement, amount: e.target.value })
          }
          placeholder="0,00"
          InputProps={{
            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            inputProps: {
              step: "0.01",
              min: "0.01"
            }
          }}
        />
        {!newMovement.amount && (
          <FormHelperText>Valor é obrigatório</FormHelperText>
        )}
      </FormControl>

      {/* Description */}
      <FormControl fullWidth>
        <FormLabel>Descrição</FormLabel>
        <TextField
          value={newMovement.description || ""}
          onChange={(e) =>
            setNewMovement({ ...newMovement, description: e.target.value })
          }
          multiline
          rows={2}
          placeholder="Adicione uma descrição (opcional)"
        />
      </FormControl>

      {/* Additional fields for Ticket payment method */}
      {newMovement.type === "entrada" && newMovement.paymentMethod && newMovement.paymentMethod.includes("ticket") && (
        <>
          <FormControl
            fullWidth
            required
            error={!newMovement.clientName}
          >
            <FormLabel>Nome do Cliente</FormLabel>
            <TextField
              value={newMovement.clientName || ""}
              onChange={(e) =>
                setNewMovement({ ...newMovement, clientName: e.target.value })
              }
              placeholder="Nome do cliente"
            />
            {!newMovement.clientName && (
              <FormHelperText>
                Nome do cliente é obrigatório para Ticket
              </FormHelperText>
            )}
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Número do Documento</FormLabel>
            <TextField
              value={newMovement.documentNumber || ""}
              onChange={(e) =>
                setNewMovement({ ...newMovement, documentNumber: e.target.value })
              }
              placeholder="Número do documento (opcional)"
            />
          </FormControl>
        </>
      )}

      {/* Image Upload */}
      <Box>
        <FormLabel>Adicionar imagem (opcional)</FormLabel>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCamera />}
          >
            Upload
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={handleImageChange}
            />
          </Button>

          {selectedImage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Preview"
                style={{
                  width: 50,
                  height: 50,
                  objectFit: "cover",
                  borderRadius: 4,
                  border: "1px solid #ccc"
                }}
              />
              <Typography variant="body2">{selectedImage.name}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={handleRemoveImage}
                aria-label="remover imagem"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      {/* Add Button */}
      <Button
        variant="contained"
        onClick={handleAddMovementClick}
        startIcon={<AddCircleIcon />}
        disabled={!isFormValid() || loading}
        sx={{
          bgcolor: "#FEC32E",
          "&:hover": {
            bgcolor: "#e6b32a"
          },
          mt: 2
        }}
      >
        {loading ? "Processando..." : "Adicionar Movimentação"}
      </Button>
    </Box>
  );
};

export default FormularioMovimentacao;