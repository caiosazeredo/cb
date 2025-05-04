import { useState, useMemo } from "react";
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

// Recebemos agora também allPaymentMethods
const FormularioMovimentacao = ({
  newMovement,
  setNewMovement,
  onAddMovement,
  loading,
  allPaymentMethods
}) => {
  // Estado local para a imagem selecionada (opcional)
  const [selectedImage, setSelectedImage] = useState(null);

  // Categorias fixas que você quer exibir como "select" principal
  const paymentCategories = [
    { value: "dinheiro", label: "Dinheiro" },
    { value: "credito", label: "Cartão de Crédito" },
    { value: "debito", label: "Cartão de Débito" },
    { value: "pix", label: "PIX" },
    { value: "ticket", label: "Ticket" }
  ];

  // Filtra da lista total somente os métodos que pertençam à categoria selecionada
  const filteredMethods = useMemo(() => {
    if (!newMovement.paymentCategory) return [];
    return allPaymentMethods.filter(
      (m) => m.category === newMovement.paymentCategory
    );
  }, [allPaymentMethods, newMovement.paymentCategory]);

  // Verifica se os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    if (!newMovement.paymentCategory) return false;
    if (!newMovement.paymentMethodId) return false;
    if (!newMovement.amount) return false;
    if (newMovement.type === "entrada" && !newMovement.paymentStatus) return false;
    return true;
  };

  // Lida com a seleção do arquivo no input type="file"
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      event.target.value = null;
    }
  };

  // Quando clicar no botão "Adicionar Movimentação"
  const handleAddMovementClick = () => {
    onAddMovement(selectedImage);
  };

  // Remove a imagem do estado local
  const handleRemoveImage = () => {
    setSelectedImage(null);
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
      {/* Tipo de Movimentação: Entrada ou Saída */}
      <FormControl>
        <FormLabel id="movement-type-label">Tipo de Movimentação</FormLabel>
        <RadioGroup
          row
          aria-labelledby="movement-type-label"
          value={newMovement.type}
          onChange={(e) =>
            setNewMovement({ ...newMovement, type: e.target.value })
          }
        >
          <FormControlLabel value="entrada" control={<Radio />} label="Entrada" />
          <FormControlLabel value="saida" control={<Radio />} label="Saída" />
        </RadioGroup>
      </FormControl>

      {/* Status de Pagamento (apenas para entradas) */}
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

      {/* Select principal - categoria (dinheiro, crédito, débito, pix, ticket) */}
      <FormControl fullWidth required>
        <FormLabel>Categoria de Pagamento</FormLabel>
        <Select
          value={newMovement.paymentCategory || ""}
          onChange={(e) =>
            setNewMovement({
              ...newMovement,
              paymentCategory: e.target.value,
              paymentMethodId: "" // Limpa o método específico ao alterar a categoria
            })
          }
          displayEmpty
        >
          <MenuItem value="" disabled>
            Selecione a categoria
          </MenuItem>
          {paymentCategories.map((cat) => (
            <MenuItem key={cat.value} value={cat.value}>
              {cat.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Select para exibir os métodos filtrados pela categoria */}
      {newMovement.paymentCategory && (
        <FormControl fullWidth required>
          <FormLabel>Forma de Pagamento</FormLabel>
          <Select
            value={newMovement.paymentMethodId || ""}
            onChange={(e) =>
              setNewMovement({ ...newMovement, paymentMethodId: e.target.value })
            }
            displayEmpty
          >
            <MenuItem value="" disabled>
              Selecione a forma exata
            </MenuItem>
            {filteredMethods.map((method) => (
              <MenuItem key={method.id} value={method.id}>
                {method.name}
              </MenuItem>
            ))}
          </Select>
          {!newMovement.paymentMethodId && (
            <FormHelperText>Forma de pagamento é obrigatória</FormHelperText>
          )}
        </FormControl>
      )}

      {/* Se for "dinheiro", exibe campos para entrada/saída de moedas */}
      {newMovement.paymentCategory === "dinheiro" && (
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

      {/* Campo Valor */}
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

      {/* Descrição */}
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

      {/* Se for categoria "ticket", exibe Nome do Cliente e Documento */}
      {newMovement.paymentCategory === "ticket" && (
        <>
          <FormControl fullWidth required>
            <FormLabel>Nome do Cliente</FormLabel>
            <TextField
              value={newMovement.clientName || ""}
              onChange={(e) =>
                setNewMovement({ ...newMovement, clientName: e.target.value })
              }
              placeholder="Nome do cliente (obrigatório para Ticket)"
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Número do Documento (opcional)</FormLabel>
            <TextField
              value={newMovement.documentNumber || ""}
              onChange={(e) =>
                setNewMovement({ ...newMovement, documentNumber: e.target.value })
              }
              placeholder="Número do documento"
            />
          </FormControl>
        </>
      )}

      {/* Upload de imagem (opcional - ESTÁ FUNCIONANDO) */}
      {/*
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
      */}

      {/* Botão de "Adicionar Movimentação" */}
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
