import { useState } from "react";
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

const FormularioMovimentacao = ({
  newMovement,
  setNewMovement,
  paymentMethods,
  onAddMovement,
  loading
}) => {
  // Estado local para armazenar a imagem selecionada (não é obrigatório)
  const [selectedImage, setSelectedImage] = useState(null);

  // Verifica se os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    return (
      newMovement.paymentMethod &&
      newMovement.amount &&
      newMovement.paymentStatus
    );
  };

  // Lida com a seleção do arquivo no input type="file"
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      event.target.value = null;
    }
  };

  // Quando clicar no botão "Adicionar Movimentação", chamamos
  // a função recebida (onAddMovement) passando também a imagem
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

      {/* Forma de Pagamento */}
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
          {paymentMethods.map((method) => (
            <MenuItem key={method.id} value={method.id}>
              {method.label}
            </MenuItem>
          ))}
        </Select>
        {!newMovement.paymentMethod && (
          <FormHelperText>Forma de pagamento é obrigatória</FormHelperText>
        )}
      </FormControl>

      {/* Se for DINHEIRO, exibe campos de Entrada/Saída de moedas */}
      {newMovement.paymentMethod === "dinheiro" && (
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

      {/* Valor */}
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

      {/* Campos adicionais para TICKET */}
      {newMovement.paymentMethod === "ticket" && (
        <>
          <FormControl
            fullWidth
            required
            error={!newMovement.clientName && newMovement.paymentMethod === "ticket"}
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

      {/* Botão de Upload da Imagem (opcional) */}
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

          {/* Se o usuário escolheu uma imagem, exibir miniatura, nome e botão de remover */}
          {selectedImage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Mini visualização da imagem */}
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

      {/* Botão de Adicionar */}
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
